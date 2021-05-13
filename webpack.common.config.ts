import ResolveTypeScriptPlugin from 'resolve-typescript-plugin';

export default {
	resolve: {
		// fullySpecified: true,
		plugins: [
			new ((ResolveTypeScriptPlugin as any).default)()
		],
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
					loader: 'ts-loader',
					// loader: 'awesome-typescript-loader',
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
