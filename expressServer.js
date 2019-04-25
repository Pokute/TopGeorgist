// import express from 'express';
// import webpack from 'webpack';
// import webpackDevMiddleware from 'webpack-dev-middleware';

// import config from './config.js';
// const express = require('express');
const webpack = require('webpack');
const webpackDevMiddleware = require('webpack-dev-middleware');

// const config = {
// 	gameServer: {
// 		host: 'localhost',
// 		port: 24320,
// 	},
// 	httpServer: {
// 		host: 'localhost',
// 		port: 24321,
// 	},
// };

const webpackConfig = {
	// mode: 'development',
	// entry: [
	// './topGeorgist'
		// './reduxIndex',
	// ],
	// target: 'web',
	// output: {
	// 	filename: 'static/topGeorgist.bundle.js',
	// 	publicPath: '',
	// },
	// resolve: {
	// 	extensions: [
	// 		'.js',
	// 		'.mjs',
	// 		'.ts',
	// 		'.tsx',
	// 	],
	// },
	// module: {
	// 	rules: [
	// 		{
	// 			test: /(\.js$|\.mjs$|\.ts|\.tsx)/i,
	// 			exclude: /node_modules/,
	// 			use: {
	// 				loader: 'awesome-typescript-loader',
	// 			},
	// 		},
	// 		// {
	// 		// 	test: /(\.js$|\.mjs$|\.ts|\.tsx)/i,
	// 		// 	exclude: /node_modules/,
	// 		// 	type: 'javascript/auto',
	// 		// 	use: {
	// 		// 		loader: 'babel-loader',
	// 		// 		options: {
	// 		// 			babelrc: true,
	// 		// 		},
	// 		// 	},
	// 		// },
	// 		{
	// 			test: /\.css$/,
	// 			use: [
	// 				{ loader: 'style-loader' },
	// 				{ loader: 'css-loader' },
	// 			],
	// 		},
	// 	],
	// },
	// devtool: 'source-map',
	// watch: true,
};

// const app = express();

const devMiddlewareOptions = {
	// publicPath: '',
	// compress: true,
	// hot: true,
	// stats: 'errors-only',
	// noInfo: true,
	// errorDetails: true,
};

// const devMiddleware = webpackDevMiddleware(
// 	webpack(webpackConfig),
// 	devMiddlewareOptions,
// );

const devMiddleware = webpackDevMiddleware(
	webpack(webpackConfig),
	devMiddlewareOptions,
);

// // app.use(devMiddleware);
// app.use(express.static('static'));

// app.listen(config.httpServer);
