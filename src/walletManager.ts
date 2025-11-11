import { ethers } from 'ethers';
import { Config } from './config';

export class WalletManager {
  private provider: ethers.JsonRpcProvider;
  private masterWallet: ethers.Wallet;
  private bundlerWallets: ethers.Wallet[];

  constructor(config: Config) {
    this.provider = new ethers.JsonRpcProvider(config.rpcUrl);
    this.masterWallet = new ethers.Wallet(config.masterPrivateKey, this.provider);
    this.bundlerWallets = config.bundlerPrivateKeys.map(
      key => new ethers.Wallet(key, this.provider)
    );
  }

  getMasterWallet(): ethers.Wallet {
    return this.masterWallet;
  }

  getBundlerWallets(): ethers.Wallet[] {
    return this.bundlerWallets;
  }

  getProvider(): ethers.JsonRpcProvider {
    return this.provider;
  }

  async getWalletBalance(wallet: ethers.Wallet): Promise<bigint> {
    return await this.provider.getBalance(wallet.address);
  }

  async fundWallets(amountBNB: string): Promise<void> {
    console.log(`\n💰 Funding ${this.bundlerWallets.length} bundler wallets...`);
    
    const masterBalance = await this.getWalletBalance(this.masterWallet);
    const amountWei = ethers.parseEther(amountBNB);
    const totalNeeded = amountWei * BigInt(this.bundlerWallets.length);

    console.log(`Master wallet: ${this.masterWallet.address}`);
    console.log(`Master balance: ${ethers.formatEther(masterBalance)} BNB`);
    console.log(`Total needed: ${ethers.formatEther(totalNeeded)} BNB`);

    if (masterBalance < totalNeeded) {
      throw new Error(`Insufficient master wallet balance. Need ${ethers.formatEther(totalNeeded)} BNB, have ${ethers.formatEther(masterBalance)} BNB`);
    }

    const fundingPromises = this.bundlerWallets.map(async (wallet, index) => {
      try {
        const balance = await this.getWalletBalance(wallet);
        console.log(`Wallet ${index + 1} (${wallet.address}): ${ethers.formatEther(balance)} BNB`);

        if (balance < amountWei) {
          const amountToSend = amountWei - balance;
          console.log(`  ➡️  Sending ${ethers.formatEther(amountToSend)} BNB...`);
          
          const tx = await this.masterWallet.sendTransaction({
            to: wallet.address,
            value: amountToSend,
          });
          
          await tx.wait();
          console.log(`  ✅ Funded wallet ${index + 1}`);
        } else {
          console.log(`  ✅ Wallet ${index + 1} already funded`);
        }
      } catch (error) {
        console.error(`  ❌ Error funding wallet ${index + 1}:`, error);
        throw error;
      }
    });

    await Promise.all(fundingPromises);
    console.log('✅ All wallets funded successfully!\n');
  }

  async displayBalances(): Promise<void> {
    console.log('\n💼 Wallet Balances:');
    console.log('==================');
    
    const masterBalance = await this.getWalletBalance(this.masterWallet);
    console.log(`Master: ${this.masterWallet.address}`);
    console.log(`  Balance: ${ethers.formatEther(masterBalance)} BNB\n`);

    for (let i = 0; i < this.bundlerWallets.length; i++) {
      const wallet = this.bundlerWallets[i];
      const balance = await this.getWalletBalance(wallet);
      console.log(`Bundler ${i + 1}: ${wallet.address}`);
      console.log(`  Balance: ${ethers.formatEther(balance)} BNB`);
    }
    console.log('==================\n');
  }
}

