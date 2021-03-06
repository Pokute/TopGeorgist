import express from 'express';
import webpack from 'webpack';
import webpackDevMiddleware from 'webpack-dev-middleware';
import webpackConfig from './webpack.config';

import config from './config';

const app = express();

const devMiddlewareOptions: webpackDevMiddleware.Options = 
{
	publicPath: '',
	// compress: true,
	// hot: true,
	// stats: 'errors-only',
	// noInfo: true,
	// errorDetails: true,
};

const devMiddleware = webpackDevMiddleware(
	webpack(webpackConfig),
	devMiddlewareOptions
);

app.use(devMiddleware);

app.use(express.static('static'));

app.listen(config.httpServer);
