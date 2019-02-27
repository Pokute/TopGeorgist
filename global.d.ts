declare namespace NodeJS {
	export interface Global {
		isServer: boolean,
		readonly ws: import('ws-wrapper'),
	}
}
