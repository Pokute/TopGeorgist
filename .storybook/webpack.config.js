// you can use this file to add your custom webpack plugins, loaders and anything you like.
// This is just the basic way to add additional webpack configurations.
// For more information refer the docs: https://storybook.js.org/configurations/custom-webpack-config

// IMPORTANT
// When you add this file, we won't add the default configurations which is similar
// to "React Create App". This only has babel loader to load JavaScript.

commonConfig = {
	resolve: {
		extensions: [
			'.js',
			'.mjs',
			'.ts',
			'.tsx',
		],
	},
	module: {
		rules: [
			{
				test: /(\.js$|\.mjs$|\.ts|\.tsx)/i,
				exclude: /node_modules/,
				use: {
					loader: 'awesome-typescript-loader',
				},
			},
			// {
			// 	test: /(\.js$|\.mjs$|\.ts|\.tsx)/i,
			// 	exclude: /node_modules/,
			// 	type: 'javascript/auto',
			// 	use: {
			// 		loader: 'babel-loader',
			// 		options: {
			// 			babelrc: true,
			// 		},
			// 	},
			// },
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

const config = {
	...commonConfig,
	plugins: [
		// your custom plugins
	],
};

module.exports = config;
