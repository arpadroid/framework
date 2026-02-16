/**
 * @typedef {import('@arpadroid/module').BuildConfigType} BuildConfigType
 * @typedef {import('@arpadroid/module').Project} Project
 * @typedef {import('@arpadroid/module').ProjectTestConfigType} ProjectTestConfigType
 * @typedef {import('@arpadroid/module').ProjectTestResponseType} ProjectTestResponseType
 * @typedef {import('@arpadroid/module').ProjectTestSuiteResponseType} ProjectTestSuiteResponseType
 */

import { getAllDependencies, getProject } from '@arpadroid/module';
import { hideBin } from 'yargs/helpers';
import yargs from 'yargs';

const argv = /** @type {Record<string, any>} */ (yargs(hideBin(process.argv)).argv);
const PROJECT_NAME = argv.project ?? process.env.project;

const project = getProject();
const deps = (project && (await getAllDependencies(project))) || [];

/** @type {BuildConfigType} */
const config = {
    buildTypes: true,
    buildManifest: true,
    buildType: 'uiComponent',
    storybook: { stories: deps.map(dep => dep.path) },
    storybook_port: 6007,
    deps: ['tools', 'i18n', 'ui', 'context', 'services', 'resources', 'lists', 'messages', 'navigation', 'forms', 'gallery', 'application'],
    logo: `           ┓    • ┓  ┏                ┓ 
  ┏┓┏┓┏┓┏┓┏┫┏┓┏┓┓┏┫  ╋┏┓┏┓┏┳┓┏┓┓┏┏┏┓┏┓┃┏
  ┗┻┛ ┣┛┗┻┗┻┛ ┗┛┗┗┻  ┛┛ ┗┻┛┗┗┗ ┗┻┛┗┛┛ ┛┗
------┛-----------------------------------`,
    hooks: {
        /**
         * Runs tests for the project and its dependencies.
         * @type {import('@arpadroid/module').BuildHookType}
         */
        test: async (project, payload) => {
            const testConfig = /** @type {ProjectTestConfigType} */ (payload?.testConfig);
            const { jest } = testConfig || {};
            /** @type {ProjectTestResponseType} */
            const response = {
                payloads: {},
                count: {},
                success: true
            };
            if (!jest) return response;
            for (const dep of deps) {
                if (PROJECT_NAME && dep.name !== PROJECT_NAME) continue;

                const proj = dep.project;
                await proj?.getBuildConfig();
                const result = await proj?.test({
                    jest: true,
                    storybook: false,
                    silent: true,
                    verbose: false,
                    slim: true
                });
                if (response.payloads) {
                    response.payloads[dep.name] = /** @type {ProjectTestSuiteResponseType} */ (result);
                }
            }
            return response;
        }
    }
};

export default config;
