module.exports = {
	resolve: {
		extensions: [
			'.js',
			'.mjs',
		],
	},
	module: {
		rules: [
			{
				test: /(\.js$|\.mjs$)/i,
				exclude: /node_modules/,
				type: 'javascript/auto',
				use: {
					loader: 'babel-loader',
					options: {
						babelrc: true,
					},
				},
			},
			{
				test: /\.css$/,
				use: [
					{ loader: 'style-loader' },
					{ loader: 'css-loader' },
				],
			},
		],
	},
};
