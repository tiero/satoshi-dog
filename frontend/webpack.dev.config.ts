import {merge} from "webpack-merge";
import prod from "./webpack.config";

module.exports = merge(prod, {
  mode: 'development',
  devtool: 'inline-source-map',
  watch: true,
  watchOptions: {
    ignored: '**/node_modules/',
  }
});