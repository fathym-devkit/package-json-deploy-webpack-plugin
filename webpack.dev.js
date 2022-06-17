const { merge } = require('webpack-merge');
const common = require('./webpack.common.js');
const PackageJsonDeploy = require('./src/lib/PackageJsonDeploy.js');

module.exports = merge(common, {
  output: {
    filename: 'index.js',
  },
});
