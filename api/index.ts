import express, { Request, Response } from 'express';

import { wsClient } from '../lib/wsClient';

(async () => {
	try {
		const prices = new wsClient();
		await new Promise((r) => setTimeout(r, 5000));
		// console.log(prices.updateAmount(2, 'BTC', 'USDT'));
		// console.log(prices.updateAmount(3, 'BTC', 'USDT'));
		// console.log(prices.updateAmount(2, 'BTC', 'USDT'));
		console.log('PRICE', prices.updateAmount(1, 'BTC', 'USDT'));
	} catch (error: any) {
		console.log(error.message);
	}
})();

const app = express();

app.post('/estimate', (req: Request, res: Response) => {
	const { inputAmount, inputCurrency, outputCurrency } = req.body;

	if (!inputAmount || !inputCurrency || !outputCurrency) res.status(400);

	res.send('Hello World');
});

app.listen(3000);
