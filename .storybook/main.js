/* eslint-disable security/detect-non-literal-fs-filename */
import config from '@arpadroid/module/storybook/main';
import Project from '../../module/src/project/project.mjs';
import { copyFileSync, existsSync, mkdirSync, readdirSync } from 'fs';
import { join, resolve } from 'path';
import PROJECT_STORE from '../../module/src/project/projectStore.mjs';

const projectPath = resolve(process.cwd(), '..', 'framework');
const project =
    PROJECT_STORE.framework ||
    new Project('framework', {
        buildType: 'uiComponent',
        path: projectPath
    });

/**
 * Recursively copies the contents of a directory to another directory.
 * @param {string} src - The source directory.
 * @param {string} dest - The destination directory.
 */
async function copyAssets(src, dest) {
    try {
        // Ensure destination directory exists
        await mkdirSync(dest, { recursive: true });

        // Read contents of the source directory
        const entries = await readdirSync(src, { withFileTypes: true });

        for (const entry of entries) {
            const srcPath = join(src, entry.name);
            const destPath = join(dest, entry.name);

            if (entry.isDirectory()) {
                // Recursively copy subdirectories
                await copyAssets(srcPath, destPath);
            } else {
                // Copy files, replacing if named the same
                await copyFileSync(srcPath, destPath);
            }
        }
    } catch (err) {
        console.error(`Error copying directory: ${err}`);
    }
}

export default (async () => {
    const stories = [];
    const staticDirs = [];
    await project.promise;
    
    // Dynamically import dependency helpers at runtime to avoid bundling/interop issues
    let deps = [];
    try {
        const helpers = await import('../../module/src/project/helpers/projectBuild.helper.mjs');
        const getAllDependencies = helpers.getAllDependencies ?? (async () => []);
        deps = (await getAllDependencies(project)) || [];
    } catch (err) {
        console.error('Failed to resolve dependencies for storybook config, continuing with empty deps', err);
        deps = [];
    }
    // Include current project's stories and static dirs so local stories show up
    if (existsSync(project.path + '/src')) {
        stories.push(project.path + '/src/**/*.stories.@(js|jsx|mjs|ts|tsx)');
        staticDirs.push(project.path + '/src');
    }
    existsSync(project.path + '/dist') && staticDirs.push(project.path + '/dist');

    deps.forEach(dep => {
        if (!dep) return;
        if (dep.name === 'module') return;

        const basePath = dep.path || resolve(`../${dep.name}`);
        stories.push(basePath + '/src/**/*.stories.@(js|jsx|mjs|ts|tsx)');

        existsSync(basePath + '/dist') && staticDirs.push(basePath + '/dist');
        existsSync(basePath + '/src') && staticDirs.push(basePath + '/src');
        if (existsSync(basePath + '/assets')) {
            staticDirs.push(basePath + '/assets');
            copyAssets(basePath + '/assets', project.path + '/dist/assets');
        }
        existsSync(basePath + '/storybook/decorators') && staticDirs.push(basePath + '/storybook/decorators');
    });

    return {
        ...config,
        stories: [...config.stories, ...stories],
        staticDirs: [...config.staticDirs, ...staticDirs]
    };
})();
