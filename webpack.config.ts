import * as webpack from 'webpack';

import commonConfig from './webpack.common.config.js';

const config: webpack.Configuration = {
	mode: 'development',
	entry: [
		// './topGeorgist'
		'./reduxIndex.tsx',
	],
	target: 'web',
	output: {
		filename: 'static/topGeorgist.bundle.js',
		publicPath: '/',
	},
	...commonConfig,
	devtool: 'source-map',
	watchOptions: {
		poll: true,
	},
};

export default config;
