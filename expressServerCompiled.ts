import express from 'express';
import webpack from 'webpack';
import webpackDevMiddleware from 'webpack-dev-middleware';
import webpackConfig from './webpack.config.ts';

import config from './config.ts';

const app = express();

const compiledWebpackConfig = {
	...webpackConfig,
	entry: [
		'./reduxIndex.js',
	]
};

const devMiddleware = webpackDevMiddleware(
	webpack(compiledWebpackConfig),
	{
		publicPath: compiledWebpackConfig.output?.publicPath,
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
