const serverConfig = global.isServer
	? {
		serverSalt: 'TGSSalt-'
	}
	: {};

export default serverConfig;
