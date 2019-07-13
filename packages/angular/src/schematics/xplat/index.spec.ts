import { Tree } from '@angular-devkit/schematics';
import { supportedPlatforms, setTest, jsonParse, XplatHelpers } from '@nstudio/xplat';
import { createEmptyWorkspace, getFileContent } from '@nstudio/xplat/testing';
import { runSchematic, runSchematicSync } from '../../utils/testing';
setTest();

describe('xplat schematic', () => {
  let appTree: Tree;
  const defaultOptions: XplatHelpers.Schema = {
    npmScope: 'testing',
    prefix: 'ft' // foo test
  };

  beforeEach(() => {
    appTree = Tree.empty();
    appTree = createEmptyWorkspace(appTree);
  });

  it('should create default xplat support for web,nativescript + libs + testing support', async () => {
    const options: XplatHelpers.Schema = { ...defaultOptions };
    options.platforms = 'web,nativescript';

    const tree = await runSchematic('xplat', options, appTree);
    const files = tree.files;
    // console.log(files);
    expect(files.indexOf('/libs/core/index.ts')).toBeGreaterThanOrEqual(0);
    expect(files.indexOf('/libs/features/index.ts')).toBeGreaterThanOrEqual(0);
    expect(files.indexOf('/libs/scss/package.json')).toBeGreaterThanOrEqual(0);

    expect(files.indexOf('/testing/karma.conf.js')).toBeGreaterThanOrEqual(0);
    expect(files.indexOf('/testing/test.libs.ts')).toBeGreaterThanOrEqual(0);
    expect(files.indexOf('/testing/test.xplat.ts')).toBeGreaterThanOrEqual(0);
    expect(files.indexOf('/testing/tsconfig.libs.json')).toBeGreaterThanOrEqual(
      0
    );
    expect(
      files.indexOf('/testing/tsconfig.libs.spec.json')
    ).toBeGreaterThanOrEqual(0);
    expect(
      files.indexOf('/testing/tsconfig.xplat.json')
    ).toBeGreaterThanOrEqual(0);
    expect(
      files.indexOf('/testing/tsconfig.xplat.spec.json')
    ).toBeGreaterThanOrEqual(0);

    expect(files.indexOf('/xplat/web-angular/index.ts')).toBeGreaterThanOrEqual(0);
    expect(
      files.indexOf('/xplat/nativescript-angular/index.ts')
    ).toBeGreaterThanOrEqual(0);
  });

  it('should create default xplat support for web,nativescript', async () => {
    const options: XplatHelpers.Schema = { ...defaultOptions };
    options.platforms = 'web,nativescript';

    const tree = await runSchematic('xplat', options, appTree);
    const files = tree.files;
    expect(files.indexOf('/xplat/web-angular/features/items/items.module.ts')).toBe(-1);
    expect(files.indexOf('/xplat/web-angular/index.ts')).toBeGreaterThanOrEqual(0);
    expect(
      files.indexOf('/xplat/nativescript-angular/index.ts')
    ).toBeGreaterThanOrEqual(0);
    expect(
      files.indexOf('/xplat/nativescript-angular/features/items/items.module.ts')
    ).toBe(-1);
  });

  it('should create default xplat support for ionic which should always include web as well', async () => {
    const options: XplatHelpers.Schema = { ...defaultOptions };
    options.platforms = 'ionic';

    const tree = await runSchematic('xplat', options, appTree);
    const files = tree.files;
    expect(files.indexOf('/xplat/web-angular/index.ts')).toBeGreaterThanOrEqual(0);
    expect(files.indexOf('/xplat/ionic-angular/index.ts')).toBeGreaterThanOrEqual(0);
    expect(
      files.indexOf('/xplat/nativescript-angular/index.ts')
    ).toBeGreaterThanOrEqual(-1);
    const packagePath = '/package.json';
    const packageFile = jsonParse(getFileContent(tree, packagePath));
    const hasScss = packageFile.dependencies[`@testing/scss`];
    expect(hasScss).not.toBeUndefined();
    const hasWebScss = packageFile.dependencies[`@testing/web`];
    expect(hasWebScss).not.toBeUndefined();
    // should not include these root packages
    const hasNativeScript = packageFile.dependencies[`nativescript-angular`];
    expect(hasNativeScript).toBeUndefined();
  });

  it('should create default xplat support for electron which should always include web as well', async () => {
    const options: XplatHelpers.Schema = { ...defaultOptions };
    options.platforms = 'electron';

    const tree = await runSchematic('xplat', options, appTree);
    const files = tree.files;
    expect(files.indexOf('/xplat/web-angular/index.ts')).toBeGreaterThanOrEqual(0);
    expect(files.indexOf('/xplat/electron-angular/index.ts')).toBeGreaterThanOrEqual(0);
    expect(
      files.indexOf('/xplat/nativescript-angular/index.ts')
    ).toBeGreaterThanOrEqual(-1);
    const packagePath = '/package.json';
    const packageFile = jsonParse(getFileContent(tree, packagePath));
    const hasScss = packageFile.dependencies[`@testing/scss`];
    expect(hasScss).not.toBeUndefined();
    const hasWebScss = packageFile.dependencies[`@testing/web`];
    expect(hasWebScss).not.toBeUndefined();
    // should not include these root packages
    const hasNativeScript = packageFile.dependencies[`nativescript-angular`];
    expect(hasNativeScript).toBeUndefined();
    const hasElectron = packageFile.devDependencies[`electron`];
    expect(hasElectron).toBeDefined();
  });

  it('should create additional xplat support when generated with different platforms', async () => {
    const options: XplatHelpers.Schema = { ...defaultOptions };
    options.platforms = 'web,ionic';

    let tree = await runSchematic('xplat', options, appTree);
    let files = tree.files;
    expect(files.indexOf('/xplat/web-angular/index.ts')).toBeGreaterThanOrEqual(0);
    expect(files.indexOf('/xplat/ionic-angular/index.ts')).toBeGreaterThanOrEqual(0);
    expect(
      files.indexOf('/xplat/nativescript-angular/index.ts')
    ).toBeGreaterThanOrEqual(-1);

    options.onlyIfNone = true;
    options.platforms = 'nativescript';
    tree = await runSchematic('xplat', options, tree);
    files = tree.files;
    // should be unchanged
    expect(files.indexOf('/xplat/web-angular/index.ts')).toBeGreaterThanOrEqual(0);
    expect(files.indexOf('/xplat/ionic-angular/index.ts')).toBeGreaterThanOrEqual(0);
    expect(
      files.indexOf('/xplat/nativescript-angular/index.ts')
    ).toBeGreaterThanOrEqual(0);
  });

  it('should NOT create xplat unless platforms are specified', () => {
    const options: XplatHelpers.Schema = { ...defaultOptions };

    let tree;
    expect(
      () => (tree = runSchematicSync('xplat', options, appTree))
    ).toThrowError(
      `You must specify which platforms you wish to generate support for. For example: ng g @nstudio/xplat:init --prefix=foo --platforms=${supportedPlatforms.join(
        ','
      )}`
    );
  });

  it('should NOT create unsupported xplat option and throw', () => {
    const options: XplatHelpers.Schema = { ...defaultOptions };
    options.platforms = 'desktop';

    let tree;
    expect(
      () => (tree = runSchematicSync('xplat', options, appTree))
    ).toThrowError(
      `desktop is not a supported platform. Currently supported: ${supportedPlatforms}`
    );
  });
});
