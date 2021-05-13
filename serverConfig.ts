import isServer from './isServer.js'
const serverConfig = isServer
	? {
		serverSalt: 'TGSSalt5d2031c9556cb0a0e2f7853991ebd4c1-'
	}
	: {};

export default serverConfig;
