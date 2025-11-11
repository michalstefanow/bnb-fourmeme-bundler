import { loadConfig } from './config';
import { WalletManager } from './walletManager';
import { Bundler } from './bundler';
import { displayBanner, displaySummary, sleep } from './utils';

async function main() {
  try {
    displayBanner();

    // Load configuration
    console.log('⚙️  Loading configuration...\n');
    const config = loadConfig();

    // Display configuration summary
    displaySummary(
      config.tokenAddress,
      config.buyAmountBNB,
      config.bundlerPrivateKeys.length,
      config.slippagePercent
    );

    // Initialize wallet manager
    console.log('🔑 Initializing wallets...\n');
    const walletManager = new WalletManager(config);

    // Display current balances
    await walletManager.displayBalances();

    // Fund wallets if needed
    console.log('💰 Checking if wallets need funding...\n');
    await walletManager.fundWallets(config.buyAmountBNB);

    // Display balances after funding
    await walletManager.displayBalances();

    // Initialize bundler
    const bundler = new Bundler(walletManager, config);

    // Confirm before executing
    console.log('⚠️  READY TO EXECUTE BUNDLE!');
    console.log('⚠️  This will buy tokens with all bundler wallets simultaneously.\n');
    
    // Wait a moment for user to review
    console.log('Starting in 3 seconds...\n');
    await sleep(3000);

    // Execute the bundle
    await bundler.executeBundleBuy();

    // Final summary
    console.log('✨ Bundle operation completed!\n');

  } catch (error: any) {
    console.error('\n❌ Error:', error.message);
    console.error('\nStack trace:', error.stack);
    process.exit(1);
  }
}

// Handle uncaught errors
process.on('unhandledRejection', (error: any) => {
  console.error('❌ Unhandled rejection:', error.message);
  process.exit(1);
});

process.on('uncaughtException', (error: any) => {
  console.error('❌ Uncaught exception:', error.message);
  process.exit(1);
});

// Run the bot
main();

