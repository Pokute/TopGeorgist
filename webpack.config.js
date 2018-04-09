import commonConfig from './webpack.common.config';

export default {
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
