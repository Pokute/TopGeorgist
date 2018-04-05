// you can use this file to add your custom webpack plugins, loaders and anything you like.
// This is just the basic way to add additional webpack configurations.
// For more information refer the docs: https://storybook.js.org/configurations/custom-webpack-config

// IMPORTANT
// When you add this file, we won't add the default configurations which is similar
// to "React Create App". This only has babel loader to load JavaScript.

module.exports = {
  plugins: [
    // your custom plugins
  ],
  resolve: {
    extensions: [
      '.js',
      '.mjs',
    ],
  },
  module: {
		rules: [
      {
        // add your custom rules.
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
