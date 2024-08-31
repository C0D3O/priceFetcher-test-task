import express, { Request, Response } from 'express';
import { uniswapContract } from '../lib/evm';

import { wsClient } from '../lib/wsClient';

(async () => {
	try {
		const prices = new wsClient();
		await new Promise((r) => setTimeout(r, 5000));
		prices.updateAmount(2);
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
