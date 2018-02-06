module.exports = {
	entry: [
		'@babel/polyfill',
		// './topGeorgist'
		'./reduxIndex'
	],
	output: {
		filename: 'static/topGeorgist.bundle.js'
	},
	module: {
		rules: [
			{
				test: /(\.js$|\.mjs$)/i,
				exclude: /node_modules/,
				use: {
					loader: 'babel-loader',
					options: {
						presets: [
							['@babel/env', {
							  targets: {
								  node: '8.9.0',
							  },
							}],
							'@babel/stage-0',
						],
					}
				}
			}
		]
	},
	resolve: {
		extensions: ['.mjs', '.js'],
	},		
	devtool: 'source-map',
	watch: true,
};
