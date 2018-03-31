import express from 'express';
import webpack from 'webpack';
import webpackDevMiddleware from 'webpack-dev-middleware';
import webpackConfig from './webpack.config.js';

import config from './config';

const app = express();

const devMiddleware = webpackDevMiddleware(
	webpack(webpackConfig),
	{
		// publicPath: webpackConfig.output.publicPath,
		// compress: true,
		// hot: true,
		// stats: 'errors-only',
		// noInfo: true,
		// errorDetails: true,
	},
);

app.use(devMiddleware);

app.get('/', (req, res) => {
});

// Add the route to the control panel React app.
app.use('/', express.static('./static'), (req, res) => {
	// res.redirect('index.html');
});

app.listen(config.httpServer);
