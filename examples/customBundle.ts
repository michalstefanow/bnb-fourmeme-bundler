/**
 * Example: Custom Bundle Script
 * 
 * This shows how to use the bundler programmatically with custom logic
 */

import { loadConfig } from '../src/config';
import { WalletManager } from '../src/walletManager';
import { Bundler } from '../src/bundler';

async function customBundle() {
  try {
    console.log('🎯 Custom Bundle Example\n');

    // Load config
    const config = loadConfig();

    // Override config programmatically if needed
    config.buyAmountBNB = '0.005'; // Smaller test amount
    config.slippagePercent = 25;

    console.log(`📊 Config:`);
    console.log(`  Token: ${config.tokenAddress}`);
    console.log(`  Buy Amount: ${config.buyAmountBNB} BNB`);
    console.log(`  Wallets: ${config.bundlerPrivateKeys.length}`);
    console.log(`  Slippage: ${config.slippagePercent}%\n`);

    // Initialize
    const walletManager = new WalletManager(config);
    const bundler = new Bundler(walletManager, config);

    // Check balances first
    console.log('💰 Checking balances...\n');
    await walletManager.displayBalances();

    // Fund if needed
    console.log('💸 Funding wallets...\n');
    await walletManager.fundWallets(config.buyAmountBNB);

    // You could add custom logic here, such as:
    // - Waiting for a specific time
    // - Checking token liquidity
    // - Monitoring token price
    // - Adding conditional logic

    // Execute bundle
    console.log('🚀 Executing bundle...\n');
    await bundler.executeBundleBuy();

    // Check results
    console.log('✅ Bundle complete!\n');
    await bundler.checkTokenBalances();

  } catch (error: any) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

customBundle();

