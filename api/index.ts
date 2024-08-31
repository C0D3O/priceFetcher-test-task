import express, { json, NextFunction, Request, Response } from 'express';
import { check, validationResult } from 'express-validator';
import { wsClient } from '../lib/wsClient';
import { supportedTokens } from '../lib/evm';

// ПРОБЛЕМА НЕ ХВАТАЕТ ЛИКВЫ В ЮНИСВАПЕ
// ПРОБЛЕМА 2 - для того чтобы парсить све очень быстро нужен кеш с юнисвапа а для этого по идее своя нода в меиннете, чтобы не посылать запрос на цену в момент самого запроса к сервису, а просто чтобы его возвращать
const prices = new wsClient();

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

		const { inputCurrency, outputCurrency } = req.body;

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
		const { inputCurrency, outputCurrency, inputAmount } = req.body;

		const fetchedPrices = await prices.updateAmount(inputAmount, inputCurrency, outputCurrency);

		const [maxExchange, maxPrice] = Object.entries(fetchedPrices).reduce((max, current) => (current[1] > max[1] ? current : max));

		res.send({ name: maxExchange, price: maxPrice });
	} catch (error: any) {
		res.send({ error: `Internal server error: \n${error.message}` }).status(500);
	}
});

app.post('/getRates', validateReq, async (req: Request, res: Response) => {
	try {
		const { inputCurrency, outputCurrency } = req.body;

		const fetchedPrices = await prices.updateAmount(1, inputCurrency, outputCurrency);

		res.send(fetchedPrices);
	} catch (error: any) {
		res.send({ error: `Internal server error: \n${error.message}` }).status(500);
	}
});

app.listen(3000);
