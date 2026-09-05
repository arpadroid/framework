import cfg from '@arpadroid/module/vitest/config';

const config = {
    ...cfg,
    test: {
        ...cfg.test,
        root: '../',
        dir: '../'
    }
};
export default config;
