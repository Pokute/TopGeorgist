import * as webpack from 'webpack';

import commonConfig from './webpack.common.config';

const config: webpack.Configuration = {
	mode: 'development',
	entry: [
		// './topGeorgist'
		'./reduxIndex',
	],
	target: 'web',
	output: {
		filename: 'static/topGeorgist.bundle.js',
		publicPath: '',
	},
	...commonConfig,
	devtool: 'source-map',
	watch: true,
};

export default config;
