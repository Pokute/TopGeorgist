import express from 'express';
import webpack from 'webpack';
import webpackDevMiddleware, { Options } from 'webpack-dev-middleware';
import webpackConfig from './webpack.config.js';

import config from './config.js';

const app = express();

const devMiddleware = webpackDevMiddleware(
	webpack(webpackConfig),
	{
		publicPath: webpackConfig.output?.publicPath,
		// compress: true,
		// hot: true,
		// stats: 'errors-only',
		// noInfo: true,
		// errorDetails: true,
	}
);

app.use(devMiddleware);

app.use(express.static('static'));

const conf = {
	host: config.httpServer.bind,
	port: config.httpServer.port,
};
app.listen(conf);
