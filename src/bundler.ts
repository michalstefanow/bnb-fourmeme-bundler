import { ethers } from 'ethers';
import { WalletManager } from './walletManager';
import { Config } from './config';
import {
  PANCAKE_ROUTER_ABI,
  ERC20_ABI,
  calculateMinAmountOut,
  getDeadline,
  formatTokenAmount,
  sleep,
} from './utils';

export class Bundler {
  private walletManager: WalletManager;
  private config: Config;
  private pancakeRouter: ethers.Contract;

  constructor(walletManager: WalletManager, config: Config) {
    this.walletManager = walletManager;
    this.config = config;
    
    const provider = walletManager.getProvider();
    this.pancakeRouter = new ethers.Contract(
      config.pancakeRouter,
      PANCAKE_ROUTER_ABI,
      provider
    );
  }

  async getTokenInfo(tokenAddress: string): Promise<{
    symbol: string;
    decimals: number;
  }> {
    const provider = this.walletManager.getProvider();
    const tokenContract = new ethers.Contract(tokenAddress, ERC20_ABI, provider);
    
    const [symbol, decimals] = await Promise.all([
      tokenContract.symbol(),
      tokenContract.decimals(),
    ]);

    return { symbol, decimals };
  }

  async estimateTokensOut(amountBNB: string, tokenAddress: string): Promise<bigint> {
    try {
      const wethAddress = await this.pancakeRouter.WETH();
      const path = [wethAddress, tokenAddress];
      const amountIn = ethers.parseEther(amountBNB);
      
      const amounts = await this.pancakeRouter.getAmountsOut(amountIn, path);
      return amounts[1];
    } catch (error) {
      console.warn('⚠️  Could not estimate tokens out, using 0 as min amount');
      return 0n;
    }
  }

  async executeBundleBuy(): Promise<void> {
    const bundlerWallets = this.walletManager.getBundlerWallets();
    const tokenAddress = this.config.tokenAddress;
    const buyAmountBNB = this.config.buyAmountBNB;

    console.log('\n🎯 Starting Bundle Buy...\n');

    // Get token info
    let tokenInfo;
    try {
      tokenInfo = await this.getTokenInfo(tokenAddress);
      console.log(`Token: ${tokenInfo.symbol}`);
      console.log(`Decimals: ${tokenInfo.decimals}\n`);
    } catch (error) {
      console.warn('⚠️  Could not fetch token info, continuing anyway...\n');
      tokenInfo = { symbol: 'UNKNOWN', decimals: 18 };
    }

    // Estimate expected tokens
    const estimatedTokens = await this.estimateTokensOut(buyAmountBNB, tokenAddress);
    if (estimatedTokens > 0n) {
      console.log(`📊 Estimated tokens per buy: ${formatTokenAmount(estimatedTokens, tokenInfo.decimals)} ${tokenInfo.symbol}\n`);
    }

    // Get WETH address for swap path
    const wethAddress = await this.pancakeRouter.WETH();
    const path = [wethAddress, tokenAddress];

    console.log('🔄 Preparing transactions...\n');

    // Prepare all transactions
    const transactions = await Promise.all(
      bundlerWallets.map(async (wallet, index) => {
        const amountIn = ethers.parseEther(buyAmountBNB);
        const minAmountOut = calculateMinAmountOut(
          estimatedTokens > 0n ? estimatedTokens : amountIn,
          this.config.slippagePercent
        );
        const deadline = getDeadline(20);

        const routerWithSigner = this.pancakeRouter.connect(wallet) as ethers.Contract;

        // Build transaction
        const tx = await routerWithSigner.swapExactETHForTokensSupportingFeeOnTransferTokens.populateTransaction(
          minAmountOut,
          path,
          wallet.address,
          deadline,
          { value: amountIn, gasLimit: this.config.gasLimit }
        );

        // Set gas price
        const gasPrice = ethers.parseUnits(this.config.gasPriceGwei.toString(), 'gwei');
        tx.gasPrice = gasPrice;

        return { wallet, tx, index };
      })
    );

    console.log(`✅ ${transactions.length} transactions prepared\n`);
    console.log('🚀 Executing bundle...\n');

    // Execute all transactions simultaneously
    const executionPromises = transactions.map(async ({ wallet, tx, index }) => {
      try {
        const startTime = Date.now();
        const txResponse = await wallet.sendTransaction(tx);
        const sendTime = Date.now() - startTime;
        
        console.log(`📤 Wallet ${index + 1}: Transaction sent in ${sendTime}ms`);
        console.log(`   Hash: ${txResponse.hash}`);

        const receipt = await txResponse.wait();
        const totalTime = Date.now() - startTime;
        
        if (receipt && receipt.status === 1) {
          console.log(`✅ Wallet ${index + 1}: Success! (${totalTime}ms total)`);
          return { success: true, wallet: wallet.address, hash: txResponse.hash };
        } else {
          console.log(`❌ Wallet ${index + 1}: Transaction failed`);
          return { success: false, wallet: wallet.address, hash: txResponse.hash };
        }
      } catch (error: any) {
        console.error(`❌ Wallet ${index + 1}: Error - ${error.message}`);
        return { success: false, wallet: wallet.address, error: error.message };
      }
    });

    const results = await Promise.all(executionPromises);

    // Summary
    console.log('\n' + '='.repeat(60));
    console.log('📊 Bundle Execution Summary');
    console.log('='.repeat(60));

    const successful = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;

    console.log(`✅ Successful: ${successful}/${results.length}`);
    console.log(`❌ Failed: ${failed}/${results.length}`);

    if (successful > 0) {
      console.log('\n🎉 Bundle executed successfully!');
      console.log('\n💎 Token Balances:');
      await this.displayTokenBalances(tokenAddress, tokenInfo);
    }

    console.log('\n' + '='.repeat(60) + '\n');
  }

  async displayTokenBalances(tokenAddress: string, tokenInfo: { symbol: string; decimals: number }): Promise<void> {
    const bundlerWallets = this.walletManager.getBundlerWallets();
    const provider = this.walletManager.getProvider();
    const tokenContract = new ethers.Contract(tokenAddress, ERC20_ABI, provider);

    let totalBalance = 0n;

    for (let i = 0; i < bundlerWallets.length; i++) {
      const wallet = bundlerWallets[i];
      try {
        const balance = await tokenContract.balanceOf(wallet.address);
        totalBalance += balance;
        const formatted = formatTokenAmount(balance, tokenInfo.decimals);
        console.log(`  Wallet ${i + 1}: ${formatted} ${tokenInfo.symbol}`);
      } catch (error) {
        console.log(`  Wallet ${i + 1}: Error reading balance`);
      }
    }

    const totalFormatted = formatTokenAmount(totalBalance, tokenInfo.decimals);
    console.log(`\n  📈 Total: ${totalFormatted} ${tokenInfo.symbol}`);
  }

  async checkTokenBalances(): Promise<void> {
    const tokenAddress = this.config.tokenAddress;
    
    console.log('\n💎 Checking Token Balances...\n');

    try {
      const tokenInfo = await this.getTokenInfo(tokenAddress);
      console.log(`Token: ${tokenInfo.symbol}`);
      console.log(`Address: ${tokenAddress}\n`);
      
      await this.displayTokenBalances(tokenAddress, tokenInfo);
    } catch (error: any) {
      console.error(`❌ Error checking balances: ${error.message}`);
    }

    console.log();
  }
}

