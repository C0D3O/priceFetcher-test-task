import { NextFunction, Request, Response } from 'express';

import { check, validationResult } from 'express-validator';
import { supportedTokens } from './evm';
import { RequestBody } from './interfaces';

export const validateReq = [
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
