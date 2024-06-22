import express from 'express';
import webpack from 'webpack';
import webpackDevMiddleware, { Options } from 'webpack-dev-middleware';
import webpackConfig from './webpack.config.js';

import config from './config.js';

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

app.listen(config.httpServer);
