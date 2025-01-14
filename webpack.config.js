const path = require('path');
const glob = require("glob");
const HtmlWebpackPlugin = require('html-webpack-plugin');
const BrowserSyncPlugin = require('browser-sync-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const PurgecssPlugin = require('purgecss-webpack-plugin');

const { CleanWebpackPlugin } = require('clean-webpack-plugin');

// spritesmith
const SpritesmithPlugin = require('webpack-spritesmith');
const MobileSpritesmithPlugin = require('webpack-spritesmith');

const PATHS = {
  src: path.join(__dirname, "src"),
};

// dev server configuration
const devServerConfiguration = {
  server: {
    baseDir: 'dist',
  },
  port: 8080,
};

// eslint-disable-next-line no-unused-vars
module.exports = function (env, args) {

  return {
    entry: "./src/index.js",
    output: {
      path: path.resolve(__dirname, "dist"),
      filename: "./js/index.bundle.js",
    },
    // Generate sourcemaps for proper error messages
    devtool: "source-map",
    performance: {
      // Turn off size warnings for entry points
      hints: false,
    },
    module: {
      rules: [
        {
          test: /\.(html)$/,
          use: {
            loader: "html-srcsets-loader",
            options: {
              attrs: [":src", ":srcset"],
              interpolate: true,
              minimize: false,
              removeComments: false,
            },
          },
        },
        {
          test: /\.(sa|sc|c)ss$/,
          use: [
            {
              loader: MiniCssExtractPlugin.loader,
              options: {
                publicPath: "../",
              },
            },
            {
              loader: "css-loader",
              options: {
                importLoaders: 2,
                sourceMap: true,
              },
            },
            {
              loader: "resolve-url-loader",
            },
            {
              loader: "postcss-loader",
              options: {
                postcssOptions: {
                  plugins: {
                    autoprefixer: {},
                  },
                },
                sourceMap: true,
              },
            },
            {
              loader: "sass-loader",
              options: {
                sourceMap: true,
              },
            },
          ],
        },
        {
          test: /\.(js)$/,
          loader: "babel-loader",
        },
        {
          enforce: "pre", // checked before being processed by babel-loader
          test: /\.(js)$/,
          loader: "eslint-loader",
        },
        {
          test: /\.(png|svg|jpe?g|gif)$/,
          use: [
            {
              loader: "file-loader",
              options: {
                name: "[name].[ext]?[hash]",
                outputPath: "images",
                esModule: false,
                // emitFile: true, // 주석 해제시 파일을 dist에 복사하지 않음
              },
            },
//             {
//               loader: "image-webpack-loader",
//               options: {
//                 disable: process.env.NODE_ENV !== "production", // Disable during development
//                 mozjpeg: {
//                   progressive: true,
//                   quality: 75,
//                 },
//               },
//             },
          ],
        },
        {
          test: /(favicon\.ico|site\.webmanifest|browserconfig\.xml|robots\.txt|humans\.txt)$/,
          loader: "file-loader",
          options: {
            name: "[name].[ext]",
          },
        },
        {
          test: /\.(woff(2)?|ttf|eot)(\?[a-z0-9=.]+)?$/,
          loader: "file-loader",
          options: {
            outputPath: "fonts",
            name: "[name].[ext]",
            limit: 10000, // 100 kb 이하 파일은 base64 인코딩 코드로 css에 적용
            esModule: false,
            // emitFile: true, // 주석 해제시 파일을 dist에 복사하지 않음
          },
        },
      ],
    },
    plugins: [
      // sync html files dynamically
      ...glob.sync("src/html/**/*.html").map((fileName) => {
        return new HtmlWebpackPlugin({
          template: fileName,
          minify: false, // Disable minification during production mode
          filename: fileName.replace("src/html/", ""),
          hash: true,
        });
      }),
      new BrowserSyncPlugin({
        ...devServerConfiguration,
        files: ["src/*"],
        ghostMode: {
          location: false,
        },
        injectChanges: true,
        logFileChanges: true,
        notify: false,
        reloadDelay: 0,
      }),
      new MiniCssExtractPlugin({
        filename: "./css/styles.css",
      }),
      new SpritesmithPlugin({
        src: {
          cwd: path.resolve(__dirname, 'src/assets/images', 'images', 'web'),
          glob: '*.png'
        },
        target: {
          image: path.resolve(__dirname, 'src/images/sprite-web.png'),
          css: path.resolve(__dirname, 'src/sprite-scss/sprite-web.scss')
        },
        apiOptions: {
          cssImageRef: "../images/sprite-web.png"
        }
      }),
      new MobileSpritesmithPlugin({
        src: {
          cwd: path.resolve(__dirname, 'src/assets/images', 'images', 'mobile'),
          glob: '*.png'
        },
        target: {
          image: path.resolve(__dirname, 'src/images/sprite-mobile.png'),
          css: path.resolve(__dirname, 'src/sprite-scss/sprite-mobile.scss')
        },
        apiOptions: {
          cssImageRef: "../images/sprite-mobile.png"
        }
      }),
      new PurgecssPlugin({
        paths: glob.sync(`${PATHS.src}/**/*`, { nodir: true }),
      }),
      new CleanWebpackPlugin(),
    ],
  };
}

