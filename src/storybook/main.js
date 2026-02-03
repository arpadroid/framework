/**
 * @typedef {import('@arpadroid/module').DependencyProjectPointerType} DependencyProjectPointerType
 */
import { getAllDependencies, Project, PROJECT_STORE } from '@arpadroid/module';
import { existsSync } from 'fs';
import { resolve } from 'path';

const projectPath = resolve(process.cwd(), '..', 'framework');
const project =
    PROJECT_STORE.framework ||
    new Project('framework', {
        buildType: 'uiComponent',
        path: projectPath
    });

export default (async () => {
    const stories = [];
    const staticDirs = [];

    await project.promise;

    /** @type {DependencyProjectPointerType[]} */
    let deps = (await getAllDependencies(project)) || [];
    if (existsSync(project.path + '/src')) {
        stories.push(project.path + '/src/**/*.stories.@(js|jsx|mjs|ts|tsx)');
    }
    existsSync(project.path + '/dist') && staticDirs.push(project.path + '/dist');

    for (const dep of deps) {
        if (!dep || dep.name === 'module') continue;
        const config = await dep.project.getBuildConfig();
        if (config.buildType !== 'uiComponent') continue;
        const basePath = dep.path || resolve(`../${dep.name}`);
        stories.push(basePath + '/src/**/*.stories.@(js|jsx|mjs|ts|tsx)');
    }

    return {
        stories,
        staticDirs: staticDirs
    };
})();
