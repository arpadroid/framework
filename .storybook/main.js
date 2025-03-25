/* eslint-disable security/detect-non-literal-fs-filename */
import config from '@arpadroid/module/storybook/main';
import Project from '../../module/src/projectBuilder/project.mjs';
import { copyFileSync, existsSync, mkdirSync, readdirSync } from 'fs';
import { join, resolve } from 'path';
const project = new Project('framework', 'uiComponent');

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

const stories = [];
const staticDirs = [];

project.getDependencies().forEach(dep => {
    if (dep === 'module') return;
    const basePath = resolve(`../${dep}`);
    stories.push(basePath + '/src/**/*.stories.@(js|jsx|mjs|ts|tsx)');

    existsSync(basePath + '/dist') && staticDirs.push(basePath + '/dist');
    existsSync(basePath + '/src') && staticDirs.push(basePath + '/src');
    if (existsSync(basePath + '/assets')) {
        staticDirs.push(basePath + '/assets');
        copyAssets(basePath + '/assets', project.path + '/dist/assets');
    }
    existsSync(basePath + '/storybook/decorators') && staticDirs.push(basePath + '/storybook/decorators');
});

export default {
    ...config,
    stories: [...config.stories, ...stories],
    staticDirs: [...config.staticDirs, ...staticDirs]
};
