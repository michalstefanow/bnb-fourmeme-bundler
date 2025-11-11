// Simple script to generate new Ethereum wallets
// Run with: node scripts/generateWallets.js

const { ethers } = require('ethers');

const count = process.argv[2] ? parseInt(process.argv[2]) : 5;

console.log(`\n🔑 Generating ${count} new wallets...\n`);
console.log('⚠️  KEEP THESE PRIVATE KEYS SECURE!\n');
console.log('='.repeat(80));

const privateKeys = [];

for (let i = 0; i < count; i++) {
  const wallet = ethers.Wallet.createRandom();
  privateKeys.push(wallet.privateKey);
  
  console.log(`\nWallet ${i + 1}:`);
  console.log(`  Address:     ${wallet.address}`);
  console.log(`  Private Key: ${wallet.privateKey}`);
}

console.log('\n' + '='.repeat(80));
console.log('\n📋 Comma-separated private keys for .env file:\n');
console.log(`BUNDLER_PRIVATE_KEYS=${privateKeys.join(',')}`);
console.log('\n' + '='.repeat(80) + '\n');

