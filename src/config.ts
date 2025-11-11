import dotenv from 'dotenv';

dotenv.config();

export interface Config {
  rpcUrl: string;
  masterPrivateKey: string;
  bundlerPrivateKeys: string[];
  fourmemeContract: string;
  pancakeRouter: string;
  gasPriceGwei: number;
  gasLimit: number;
  buyAmountBNB: string;
  slippagePercent: number;
  tokenAddress: string;
}

export function loadConfig(): Config {
  const rpcUrl = process.env.RPC_URL || 'https://bsc-dataseed1.binance.org/';
  const masterPrivateKey = process.env.MASTER_PRIVATE_KEY || '';
  const bundlerKeysString = process.env.BUNDLER_PRIVATE_KEYS || '';
  const bundlerPrivateKeys = bundlerKeysString.split(',').filter(k => k.trim().length > 0);
  
  const fourmemeContract = process.env.FOURMEME_CONTRACT || '0x0000000000000000000000000000000000000000';
  const pancakeRouter = process.env.PANCAKE_ROUTER || '0x10ED43C718714eb63d5aA57B78B54704E256024E';
  
  const gasPriceGwei = parseFloat(process.env.GAS_PRICE_GWEI || '5');
  const gasLimit = parseInt(process.env.GAS_LIMIT || '500000');
  
  const buyAmountBNB = process.env.BUY_AMOUNT_BNB || '0.01';
  const slippagePercent = parseFloat(process.env.SLIPPAGE_PERCENT || '20');
  
  const tokenAddress = process.env.TOKEN_ADDRESS || '';

  // Validation
  if (!masterPrivateKey) {
    throw new Error('MASTER_PRIVATE_KEY is required in .env file');
  }

  if (bundlerPrivateKeys.length === 0) {
    throw new Error('BUNDLER_PRIVATE_KEYS is required in .env file');
  }

  if (!tokenAddress) {
    throw new Error('TOKEN_ADDRESS is required in .env file');
  }

  return {
    rpcUrl,
    masterPrivateKey,
    bundlerPrivateKeys,
    fourmemeContract,
    pancakeRouter,
    gasPriceGwei,
    gasLimit,
    buyAmountBNB,
    slippagePercent,
    tokenAddress,
  };
}

