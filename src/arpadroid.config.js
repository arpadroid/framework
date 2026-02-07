/** @type {import('@arpadroid/module').BuildConfigType} */
const config = {
    buildTypes: true,
    buildType: 'uiComponent',
    storybook_port: 6007,
    deps: ['tools', 'i18n', 'ui', 'context', 'services', 'resources', 'lists', 'messages', 'navigation', 'forms', 'gallery', 'application'],
    logo: `           ┓    • ┓  ┏                ┓ 
  ┏┓┏┓┏┓┏┓┏┫┏┓┏┓┓┏┫  ╋┏┓┏┓┏┳┓┏┓┓┏┏┏┓┏┓┃┏
  ┗┻┛ ┣┛┗┻┗┻┛ ┗┛┗┗┻  ┛┛ ┗┻┛┗┗┗ ┗┻┛┗┛┛ ┛┗
------┛-----------------------------------`
};

export default config;
