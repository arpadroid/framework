/**
 * @typedef {import('@arpadroid/module').BuildInterface} BuildInterface
 */
import path from 'path';
import copy from 'recursive-copy';
import { getBuild } from '@arpadroid/module/src/rollup/builds/rollup-builds.mjs';
const { build, plugins, project } = getBuild('framework', 'uiComponent');

plugins.push({
    name: 'compile-types',
    buildEnd: () => {
        project.getArpadroidDependencies().forEach(async dep => {
            copy(
                path.join(project.path, 'node_modules', '@arpadroid', dep, 'dist', '@types'),
                path.join(project.path, 'dist', '@types', dep),
                error => {
                    error && console.error('Copy failed', error);
                }
            );
        });
    }
});
export default build;
