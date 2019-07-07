import { Tree } from '@angular-devkit/schematics';
import {
  SchematicTestRunner,
  UnitTestTree
} from '@angular-devkit/schematics/testing';
import { getFileContent } from '@schematics/angular/utility/test';
import * as path from 'path';

import { supportedPlatforms, setTest, jsonParse, IXplatSchema } from '@nstudio/workspace';
import { createEmptyWorkspace } from '@nstudio/workspace/testing';
setTest();

describe('xplat schematic', () => {
  const schematicRunner = new SchematicTestRunner(
    '@nstudio/web',
    path.join(__dirname, '../../../collection.json')
  );
  const defaultOptions: IXplatSchema = {
    npmScope: 'testing',
    prefix: 'ft' // foo test
  };

  let appTree: Tree;

  beforeEach(() => {
    appTree = Tree.empty();
    appTree = createEmptyWorkspace(appTree);
  });

  it('should create default xplat support for web only', () => {
    const options: IXplatSchema = { ...defaultOptions };

    const tree = schematicRunner.runSchematic('xplat', options, appTree);
    const files = tree.files;
    expect(files.indexOf('/xplat/web/index.ts')).toBeGreaterThanOrEqual(0);
    expect(
      files.indexOf('/xplat/nativescript/index.ts')
    ).toBeGreaterThanOrEqual(-1);
    const packagePath = '/package.json';
    const packageFile = jsonParse(getFileContent(tree, packagePath));
    const hasScss = packageFile.dependencies[`@testing/scss`];
    expect(hasScss).not.toBeUndefined();
    // should not include these root packages
    const hasNativeScript = packageFile.dependencies[`nativescript-angular`];
    expect(hasNativeScript).toBeUndefined();
  });
});
