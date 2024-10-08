import express, { Request, Response } from 'express';

import { RequestBody } from '../lib/interfaces';
import { validateReq } from '../lib/middleware';

import { priceFetcher } from '../lib/priceFetcher';

////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////

const prices = new priceFetcher();

const app = express();
app.use(express.json());

app.post('/estimate', validateReq, async (req: Request, res: Response) => {
	try {
		const { inputCurrency, outputCurrency, inputAmount } = req.body as RequestBody;

		const fetchedPrices = await prices.updateAmount(inputCurrency, outputCurrency, inputAmount);

		res.send(fetchedPrices.reduce((max, current) => (current[1] > max[1] ? current : max)));
	} catch (error: any) {
		res.send({ error: `Internal server error: \n${error.message}` }).status(500);
	}
});

app.post('/getRates', validateReq, async (req: Request, res: Response) => {
	try {
		const { inputCurrency, outputCurrency } = req.body as RequestBody;

		const fetchedPrices = await prices.updateAmount(inputCurrency, outputCurrency);

		res.send(fetchedPrices);
	} catch (error: any) {
		res.send({ error: `Internal server error: \n${error.message}` }).status(500);
	}
});

app.listen(3000, () => {
	console.log('Service is running on port 3000\n');
});
