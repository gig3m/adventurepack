var path = require('path');

module.exports = {
	entry: './src/main.js',
	output: {
		path: path.resolve(__dirname, 'public/dist/'),
		publicPath: "dist/",
		filename: 'bundle.js'
	},
  devtool: 'source-map',
  devServer:{
		contentBase: path.resolve(__dirname, 'public/')
  },
	module: {
		loaders: [
			{
        test: /\.vue$/, // a regex for matching all files that end in `.vue`
        loader: 'vue'   // loader to use for matched files
      },
			{
				test: /\.js$/,
				exclude: /node_modules/,
				loader: 'babel-loader'
			},
			{
				test: /\.css$/,
				loader: 'style!css'
			}
		]
	}
};
