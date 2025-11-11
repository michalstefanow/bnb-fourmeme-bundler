# Four.meme Bundler Bot for BNB Chain

A TypeScript-based bundler bot for executing simultaneous token purchases on four.meme launches using multiple wallets on BNB Chain (Binance Smart Chain).

## 🚀 Features

- **Multi-Wallet Bundling**: Execute simultaneous buys from multiple wallets
- **Automatic Wallet Funding**: Fund bundler wallets from a master wallet
- **PancakeSwap Integration**: Uses PancakeSwap V2 Router for token swaps
- **Configurable Parameters**: Customize gas price, slippage, buy amounts, etc.
- **Real-time Monitoring**: Track transaction status and token balances
- **Error Handling**: Robust error handling and transaction management

## 📋 Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- BNB for gas fees and token purchases
- Private keys for master wallet and bundler wallets

## 🛠️ Installation

1. Clone the repository

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory:
```bash
# Copy the example file
cp .env.example .env
```

4. Edit the `.env` file with your configuration:
```env
# BNB Chain RPC URL
RPC_URL=https://bsc-dataseed1.binance.org/

# Master wallet private key (for funding bundler wallets)
MASTER_PRIVATE_KEY=your_master_private_key_here

# Bundler wallet private keys (comma separated)
# Generate these securely and keep them safe
BUNDLER_PRIVATE_KEYS=key1,key2,key3,key4,key5

# Four.meme contract address (if needed)
FOURMEME_CONTRACT=0x0000000000000000000000000000000000000000

# PancakeSwap Router V2 (default is correct for BSC)
PANCAKE_ROUTER=0x10ED43C718714eb63d5aA57B78B54704E256024E

# Gas settings
GAS_PRICE_GWEI=5
GAS_LIMIT=500000

# Bundle settings
BUY_AMOUNT_BNB=0.01
SLIPPAGE_PERCENT=20

# Token to bundle (IMPORTANT: Set this before running)
TOKEN_ADDRESS=0xYourTokenAddressHere
```

## 🔑 Wallet Setup

### Master Wallet
- This wallet funds all bundler wallets
- Needs to have enough BNB for:
  - Funding all bundler wallets
  - Gas fees for funding transactions

### Bundler Wallets
- These wallets execute the actual token purchases
- Can be fresh wallets (will be funded automatically)
- Each needs: `BUY_AMOUNT_BNB` + gas fees

### Generating New Wallets (Optional)
You can generate new wallets using this Node.js script:

```javascript
const { ethers } = require('ethers');

// Generate 5 new wallets
for (let i = 0; i < 5; i++) {
  const wallet = ethers.Wallet.createRandom();
  console.log(`Wallet ${i + 1}:`);
  console.log(`Address: ${wallet.address}`);
  console.log(`Private Key: ${wallet.privateKey}\n`);
}
```

## 🏃 Usage

### Build the project:
```bash
npm run build
```

### Run in development mode:
```bash
npm run dev
```

### Run in production mode:
```bash
npm start
```

## 📊 How It Works

1. **Configuration Loading**: Loads settings from `.env` file
2. **Wallet Initialization**: Sets up master and bundler wallets
3. **Balance Check**: Displays current BNB balances
4. **Wallet Funding**: Automatically funds bundler wallets from master wallet
5. **Bundle Preparation**: Prepares all buy transactions
6. **Simultaneous Execution**: Executes all buys at the same time
7. **Result Summary**: Shows success/failure for each transaction
8. **Token Balance Display**: Shows token balances for all wallets

## ⚙️ Configuration Options

| Option | Description | Default |
|--------|-------------|---------|
| `RPC_URL` | BNB Chain RPC endpoint | BSC mainnet |
| `MASTER_PRIVATE_KEY` | Master wallet private key | Required |
| `BUNDLER_PRIVATE_KEYS` | Comma-separated bundler keys | Required |
| `TOKEN_ADDRESS` | Target token address | Required |
| `BUY_AMOUNT_BNB` | BNB amount per wallet | 0.01 |
| `SLIPPAGE_PERCENT` | Slippage tolerance | 20 |
| `GAS_PRICE_GWEI` | Gas price in Gwei | 5 |
| `GAS_LIMIT` | Gas limit per transaction | 500000 |

## 🔒 Security Considerations

- **NEVER share your private keys** or commit them to version control
- The `.env` file is in `.gitignore` to prevent accidental commits
- Use dedicated wallets for bundling operations
- Test with small amounts first
- Be aware of MEV (Miner Extractable Value) risks
- Consider using a VPN or private RPC for better privacy

## ⚠️ Risks & Disclaimers

- **High Risk**: Token bundling is a high-risk activity
- **Potential Loss**: You may lose your entire investment
- **Gas Fees**: Failed transactions still consume gas
- **No Guarantees**: No guarantee of profit or successful execution
- **Regulatory Risk**: Check local regulations before using
- **Use at Your Own Risk**: This software is provided as-is

## 🐛 Troubleshooting

### Transaction Failures
- Increase `GAS_PRICE_GWEI` for faster inclusion
- Increase `SLIPPAGE_PERCENT` if price is moving quickly
- Check token hasn't enabled trading restrictions

### Insufficient Balance Errors
- Ensure master wallet has enough BNB
- Account for gas fees in addition to buy amounts

### RPC Errors
- Try a different RPC URL
- Consider using a private/paid RPC for better reliability

## 📝 Development

### Project Structure
```
src/
├── index.ts          # Main entry point
├── config.ts         # Configuration management
├── walletManager.ts  # Wallet operations
├── bundler.ts        # Bundle execution logic
└── utils.ts          # Utility functions
```

### Building
```bash
npm run build
```

### Watch Mode
```bash
npm run watch
```

## 🤝 Contributing

Contributions are welcome! Please ensure:
- Code follows TypeScript best practices
- All functions are properly typed
- Error handling is robust
- Comments explain complex logic

## 📄 License

MIT License - See LICENSE file for details

## ⚡ Tips for Success

1. **Test First**: Always test with small amounts on testnet
2. **Fast RPC**: Use a reliable, fast RPC endpoint
3. **Timing**: Execute at the right moment for launches
4. **Gas Price**: Set competitive gas prices
5. **Monitoring**: Watch transactions on BSCScan
6. **Security**: Keep private keys secure and separate

## 📞 Support

For issues or questions:
- Check existing GitHub issues
- Review BSCScan for transaction details
- Verify token contract on BSCScan

---

**Remember**: Only invest what you can afford to lose. Always DYOR (Do Your Own Research).

