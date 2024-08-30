import express, { Request, Response } from 'express';
import { uniswapContract } from '../lib/evm';

import { wsClient } from '../lib/wsClient';

const prices = new wsClient(1);

const app = express();

app.post('/estimate', (req: Request, res: Response) => {
	const { inputAmount, inputCurrency, outputCurrency } = req.body;

	if (!inputAmount || !inputCurrency || !outputCurrency) res.status(400);

	res.send('Hello World');
});

app.listen(3000);
