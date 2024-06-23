import * as webpack from 'webpack';
import path from 'path';

import commonConfig from './webpack.common.config.js';

const config: webpack.Configuration = {
	mode: 'production',
	entry: [
		'./reduxIndex.js',
	],
	target: 'web',
	output: {
		path: path.resolve(new URL('.', import.meta.url).pathname, '..', 'dist', 'static'),
		filename: 'topGeorgist.bundle.js',
		publicPath: '/',
	},
	...commonConfig,
	devtool: 'source-map',
	experiments: {
		topLevelAwait: true,
	},
};

export default config;
