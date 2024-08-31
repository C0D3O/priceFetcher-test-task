import express, { Request, Response } from 'express';

import { wsClient } from '../lib/wsClient';
import { supportedTokens } from '../lib/evm';

// ПРОБЛЕМА НЕ ХВАТАЕТ ЛИКВЫ В ЮНИСВАПЕ
// ПРОБЛЕМА 2 - для того чтобы парсить све очень быстро нужен кеш с юнисвапа а для этого по идее своя нода в меиннете, чтобы не посылать запрос на цену в момент самого запроса к сервису, а просто чтобы его возвращать
const prices = new wsClient();

const app = express();

app.post('/estimate', async (req: Request, res: Response) => {
	const { inputAmount, inputCurrency, outputCurrency } = req.body;

	if (!inputAmount || !inputCurrency || !outputCurrency) res.status(400);
	if (!supportedTokens.includes(inputCurrency) || !supportedTokens.includes(outputCurrency)) res.status(400);

	const fetchedPrices = await prices.updateAmount(inputAmount, inputCurrency, outputCurrency);

	res.send('Hello World');
});

app.post('/getRates', async (req: Request, res: Response) => {
	const { inputCurrency, outputCurrency } = req.body;

	if (!inputCurrency || !outputCurrency) res.status(400);
	const fetchedPrices = await prices.updateAmount(1, inputCurrency, outputCurrency);

	res.send(fetchedPrices);
});

app.listen(3000);
