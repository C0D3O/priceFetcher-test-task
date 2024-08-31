import { WebSocket } from 'ws';

export class wsClient {
	private wsBTC: WebSocket | null = null;
	private wsETH: WebSocket | null = null;

	private wsCacheBTCUSDT: number | null = null;
	private wsCacheETHUSDT: number | null = null;

	public BTCUSDT_PRICE: number | null = null;
	public USDTBTC_PRICE: number | null = null;

	public ETHUSDT_PRICE: number | null = null;
	public USDTETH_PRICE: number | null = null;

	public BTCETH_PRICE: number | null = null;
	public ETHBTC_PRICE: number | null = null;

	public amount: number = 1;

	constructor() {
		this.fetchBTCPrices();
		this.fetchETHPrices();
	}

	// Method to update the amount dynamically
	public updateAmount(newAmount: number, inputCurrency?: string, outputCurrency?: string) {
		this.amount = newAmount;
		// WHAT IF AT THIS MOMENT TRADES ARE STOPPED THEN IT MEANS I WOULD GET THE RESULT WITH THE OLD AMOUNT BACK

		return this.calculatePrices(inputCurrency, outputCurrency);
	}

	private async fetchBTCPrices() {
		this.wsBTC = new WebSocket('wss://stream.binance.com:9443/ws/btcusdt@trade');

		this.wsBTC.on('open', () => {
			console.log('BTC WEBSOCKET CONNECTED!!!');
		});

		this.wsBTC.on('message', (message) => {
			const { p } = JSON.parse(message.toString());

			if (p) {
				// Calculate the total value for the specified amount of BTC
				this.wsCacheBTCUSDT = parseFloat(p);

				this.calculatePrices();
			}
		});

		this.wsBTC.on('close', () => {
			this.fetchBTCPrices();
		});
	}

	private async fetchETHPrices() {
		this.wsETH = new WebSocket('wss://stream.binance.com:9443/ws/ethusdt@trade');

		this.wsETH.on('open', () => {
			console.log('ETH WEBSOCKET CONNECTED!!!');
		});

		this.wsETH.on('message', (message) => {
			const { p } = JSON.parse(message.toString());

			if (p) {
				this.wsCacheETHUSDT = parseFloat(p);
				this.calculatePrices();
			}
		});

		this.wsETH.on('close', () => {
			this.fetchETHPrices();
		});
	}

	private calculatePrices(inputCurrency?: string, outputCurrency?: string) {
		if (this.wsCacheBTCUSDT && this.wsCacheETHUSDT) {
			// GET BTC PRICE
			this.BTCUSDT_PRICE = this.wsCacheBTCUSDT * this.amount;
			this.USDTBTC_PRICE = this.amount / this.BTCUSDT_PRICE;

			// GET ETH PRICE
			this.ETHUSDT_PRICE = this.wsCacheETHUSDT * this.amount;
			this.USDTETH_PRICE = this.amount / this.ETHUSDT_PRICE;

			// GET BTC ETH PRICE
			this.BTCETH_PRICE = this.BTCUSDT_PRICE / this.ETHUSDT_PRICE;
			this.ETHBTC_PRICE = this.amount / this.BTCETH_PRICE;

			// console.log(`BTC/ETH: ${this.BTCETH_PRICE}`);
			// console.log(`ETH/BTC: ${this.ETHBTC_PRICE}`);
			// console.log('STREAM');

			if (inputCurrency && outputCurrency) {
				if (inputCurrency === 'BTC' && outputCurrency === 'USDT') return this.BTCUSDT_PRICE;
				if (inputCurrency === 'USDT' && outputCurrency === 'BTC') return this.USDTBTC_PRICE;

				if (inputCurrency === 'ETH' && outputCurrency === 'USDT') return this.ETHUSDT_PRICE;
				if (inputCurrency === 'USDT' && outputCurrency === 'ETH') return this.USDTETH_PRICE;

				if (inputCurrency === 'BTC' && outputCurrency === 'ETH') return this.BTCETH_PRICE;
				if (inputCurrency === 'ETH' && outputCurrency === 'BTC') return this.ETHBTC_PRICE;
			}
		}
	}
}
