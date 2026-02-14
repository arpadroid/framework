import config from '@arpadroid/module/jest/config';
export default {
    ...config,
    verbose: false,
    reporters: ['jest-ci-spec-reporter']
};
