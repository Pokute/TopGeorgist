import isServer from './isServer.js'
const serverConfig = isServer
	? {
		serverSalt: process.env.SERVER_SALT
	}
	: {};

export default serverConfig;
