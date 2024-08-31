import { WebSocket } from 'ws';

interface Prices {
	[key: string]: number;
}

export class wsClient {
	private wsBTC: WebSocket | null = null;
	private wsETH: WebSocket | null = null;

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
	}

	// Method to update the amount dynamically
	public updateAmount(newAmount: number, inputCurrency?: string, outputCurrency?: string) {
		this.amount = newAmount;
		// WHAT IF AT THIS MOMENT TRADES ARE STOPPED THEN IT MEANS I WOULD GET THE RESULT WITH THE OLD AMOUNT BACK

		return this.calculatePricesBinance(inputCurrency, outputCurrency);
	}

	private async fetchBTCPricesBinance() {
		this.wsBTC = new WebSocket('wss://stream.binance.com:9443/ws/btcusdt@trade');

		this.wsBTC.on('open', () => {
			console.log('BTC WEBSOCKET CONNECTED!!!');
		});

		this.wsBTC.on('message', (message) => {
			const { p } = JSON.parse(message.toString());

			if (p) {
				this.wsCacheBTCUSDT['binance'] = parseFloat(p);

				this.calculatePricesBinance();
			}
		});

		this.wsBTC.on('close', () => {
			this.fetchBTCPricesBinance();
		});
	}

	private async fetchETHPricesBinance() {
		this.wsETH = new WebSocket('wss://stream.binance.com:9443/ws/ethusdt@trade');

		this.wsETH.on('open', () => {
			console.log('ETH WEBSOCKET CONNECTED!!!');
		});

		this.wsETH.on('message', (message) => {
			const { p } = JSON.parse(message.toString());

			if (p) {
				this.wsCacheETHUSDT['binance'] = parseFloat(p);
				this.calculatePricesBinance();
			}
		});

		this.wsETH.on('close', () => {
			this.fetchETHPricesBinance();
		});
	}

	private calculatePricesBinance(inputCurrency?: string, outputCurrency?: string) {
		if (this.wsCacheBTCUSDT['binance'] && this.wsCacheETHUSDT['binance']) {
			// GET BTC PRICE
			this.BTCUSDT_PRICE['binance'] = this.wsCacheBTCUSDT['binance'] * this.amount;
			this.USDTBTC_PRICE['binance'] = this.amount / this.BTCUSDT_PRICE['binance'];

			// GET ETH PRICE
			this.ETHUSDT_PRICE['binance'] = this.wsCacheETHUSDT['binance'] * this.amount;
			this.USDTETH_PRICE['binance'] = this.amount / this.ETHUSDT_PRICE['binance'];

			// GET BTC ETH PRICE
			this.BTCETH_PRICE['binance'] = this.BTCUSDT_PRICE['binance'] / this.ETHUSDT_PRICE['binance'];
			this.ETHBTC_PRICE['binance'] = this.amount / this.BTCETH_PRICE['binance'];

			// console.log(`BTC/ETH: ${this.BTCETH_PRICE}`);
			// console.log(`ETH/BTC: ${this.ETHBTC_PRICE}`);
			// console.log('STREAM');

			if (inputCurrency && outputCurrency) {
				if (inputCurrency === 'BTC' && outputCurrency === 'USDT') return this.BTCUSDT_PRICE['binance'];
				if (inputCurrency === 'USDT' && outputCurrency === 'BTC') return this.USDTBTC_PRICE['binance'];

				if (inputCurrency === 'ETH' && outputCurrency === 'USDT') return this.ETHUSDT_PRICE['binance'];
				if (inputCurrency === 'USDT' && outputCurrency === 'ETH') return this.USDTETH_PRICE['binance'];

				if (inputCurrency === 'BTC' && outputCurrency === 'ETH') return this.BTCETH_PRICE['binance'];
				if (inputCurrency === 'ETH' && outputCurrency === 'BTC') return this.ETHBTC_PRICE['binance'];
			}
		}
	}

	//////////////////////////////////////////////////////////////////////////
	//////////////////////////////////////////////////////////////////////////
	//////////////////////////////////////////////////////////////////////////
	//////////////////////////////// KUCOIN //////////////////////////////////
	//////////////////////////////////////////////////////////////////////////
	//////////////////////////////////////////////////////////////////////////
	//////////////////////////////////////////////////////////////////////////
	//////////////////////////////////////////////////////////////////////////

	private async fetchBTCPricesKucoin() {
		this.wsBTC = new WebSocket('wss://ws-api-spot.kucoin.com/');

		this.wsBTC.on('open', () => {
			console.log('BTC WEBSOCKET CONNECTED!!!');
		});

		this.wsBTC.on('message', (message) => {
			const { p } = JSON.parse(message.toString());

			if (p) {
				// Calculate the total value for the specified amount of BTC
				this.wsCacheBTCUSDT['kucoin'] = parseFloat(p);

				this.calculatePricesKucoin();
			}
		});

		this.wsBTC.on('close', () => {
			this.fetchBTCPricesKucoin();
		});
	}

	private async fetchETHPricesKucoin() {
		this.wsETH = new WebSocket('wss://ws-api-spot.kucoin.com/');

		this.wsETH.on('open', () => {
			console.log('ETH WEBSOCKET CONNECTED!!!');
		});

		this.wsETH.on('message', (message) => {
			const { p } = JSON.parse(message.toString());

			if (p) {
				this.wsCacheETHUSDT['kucoin'] = parseFloat(p);
				this.calculatePricesKucoin();
			}
		});

		this.wsETH.on('close', () => {
			this.fetchETHPricesKucoin();
		});
	}

	private calculatePricesKucoin(inputCurrency?: string, outputCurrency?: string) {
		if (this.wsCacheBTCUSDT['kucoin'] && this.wsCacheETHUSDT['kucoin']) {
			// GET BTC PRICE
			this.BTCUSDT_PRICE['kucoin'] = this.wsCacheBTCUSDT['kucoin'] * this.amount;
			this.USDTBTC_PRICE['kucoin'] = this.amount / this.BTCUSDT_PRICE['kucoin'];

			// GET ETH PRICE
			this.ETHUSDT_PRICE['kucoin'] = this.wsCacheETHUSDT['kucoin'] * this.amount;
			this.USDTETH_PRICE['kucoin'] = this.amount / this.ETHUSDT_PRICE['kucoin'];

			// GET BTC ETH PRICE
			this.BTCETH_PRICE['kucoin'] = this.BTCUSDT_PRICE['kucoin'] / this.ETHUSDT_PRICE['kucoin'];
			this.ETHBTC_PRICE['kucoin'] = this.amount / this.BTCETH_PRICE['kucoin'];

			// console.log(`BTC/ETH: ${this.BTCETH_PRICE}`);
			// console.log(`ETH/BTC: ${this.ETHBTC_PRICE}`);
			// console.log('STREAM');

			if (inputCurrency && outputCurrency) {
				if (inputCurrency === 'BTC' && outputCurrency === 'USDT') return this.BTCUSDT_PRICE['kucoin'];
				if (inputCurrency === 'USDT' && outputCurrency === 'BTC') return this.USDTBTC_PRICE['kucoin'];

				if (inputCurrency === 'ETH' && outputCurrency === 'USDT') return this.ETHUSDT_PRICE['kucoin'];
				if (inputCurrency === 'USDT' && outputCurrency === 'ETH') return this.USDTETH_PRICE['kucoin'];

				if (inputCurrency === 'BTC' && outputCurrency === 'ETH') return this.BTCETH_PRICE['kucoin'];
				if (inputCurrency === 'ETH' && outputCurrency === 'BTC') return this.ETHBTC_PRICE['kucoin'];
			}
		}
	}
}
