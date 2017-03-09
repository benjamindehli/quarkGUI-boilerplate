var path = require('path');
var webpack = require('webpack');
var ExtractTextPlugin = require('extract-text-webpack-plugin');
var HTMLWebpackPlugin = require('html-webpack-plugin');


var DEVELOPMENT = process.env.NODE_ENV === 'development';
var PRODUCTION  = process.env.NODE_ENV === 'production';

var outputPath = 'dist';
var ouputPublicPath = '/';
var cssFileName = PRODUCTION ? 'style-[contenthash:10].css' : 'styles.css';
var scriptFileName = PRODUCTION ? 'bundle.[hash:12].min.js' : 'bundle.js';

var entry = PRODUCTION
	?	{
			vendor: ['dragula', 'font-awesome-webpack!font-awesome-webpack/font-awesome.config.js'],
			app: './src/index.ts'
		}
	: 	{
			vendor: ['dragula', 'font-awesome-webpack!font-awesome-webpack/font-awesome.config.js'],
			app: [ 
				'./src/index.ts',
				'webpack/hot/dev-server',
				'webpack-dev-server/client?http://localhost:8080'
			]
		};


var plugins = PRODUCTION
	? 	[
		    new webpack.optimize.CommonsChunkPlugin({name: "vendor", filename: "scripts/vendor.[hash:12].min.js"}),
			new webpack.optimize.UglifyJsPlugin({
				compress: {
					warnings: false,
		      		unused: true,
		      		dead_code: true,
		      		drop_console: true,
		    	},
		    	output: {
		      		comments: false,
		    	}
		  	}),
			new ExtractTextPlugin('style/' + cssFileName),
			new HTMLWebpackPlugin({
				template: 'index-template.html'
			})
		]
	: 	[ 
			new webpack.optimize.CommonsChunkPlugin({name: "vendor", filename: "vendor.js"}),
			new ExtractTextPlugin(cssFileName), 
			new webpack.HotModuleReplacementPlugin() 
		];

plugins.push(
	new webpack.DefinePlugin({
		DEVELOPMENT: JSON.stringify(DEVELOPMENT),
		PRODUCTION: JSON.stringify(PRODUCTION),
	})
);

const cssIdentifier = PRODUCTION ? '[hash:base64:10]' : '[path][name]---[local]';

const cssLoader = PRODUCTION
	?	ExtractTextPlugin.extract({
			use: 'css-loader?minimize!localIdentName=' + cssIdentifier
		})

	: 	['style-loader', 'css-loader?localIdentName=' + cssIdentifier];

const sassLoader = PRODUCTION
	?	ExtractTextPlugin.extract({
			use: 'css-loader?minimize!sass-loader?localIdentName=' + cssIdentifier
		})
	: 	['style-loader', 'css-loader?localIdentName=' + cssIdentifier, 'sass-loader'];

const lessLoader = PRODUCTION
	?	ExtractTextPlugin.extract({
			use: 'css-loader?minimize!less-loader?localIdentName=' + cssIdentifier
		})
	: 	['style-loader', 'css-loader?localIdentName=' + cssIdentifier, 'less-loader'];

module.exports = {
	devtool: 'source-map',
	entry: entry,
	plugins: plugins,
	resolve: {
		extensions: ['.webpack.js', '.web.js', '.ts', '.tsx', '.js']
  	},
	module: {
		loaders: [
		{
			test: /\.js$/,
			loaders: ['babel-loader'],
			exclude: '/node_modules/'
		}, {
			test: /\.ts(x?)$/,
      		exclude: /node_modules/,
      		loader: 'babel-loader!ts-loader'
		}, {
			test: /\.(png|jpg|gif)$/,
			loaders: ['url-loader?limit=10000&name=images/[ext]/[hash:12].[ext]'],
			exclude: '/node_modules/'
		}, {
			test: /\.css$/,
			loaders: cssLoader,
			exclude: '/node_modules/'
		}, {
			test: /\.scss$/,
			use: sassLoader,
			exclude: '/node_modules/'
		}, {
			test: /\.less$/,
			use: lessLoader,
			exclude: '/node_modules/'
		}, { 
			test: /\.(ttf|eot)(\?v=[0-9]\.[0-9]\.[0-9])?$/, 
			use: "file-loader?name=fonts/[hash:12].[ext]" 
		}, { 
			test: /\.svg(\?v=[0-9]\.[0-9]\.[0-9])?$/, 
			use: "svg-url-loader?noquotes&limit=1024&prefix=svg/[hash:12].[ext]"
		},{  
      		test: /\.woff(2)?(\?v=[0-9]\.[0-9]\.[0-9])?$/,  
      		use: "url-loader?limit=10000&mimetype=application/font-woff&name=fonts/[hash:12].[ext]"  
    	}
    	],

	},
	output: {
		path: path.join(__dirname, outputPath),
		publicPath: PRODUCTION ? ouputPublicPath : '/dist/',
		filename: PRODUCTION ? 'scripts/' + scriptFileName : scriptFileName
	}
};