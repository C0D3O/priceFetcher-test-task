import { WebSocket } from 'ws';

export interface RequestBody {
	inputCurrency: string;
	outputCurrency: string;
	inputAmount?: number;
}

export interface Prices {
	[key: string]: number;
}
export interface WebSockets {
	[key: string]: WebSocket;
}
