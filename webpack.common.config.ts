import ResolveTypeScriptPlugin from 'resolve-typescript-plugin';
import Module from "node:module";

const require = Module.createRequire(import.meta.url);
const Dotenv = require('dotenv-webpack');

export default {
	plugins: [
		new Dotenv(),
	],
	resolve: {
		// fullySpecified: true,
		plugins: [
			new ((ResolveTypeScriptPlugin as any).default)(),
		],
		extensions: [
			'.js',
			'.mjs',
			'.ts',
			'.tsx',
		],
		fallback: {
			'crypto': false,
			'path': false,
		} as const
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
 