module.exports = {
	entry: './topGeorgist.js',
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
									browsers: [
										'last 3 versions',
										'not IE <= 10',
									],
							  },
							}],
						],
						plugins: ['@babel/plugin-proposal-object-rest-spread']
					}
				}
			}
		]
	},
	devtool: 'source-map',
	watch: true,
};
