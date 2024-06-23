import * as webpack from 'webpack';
import path from 'path';

import commonConfig from './webpack.common.config.js';

const config: webpack.Configuration = {
	mode: 'development',
	entry: [
		// './topGeorgist'
		'./reduxIndex.tsx',
	],
	target: 'web',
	output: {
		path: path.resolve(new URL('.', import.meta.url).pathname, 'dist'),
		filename: 'static/topGeorgist.bundle.js',
		publicPath: '/',
	},
	...commonConfig,
	devtool: 'source-map',
	watchOptions: {
		poll: true,
	},
	experiments: {
		topLevelAwait: true,
	},
};

export default config;
