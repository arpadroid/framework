import type { DependencyPointerType } from '@arpadroid/module';
import MainConfig from '@arpadroid/module/storybook/main';
import { getAllDependencies, getProject } from '@arpadroid/module';
import { existsSync, realpathSync } from 'fs';
import { join, relative } from 'path';

const project = getProject('framework');
if (!project?.path) {
    throw new Error('Framework project path not found');
}
const projectPath = project.path;

const pattern = join('src', '**', '*.stories.@(js|jsx|mjs|ts|tsx)');
const configDir = join(projectPath, '.storybook');

function getStoryPath(packagePath: string): string {
    const sourceRoot = existsSync(packagePath) ? realpathSync(packagePath) : packagePath;
    return relative(configDir, join(sourceRoot, pattern));
}

const config = (async () => {
    const stories = [];
    const staticDirs = [];
    const path = join(projectPath, 'node_modules', '@arpadroid');
    const mainProjectPath = getStoryPath(join(path, project.name));
    const distPath = join(projectPath, 'dist');
    const srcPath = join(projectPath, 'src');

    await project.promise;

    existsSync(distPath) && staticDirs.push(distPath);
    if (project.name !== 'framework' && existsSync(srcPath)) {
        stories.push(mainProjectPath);
    }

    let deps: DependencyPointerType[] = (await getAllDependencies(project)) || [];
    for (const dep of deps) {
        const depProject = dep?.project;
        if (!depProject || dep.name === 'module') continue;
        const config = await depProject.getBuildConfig();
        if (config.buildType !== 'uiComponent') continue;
        const depPath = getStoryPath(dep.path);
        stories.push(depPath);
    }

    return { ...MainConfig, stories, staticDirs };
})();

export default config;
