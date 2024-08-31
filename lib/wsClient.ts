import { formatUnits, parseUnits } from 'ethers';
import { WebSocket } from 'ws';
import { tokens, uniswapContract } from './evm';

interface Prices {
	[key: string]: number;
}
interface WebSockets {
	[key: string]: WebSocket;
}

export class wsClient {
	private wsBTC: WebSockets = {};
	private wsETH: WebSockets = {};

	private wsCacheBTCUSDT: Prices = {};
	private wsCacheETHUSDT: Prices = {};

	public BTCUSDT_PRICE: Prices = {};
	public USDTBTC_PRICE: Prices = {};

	public ETHUSDT_PRICE: Prices = {};
	public USDTETH_PRICE: Prices = {};

	public BTCETH_PRICE: Prices = {};
	public ETHBTC_PRICE: Prices = {};

	public amount: number = 1;

	constructor() {
		this.fetchBTCPricesBinance();
		this.fetchETHPricesBinance();

		this.fetchBTCPricesKucoin();
		this.fetchETHPricesKucoin();
	}

	// Method to update the amount dynamically
	public async updateAmount(newAmount: number, inputCurrency?: string, outputCurrency?: string) {
		this.amount = newAmount;

		const [binancePrice, kucoinPrice, uniswapPrice] = await Promise.all([
			this.calculatePrices('binance', inputCurrency, outputCurrency),
			this.calculatePrices('kucoin', inputCurrency, outputCurrency),
			this.fetchUniswapPrices(inputCurrency, outputCurrency),
		]);
		console.log(binancePrice, kucoinPrice, uniswapPrice);

		return {
			binance: binancePrice,
			kucoin: kucoinPrice,
			uniswap: uniswapPrice,
		};
	}

	private async fetchBTCPricesBinance() {
		this.wsBTC['binance'] = new WebSocket('wss://stream.binance.com:9443/ws/btcusdt@trade');

		this.wsBTC['binance'].on('open', () => {
			console.log('BINANCE BTC WEBSOCKET CONNECTED!!!');
		});

		this.wsBTC['binance'].on('message', (message) => {
			const { p } = JSON.parse(message.toString());

			if (p) {
				this.wsCacheBTCUSDT['binance'] = parseFloat(p);
				this.calculatePrices('binance');
			}
		});

		this.wsBTC['binance'].on('close', () => {
			this.fetchBTCPricesBinance();
		});
	}

	private async fetchETHPricesBinance() {
		this.wsETH['binance'] = new WebSocket('wss://stream.binance.com:9443/ws/ethusdt@trade');

		this.wsETH['binance'].on('open', () => {
			console.log('BINANCE ETH WEBSOCKET CONNECTED!!!');
		});

		this.wsETH['binance'].on('message', (message) => {
			const { p } = JSON.parse(message.toString());

			if (p) {
				this.wsCacheETHUSDT['binance'] = parseFloat(p);
				this.calculatePrices('binance');
			}
		});

		this.wsETH['binance'].on('close', () => {
			this.fetchETHPricesBinance();
		});
	}

	//////////////////////////////////////////////////////////////////////////
	//////////////////////////////////////////////////////////////////////////
	//////////////////////////////////////////////////////////////////////////
	//////////////////////////////// KUCOIN //////////////////////////////////
	//////////////////////////////////////////////////////////////////////////
	//////////////////////////////////////////////////////////////////////////
	//////////////////////////////////////////////////////////////////////////

	private async fetchBTCPricesKucoin() {
		const res = await (
			await fetch('https://api.kucoin.com/api/v1/bullet-public', {
				method: 'POST',
			})
		).json();

		if (res?.data?.instanceServers?.length && res?.data?.token) {
			this.wsBTC['kucoin'] = new WebSocket(`${res.data.instanceServers[0]?.endpoint}?token=${res.data.token}`);

			this.wsBTC['kucoin'].on('open', () => {
				console.log('KUCOIN BTC WEBSOCKET CONNECTED!!!');
				this.wsBTC['kucoin'].send(
					JSON.stringify({
						id: 1545910660739, //The id should be an unique value
						type: 'subscribe',
						topic: '/market/ticker:BTC-USDT',
						privateChannel: false, //Adopted the private channel or not. Set as false by default.
						response: true, //Whether the server needs to return the receipt information of this subscription or not. Set as false by default.
					})
				);
			});

			this.wsBTC['kucoin'].on('message', (message) => {
				const res = JSON.parse(message.toString());

				if (res?.data?.price) {
					// Calculate the total value for the specified amount of BTC
					this.wsCacheBTCUSDT['kucoin'] = parseFloat(res?.data?.price);

					this.calculatePrices('kucoin');
				}
			});

			this.wsBTC['kucoin'].on('close', () => {
				this.fetchBTCPricesKucoin();
			});
		} else {
			await new Promise((r) => setTimeout(r, 1000));
			this.fetchBTCPricesKucoin();
		}
	}

