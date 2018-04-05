module.exports = {
	mode: 'development',
	entry: [
		// '@babel/polyfill',
		// './topGeorgist'
		'./reduxIndex',
	],
	target: 'web',
	output: {
		filename: 'static/topGeorgist.bundle.js',
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
						presets: [
							[
								'@babel/preset-env',
								{
									targets: {
										node: '8.9.0',
									},
									exclude: [
										'transform-regenerator',
									],
									useBuiltIns: false,
								},
							],
							'@babel/stage-0',
						],
						plugins: [
							'@babel/plugin-syntax-jsx',
							'@babel/plugin-transform-react-jsx',
							'@babel/plugin-transform-react-display-name',
							'@babel/plugin-transform-react-jsx-self',
							'@babel/plugin-transform-react-jsx-source',
						],
					},
				},
			},
		],
	},
	resolve: {
		extensions: ['.mjs', '.js'],
	},
	devtool: 'source-map',
	watch: true,
};
