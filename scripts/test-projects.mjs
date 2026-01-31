/* eslint-disable security/detect-non-literal-fs-filename */
import { getAllDependencies, Project } from '@arpadroid/module';
import { log } from '@arpadroid/logger';
import { hideBin } from 'yargs/helpers';
import fs from 'fs';
import yargs from 'yargs';
const argv = yargs(hideBin(process.argv)).argv;
const PROJECT = argv.project;
const cwd = process.cwd();

const framework = new Project('framework');

/**
 * Run tests for all projects.
 */
async function runTests() {
    await framework.promise;
    const projects = (await getAllDependencies(framework)).map(dep => dep.project);
    for (const project of projects) {
        try {
            await project.test({ ci: true, jest: true, storybook: true });
        } catch (error) {
            log.error(error);
        }
    }
}

runTests();
