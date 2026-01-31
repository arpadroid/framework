import path from 'path';
import copy from 'recursive-copy';
import { getBuild, getAllDependencies } from '@arpadroid/module';
import { existsSync, rmSync } from 'fs';
const { build = {}, plugins, project } = getBuild('framework') || {};

Array.isArray(plugins) &&
    plugins?.push({
        name: 'compile-types',
        buildEnd: async () => {
            if (!project?.path) return;
            const typesPath = path.join(project.path, 'dist', '@types');
            if (existsSync(typesPath)) {
                await rmSync(typesPath, { recursive: true, force: true });
            }
            const deps = await getAllDependencies(project);
            deps.forEach(async dep => {
                const depTypesPath = path.join(dep.path, 'dist', '@types');
                // if (!existsSync(depTypesPath)) return;
                copy(depTypesPath, path.join(typesPath, dep.name), error => {
                    error && console.error('Copy failed', error);
                });
            });
        }
    });
export default build;
