import config from '@arpadroid/module/storybook/preview';
import { bootstrapDecorator } from '@arpadroid/module/storybook/decorators';
import { setService } from '@arpadroid/context';
import { Router, APIService } from '@arpadroid/services';

export default {
    ...config,
    parameters: {
        ...config.parameters,
        options: {
            ...config.parameters.options,
            storySort: {
                order: [
                    'Application',
                    'Forms',
                    ['Form', 'Field', 'Fields', 'Components'],
                    'Lists',
                    ['List', 'List Item', 'Components', 'Controls', 'Lists'],
                    'Gallery',
                    ['Gallery', 'Gallery Item', 'Components'],
                    'UI',
                    ['Components', 'Buttons', 'Dialogs'],
                    'Navigation',
                    'Messages',
                    'I18n'
                ]
            }
        }
    },
    decorators: [
        ...config.decorators,
        bootstrapDecorator(() => {
            setService('router', new Router());
            setService('apiService', APIService);
        })
    ]
};
