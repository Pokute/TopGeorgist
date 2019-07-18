// declare namespace globalThis {
// 	export interface Global {
// 		isServer: boolean,
// 		readonly ws: import('ws-wrapper'),
// 	}
// }

declare let isServer: boolean;

export type Opaque<T, K> = T & {__TYPE__: K};
