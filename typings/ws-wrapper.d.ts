declare module 'ws-wrapper' {
	interface options {
		debug?: boolean,
		errorToJSON?: () => {},
		requestTimeout?: number | null,
	}

	type EventName =
		'open'
		| 'error'
		| 'message'
		| 'disconnect'
		| 'close';

	class WebSocketWrapper {
		constructor (websocket: WebSocket, options?: Record<string, any>);
		on(eventName: EventName, eventHandler: (msg: any) => void): null
		disconnect(): void;
		send(data: any): void;
	}
	namespace WebSocketWrapper {}
	export = WebSocketWrapper;
}
