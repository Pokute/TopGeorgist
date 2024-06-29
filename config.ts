const config = {
	gameServer: {
		bind: process.env.REACT_APP_GAME_SERVER_BIND || '0.0.0.0',
		protocol: process.env.REACT_APP_GAME_SERVER_PROTOCOL || 'ws',
		host: process.env.REACT_APP_GAME_SERVER_HOST || 'localhost',
		port: Number.parseInt(process.env.REACT_APP_GAME_SERVER_PORT ?? '0') || 24320,
	},
	httpServer: {
		bind: process.env.REACT_APP_HTTP_SERVER_BIND || '0.0.0.0',
		protocol: process.env.REACT_APP_HTTP_SERVER_PROTOCOL || 'http',
		host: process.env.REACT_APP_HTTP_SERVER_HOST || 'localhost',
		port: Number.parseInt(process.env.REACT_APP_HTTP_SERVER_PORT ?? '0') || 24321,
	},
};

export default config;
