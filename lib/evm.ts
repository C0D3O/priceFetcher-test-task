import { Contract } from 'ethers';
import { JsonRpcProvider } from 'ethers';

const abi = [
	{
		inputs: [
			{ internalType: 'uint256', name: 'amountIn', type: 'uint256' },
			{ internalType: 'address[]', name: 'path', type: 'address[]' },
		],
		name: 'getAmountsOut',
		outputs: [{ internalType: 'uint256[]', name: 'amounts', type: 'uint256[]' }],
		stateMutability: 'view',
		type: 'function',
	},
];

export const USDT_TOKEN_ADDRESS = '0xdAC17F958D2ee523a2206206994597C13D831ec7';
export const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';
export const WBTC_ADDRESS = '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599';

const provider = new JsonRpcProvider('');
export const uniswapContract = new Contract('0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D', abi, provider);
