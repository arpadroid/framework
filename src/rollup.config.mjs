/* eslint-disable security/detect-non-literal-fs-filename */
import path from 'path';
import copy from 'recursive-copy';
import { getBuild } from '@arpadroid/module';
import { existsSync, rmSync } from 'fs';
const { build = {}, plugins, project } = getBuild('framework', 'uiComponent') || {};

Array.isArray(plugins) &&
    plugins?.push({
        name: 'compile-types',
        buildEnd: async () => {
            const typesPath = path.join(project.path, 'dist', '@types');
            if (existsSync(typesPath)) {
                await rmSync(typesPath, { recursive: true, force: true });
            }
            project?.getDependencies().forEach(async dep => {
                copy(
                    path.join(project.path, 'node_modules', '@arpadroid', dep, 'dist', '@types'),
                    path.join(typesPath, dep),
                    error => {
                        error && console.error('Copy failed', error);
                    }
                );
            });
        }
    });
export default build;
