import express, { NextFunction, Request, Response } from 'express';
import { check, validationResult } from 'express-validator';

import { RequestBody } from '../lib/interfaces';
import { supportedTokens } from '../lib/evm';

import { priceFetcher } from '../lib/priceFetcher';

////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////

const prices = new priceFetcher();

const app = express();
app.use(express.json());

const validateReq = [
	check('inputCurrency').isString().withMessage('inputCurrency must be a string'),
	check('outputCurrency').isString().withMessage('outputCurrency must be a string'),
	check('inputAmount').optional().isNumeric().withMessage('inputAmount must be a number').toFloat(),
	(req: Request, res: Response, next: NextFunction) => {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			return res.status(400).json({ errors: errors.array() });
		}

		const { inputCurrency, outputCurrency } = req.body as RequestBody;

		if (!supportedTokens.includes(inputCurrency)) {
			return res.status(400).json({ errors: [{ msg: 'Unsupported currency', param: 'inputCurrency' }] });
		} else if (!supportedTokens.includes(outputCurrency)) {
			return res.status(400).json({ errors: [{ msg: 'Unsupported currency', param: 'outputCurrency' }] });
		}

		next();
	},
];

app.post('/estimate', validateReq, async (req: Request, res: Response) => {
	try {
		const { inputAmount, inputCurrency, outputCurrency } = req.body as RequestBody;

		const fetchedPrices = await prices.updateAmount(inputAmount, inputCurrency, outputCurrency);

		res.send(fetchedPrices.reduce((max, current) => (current[1] > max[1] ? current : max)));
	} catch (error: any) {
		res.send({ error: `Internal server error: \n${error.message}` }).status(500);
	}
});

app.post('/getRates', validateReq, async (req: Request, res: Response) => {
	try {
		const { inputCurrency, outputCurrency } = req.body as RequestBody;

		const fetchedPrices = await prices.updateAmount(1, inputCurrency, outputCurrency);

		res.send(fetchedPrices);
	} catch (error: any) {
		res.send({ error: `Internal server error: \n${error.message}` }).status(500);
	}
});

app.listen(3000, () => {
	console.log('Service is running on port 3000\n');
});
