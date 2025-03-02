/**
 * @typedef {import('@arpadroid/module').BuildConfigType} BuildConfigType
 */
/** @type {BuildConfigType} */
const config = {
    buildTypes: true,
    deps: [
        'tools',
        'i18n',
        'ui',
        'context',
        'services',
        'resources',
        'lists',
        'messages',
        'navigation',
        'forms',
        'gallery',
        'application'
    ],
    logo: `           ┓    • ┓  ┏                ┓ 
  ┏┓┏┓┏┓┏┓┏┫┏┓┏┓┓┏┫  ╋┏┓┏┓┏┳┓┏┓┓┏┏┏┓┏┓┃┏
  ┗┻┛ ┣┛┗┻┗┻┛ ┗┛┗┗┻  ┛┛ ┗┻┛┗┗┗ ┗┻┛┗┛┛ ┛┗
------┛-----------------------------------`
};

export default config;
