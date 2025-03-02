import path from 'path';
import copy from 'recursive-copy';
import { getBuild } from '@arpadroid/module';
const { build = {}, plugins, project } = getBuild('framework', 'uiComponent') || {};

Array.isArray(plugins) &&
    plugins?.push({
        name: 'compile-types',
        buildEnd: () => {
            project?.getArpadroidDependencies().forEach(async dep => {
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
