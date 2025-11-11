import { ethers } from 'ethers';

// PancakeSwap Router V2 ABI (minimal interface for swapExactETHForTokens)
export const PANCAKE_ROUTER_ABI = [
  'function swapExactETHForTokensSupportingFeeOnTransferTokens(uint amountOutMin, address[] calldata path, address to, uint deadline) external payable',
  'function getAmountsOut(uint amountIn, address[] memory path) external view returns (uint[] memory amounts)',
  'function WETH() external pure returns (address)',
];

// ERC20 ABI (minimal interface)
export const ERC20_ABI = [
  'function balanceOf(address account) external view returns (uint256)',
  'function decimals() external view returns (uint8)',
  'function symbol() external view returns (string)',
  'function approve(address spender, uint256 amount) external returns (bool)',
];

export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export function calculateMinAmountOut(
  amountIn: bigint,
  slippagePercent: number
): bigint {
  const slippage = BigInt(Math.floor(slippagePercent * 100));
  return (amountIn * (10000n - slippage)) / 10000n;
}

export function formatTokenAmount(amount: bigint, decimals: number): string {
  return ethers.formatUnits(amount, decimals);
}

export function getDeadline(minutesFromNow: number = 20): number {
  return Math.floor(Date.now() / 1000) + minutesFromNow * 60;
}

export function displayBanner(): void {
  console.log('\n' + '='.repeat(60));
  console.log('🚀  Four.meme Bundler Bot - BNB Chain  🚀');
  console.log('='.repeat(60) + '\n');
}

export function displaySummary(
  tokenAddress: string,
  buyAmount: string,
  walletCount: number,
  slippage: number
): void {
  console.log('📋 Bundle Configuration:');
  console.log('========================');
  console.log(`Token Address: ${tokenAddress}`);
  console.log(`Buy Amount per Wallet: ${buyAmount} BNB`);
  console.log(`Number of Wallets: ${walletCount}`);
  console.log(`Total BNB: ${parseFloat(buyAmount) * walletCount} BNB`);
  console.log(`Slippage Tolerance: ${slippage}%`);
  console.log('========================\n');
}

