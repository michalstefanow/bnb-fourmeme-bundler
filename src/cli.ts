import { loadConfig } from './config';
import { WalletManager } from './walletManager';
import { Bundler } from './bundler';
import { displayBanner } from './utils';

// CLI tool for various bot operations
async function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  try {
    displayBanner();

    const config = loadConfig();
    const walletManager = new WalletManager(config);
    const bundler = new Bundler(walletManager, config);

    switch (command) {
      case 'balances':
        await walletManager.displayBalances();
        break;

      case 'fund':
        await walletManager.fundWallets(config.buyAmountBNB);
        await walletManager.displayBalances();
        break;

      case 'tokens':
        await bundler.checkTokenBalances();
        break;

      case 'bundle':
        await walletManager.displayBalances();
        await walletManager.fundWallets(config.buyAmountBNB);
        await bundler.executeBundleBuy();
        break;

      case 'help':
      default:
        console.log('📋 Available commands:\n');
        console.log('  balances  - Display BNB balances for all wallets');
        console.log('  fund      - Fund bundler wallets from master wallet');
        console.log('  tokens    - Display token balances for all wallets');
        console.log('  bundle    - Execute the bundle buy');
        console.log('  help      - Show this help message\n');
        console.log('Usage: npm run dev -- <command>\n');
        break;
    }
  } catch (error: any) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  }
}

main();

