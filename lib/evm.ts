import { Contract, WebSocketProvider } from 'ethers';
export const supportedTokens = ['ETH', 'BTC', 'USDT'];

export const tokens = {
	BTC: { address: '0x2260fac5e5542a773aa44fbcfedf7c193bc2c599', decimals: 8 },
	// ETH: { address: '0x0000000000000000000000000000000000000000', decimals: 18 },
	WETH: { address: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2', decimals: 18 },
	USDT: { address: '0xdac17f958d2ee523a2206206994597c13d831ec7', decimals: 6 },
};

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

const provider = new WebSocketProvider('wss://ethereum-rpc.publicnode.com');
export const uniswapContract = new Contract('0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D', abi, provider);
