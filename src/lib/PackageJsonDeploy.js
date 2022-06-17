var path = require('path');
var { validate } = require('schema-utils');
var packageJson = require('../../package.json');

class PackageJsonDeploy {
  //#region Constants
  static defaultOptions = {
    OutputTo: './',
    PackageFormat: {
      name: null,
      version: null,
    },
  };

  static OptionsSchema = {
    type: 'object',
    properties: {
      OutputTo: { type: 'string' },
      PackageFormat: { type: 'object' },
    },
  };
  //#endregion

  //#region Fields
  options;
  //#endregion

  //#region Constructors
  constructor(options = {}) {
    // Applying user-specified options over the default options
    // and making merged options further available to the plugin methods.
    // You should probably validate all the options here as well.
    this.options = { ...PackageJsonDeploy.defaultOptions, ...options };

    validate(PackageJsonDeploy.OptionsSchema, this.options);
  }
  //#endregion

  //#region API Methods
  apply(compiler) {
    const pluginName = PackageJsonDeploy.name;

    const { webpack } = compiler;

    const { Compilation } = webpack;

    const { RawSource } = webpack.sources;

    compiler.hooks.thisCompilation.tap(pluginName, (compilation) => {
      compilation.hooks.processAssets.tap(
        {
          name: pluginName,
          stage: Compilation.PROCESS_ASSETS_STAGE_SUMMARIZE,
        },
        (assets) => {
          const outputTo = path.format({
            root: this.options.OutputTo,
            base: 'package.json',
          });

          let newPackageJson = {};

          var formatKeys = Object.keys(this.options.PackageFormat);

          formatKeys.forEach((key) => {
            const formatValue = this.options.PackageFormat[key];

            newPackageJson[key] =
              formatValue != null ? formatValue : packageJson[key];
          });

          compilation.emitAsset(
            outputTo,
            new RawSource(JSON.stringify(newPackageJson, null, 4))
          );
        }
      );
    });
  }
  //#endregion

  //#region Helpers
  //#endregion
}

module.exports = PackageJsonDeploy;
// module.exports = { PackageJsonDeploy };