	private async fetchETHPricesKucoin() {
		const res = await (
			await fetch('https://api.kucoin.com/api/v1/bullet-public', {
				method: 'POST',
			})
		).json();

		if (res?.data?.instanceServers?.length && res?.data?.token) {
			this.wsETH['kucoin'] = new WebSocket(`wss://ws-api-spot.kucoin.com/?token=${res.data.token}`);

			this.wsETH['kucoin'].on('open', () => {
				console.log('KUCOIN ETH WEBSOCKET CONNECTED!!!');
				this.wsETH['kucoin'].send(
					JSON.stringify({
						id: 1545910660739, //The id should be an unique value
						type: 'subscribe',
						topic: '/market/ticker:ETH-USDT',
						privateChannel: false, //Adopted the private channel or not. Set as false by default.
						response: true, //Whether the server needs to return the receipt information of this subscription or not. Set as false by default.
					})
				);
			});

			this.wsETH['kucoin'].on('message', (message) => {
				const res = JSON.parse(message.toString());

				if (res?.data?.price) {
					// Calculate the total value for the specified amount of BTC
					this.wsCacheETHUSDT['kucoin'] = parseFloat(res?.data?.price);

					this.calculatePrices('kucoin');
				}
			});

			this.wsETH['kucoin'].on('close', () => {
				this.fetchETHPricesKucoin();
			});
		} else {
			await new Promise((r) => setTimeout(r, 1000));
			this.fetchBTCPricesKucoin();
		}
	}

	//////////////////////////////////////////////////////////////////////////
	//////////////////////////////////////////////////////////////////////////
	//////////////////////////////////////////////////////////////////////////
	//////////////////////////////// UNISWAP /////////////////////////////////
	//////////////////////////////////////////////////////////////////////////
	//////////////////////////////////////////////////////////////////////////
	//////////////////////////////////////////////////////////////////////////

	async fetchUniswapPrices(inputCurrency?: string, outputCurrency?: string) {
		const isWETH = inputCurrency === 'ETH' || outputCurrency === 'ETH';

		const tokenIn = inputCurrency === 'ETH' ? tokens.WETH : tokens[inputCurrency];
		const tokenOut = outputCurrency === 'ETH' ? tokens.WETH : tokens[outputCurrency];

		const amountsOut = await uniswapContract.getAmountsOut(
			parseUnits(String(this.amount), tokenIn.decimals),
			isWETH ? [tokenIn.address, tokenOut.address] : [tokenIn.address, tokens.WETH.address, tokenOut.address]
		);

		const amountOut = formatUnits(amountsOut[isWETH ? 1 : 2], tokenOut.decimals);

		// return +amountOut / this.amount;
		return tokenIn.address === tokens.USDT.address
			? parseFloat(amountOut)
			: /////////////
			this.amount < 1
			? parseFloat(amountOut)
			: parseFloat(amountOut) / this.amount;
	}

	private calculatePrices(exchangeName: string, inputCurrency?: string, outputCurrency?: string) {
		if (this.wsCacheBTCUSDT[exchangeName] && this.wsCacheETHUSDT[exchangeName]) {
			// GET BTC PRICE
			this.BTCUSDT_PRICE[exchangeName] = this.wsCacheBTCUSDT[exchangeName] * this.amount;
			this.USDTBTC_PRICE[exchangeName] = this.amount / this.wsCacheBTCUSDT[exchangeName];

			// GET ETH PRICE
			this.ETHUSDT_PRICE[exchangeName] = this.wsCacheETHUSDT[exchangeName] * this.amount;
			this.USDTETH_PRICE[exchangeName] = this.amount / this.wsCacheETHUSDT[exchangeName];

			// GET BTC ETH PRICE
			this.BTCETH_PRICE[exchangeName] = this.BTCUSDT_PRICE[exchangeName] / this.ETHUSDT_PRICE[exchangeName];
			this.ETHBTC_PRICE[exchangeName] = this.amount / this.BTCETH_PRICE[exchangeName];

			// console.log(`BTC/ETH: ${this.BTCETH_PRICE}`);
			// console.log(`ETH/BTC: ${this.ETHBTC_PRICE}`);
			// console.log('STREAM');

			if (inputCurrency && outputCurrency) {
				if (inputCurrency === 'BTC' && outputCurrency === 'USDT') return this.BTCUSDT_PRICE[exchangeName];
				if (inputCurrency === 'USDT' && outputCurrency === 'BTC') return this.USDTBTC_PRICE[exchangeName];

				if (inputCurrency === 'ETH' && outputCurrency === 'USDT') return this.ETHUSDT_PRICE[exchangeName];
				if (inputCurrency === 'USDT' && outputCurrency === 'ETH') return this.USDTETH_PRICE[exchangeName];

				if (inputCurrency === 'BTC' && outputCurrency === 'ETH') return this.BTCETH_PRICE[exchangeName];
				if (inputCurrency === 'ETH' && outputCurrency === 'BTC') return this.ETHBTC_PRICE[exchangeName];
			}
		}
	}
}
