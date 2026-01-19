/* eslint-disable security/detect-non-literal-fs-filename */
import { Project } from '@arpadroid/module';
import { log } from '@arpadroid/logger';
import { spawnSync } from 'child_process';
import fs from 'fs';

const cwd = process.cwd();
const framework = new Project('framework');
const deps = framework.getDependencies();
const projects = deps.map(dep => {
    return new Project(dep, { path: fs.realpathSync(`${cwd}/../${dep}`) });
});

const cmd = projects.map(project => project.getInstallCmd()).join(' && ');
log.info(`Installing projects: ${projects.map(project => project.name).join(', ')}`);
spawnSync(cmd, { shell: true, stdio: 'inherit' });

