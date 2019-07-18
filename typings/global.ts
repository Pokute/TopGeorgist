declare global {
	namespace globalThis {
		var foo: string;
	}
	namespace Global {
		var foo: string;
	}
}

declare interface Global {
	foo: string;
}

export {}
