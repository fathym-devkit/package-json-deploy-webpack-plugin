import { format as formatPath } from 'path';
import { Compiler } from 'webpack';
import { validate } from 'schema-utils';
import * as pkgJson from '../../package.json';

export class PackageJsonDeployOptions {
  public OutputTo?: string;

  public PackageFormat?: { [key: string]: string };
}
export default class PackageJsonDeploy {
  //#region Constants
  public static defaultOptions: PackageJsonDeployOptions = {
    OutputTo: './',
    PackageFormat: {
      name: null,
      version: null,
    },
  };

  public static OptionsSchema: any = {
    type: 'object',
    properties: {
      OutputTo: { type: 'string' },
      PackageFormat: { type: 'object' },
    },
  };
  //#endregion

  //#region Fields
  protected options: PackageJsonDeployOptions;

  protected get packageJson(): { [key: string]: string } {
    return <any>pkgJson;
  }
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
  apply(compiler: Compiler) {
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
          const outputTo = formatPath({
            root: this.options.OutputTo,
            base: 'package.json',
          });

          let newPackageJson: { [key: string]: string } = {};

          var formatKeys = Object.keys(this.options.PackageFormat);

          formatKeys.forEach((key) => {
            const formatValue = this.options.PackageFormat[key];

            newPackageJson[key] =
              formatValue != null ? formatValue : this.packageJson[key];
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
