/**
 * @typedef {import('@arpadroid/module').DependencyProjectPointerType} DependencyProjectPointerType
 */
import MainConfig from '@arpadroid/module/storybook/main';
import { getAllDependencies, getProject, Project, PROJECT_STORE } from '@arpadroid/module';
import { existsSync } from 'fs';
import { join } from 'path';

const project = getProject('framework');

const config = (async () => {
    const stories = [];
    const staticDirs = [];
    const pattern = join('src', '**', '*.stories.@(js|jsx|mjs|ts|tsx)');
    const path = join('..', 'node_modules', '@arpadroid');
    const mainProjectPath = join(path, project.name, pattern);
    const distPath = join(project.path, 'dist');
    const srcPath = join(project.path, 'src');

    await project.promise;

    existsSync(distPath) && staticDirs.push(distPath);
    if (project.name !== 'framework' && existsSync(srcPath)) {
        stories.push(mainProjectPath);
    }

    /** @type {DependencyProjectPointerType[]} */
    let deps = (await getAllDependencies(project)) || [];
    for (const dep of deps) {
        if (!dep || dep.name === 'module') continue;
        const config = await dep.project.getBuildConfig();
        if (config.buildType !== 'uiComponent') continue;
        const depPath = join(path, dep.name, pattern);
        stories.push(depPath);
    }

    return { ...MainConfig, stories, staticDirs };
})();

export default config;
