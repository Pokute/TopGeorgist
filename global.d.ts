declare namespace NodeJS {
	export interface Global {
		isServer: boolean,
		ws: any,
	}
}