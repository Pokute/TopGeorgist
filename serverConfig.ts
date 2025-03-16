import isServer from './isServer.ts'
const serverConfig = isServer
	? {
		serverSalt: process.env.SERVER_SALT
	}
	: {};

export default serverConfig;
