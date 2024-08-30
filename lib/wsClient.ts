import { WebSocket } from 'ws';

export class wsClient {
	public amount: number;

	private wsBTC: WebSocket | null = null;
	private wsETH: WebSocket | null = null;

	public BTCUSDT_PRICE: number | null = null;
	public USDTBTC_PRICE: number | null = null;

	public ETHUSDT_PRICE: number | null = null;
	public USDTETH_PRICE: number | null = null;

	public BTCETH_PRICE: number | null = null;
	public ETHBTC_PRICE: number | null = null;

	constructor(amount: number) {
		this.amount = amount;
		this.fetchBTCPrices();
		this.fetchETHPrices();
	}

	async fetchBTCPrices() {
		this.wsBTC = new WebSocket('wss://stream.binance.com:9443/ws/btcusdt@trade');

		this.wsBTC.on('open', () => {
			console.log('BTC WEBSOCKET CONNECTED!!!');
		});

		this.wsBTC.on('message', (message) => {
			const { p } = JSON.parse(message.toString());

			if (p) {
				this.BTCUSDT_PRICE = parseFloat(p);
				this.getBTCETH_Price();

				this.USDTBTC_PRICE = this.amount / this.BTCUSDT_PRICE;

				// console.log(`BTC/USDT: ${this.BTCUSDT_PRICE}`);
				// console.log(`USDT/BTC: ${this.USDTBTC_PRICE}`);
			}
		});

		this.wsBTC.on('close', () => {
			return this.fetchBTCPrices();
		});
	}

	async fetchETHPrices() {
		this.wsETH = new WebSocket('wss://stream.binance.com:9443/ws/ethusdt@trade');

		this.wsETH.on('open', () => {
			console.log('ETH WEBSOCKET CONNECTED!!!');
		});

		this.wsETH.on('message', (message) => {
			const { p } = JSON.parse(message.toString());

			if (p) {
				this.ETHUSDT_PRICE = parseFloat(p);
				this.getBTCETH_Price();
				this.USDTETH_PRICE = this.amount / this.ETHUSDT_PRICE;

				// console.log(`ETH/USDT: ${this.ETHUSDT_PRICE}`);
				// console.log(`USDT/ETH: ${this.USDTETH_PRICE}`);
			}
		});

		this.wsETH.on('close', () => {
			return this.fetchETHPrices();
		});
	}

	getBTCETH_Price() {
		if (this.BTCUSDT_PRICE && this.ETHUSDT_PRICE) {
			this.BTCETH_PRICE = this.BTCUSDT_PRICE / this.ETHUSDT_PRICE;
			this.ETHBTC_PRICE = this.amount / this.BTCETH_PRICE;

			console.log(`BTC/ETH: ${this.BTCETH_PRICE}`);
			console.log(`ETH/BTC: ${this.ETHBTC_PRICE}`);
		}
	}
}
