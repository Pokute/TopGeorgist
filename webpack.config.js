import commonConfig from './webpack.common.config';

const config = {
	mode: 'development',
	entry: [
		// './topGeorgist'
		'./reduxIndex',
	],
	target: 'web',
	output: {
		filename: 'static/topGeorgist.bundle.js',
	},
	...commonConfig,
	devtool: 'source-map',
	watch: true,
};

export default config;
