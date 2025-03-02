/* eslint-disable security/detect-non-literal-fs-filename */
import { Project } from '@arpadroid/module';
import { log } from '@arpadroid/module/logger';
import fs from 'fs';

const cwd = process.cwd();
const arpadroid = new Project('module');
const projects = arpadroid.getArpadroidDependencies().map(dep => {
    return new Project(dep, { path: fs.realpathSync(`${cwd}/../${dep}`) });
});

const _projects = [projects[0], projects[1]];

/**
 * Run tests for all projects.
 */
async function install() {
    const project = _projects.shift();
    try {
        await project.install();
    } catch (error) {
        log.error(error);
    }
}

install();
