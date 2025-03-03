/* eslint-disable security/detect-non-literal-fs-filename */
import { Project } from '@arpadroid/module';
import { log } from '@arpadroid/module/logger';
import { hideBin } from 'yargs/helpers';
import fs from 'fs';
import yargs from 'yargs';
const argv = yargs(hideBin(process.argv)).argv;
const PROJECT = argv.project;
const cwd = process.cwd();

const arpadroid = new Project('framework');
const projects =
    (PROJECT && [new Project(PROJECT)]) ||
    arpadroid.getArpadroidDependencies().map(dep => {
        return new Project(dep, { path: fs.realpathSync(`${cwd}/../${dep}`) });
    });

/**
 * Run tests for all projects.
 */
async function runTests() {
    const project = projects.shift();
    try {
        await project.test();
    } catch (error) {
        log.error(error);
    }
    if (projects.length) {
        runTests();
    }
}

runTests();
