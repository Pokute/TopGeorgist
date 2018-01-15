module.exports = {
	entry: [
		'@babel/polyfill',
		'./topGeorgist.js'
	],
	output: {
		filename: 'static/topGeorgist.bundle.js'
	},
	module: {
		rules: [
			{
				test: /\.js$/i,
				exclude: /node_modules/,
				use: {
					loader: 'babel-loader',
					options: {
						presets: [
							['@babel/env', {
							  targets: {
								  node: '6',
							  },
							}],
							'@babel/stage-0',
						],
						plugins: ['@babel/plugin-proposal-object-rest-spread'],
						plugins: ['@babel/transform-regenerator']
					}
				}
			}
		]
	},
	devtool: 'source-map',
	watch: true,
};
