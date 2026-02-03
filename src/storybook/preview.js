// @ts-ignore
import { bootstrapDecorator } from '@arpadroid/module/storybook/decorators';
import { setService } from '@arpadroid/context';
import { Router, APIService } from '@arpadroid/services';

export default {
    parameters: {
        options: {
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
        bootstrapDecorator(() => {
            // @ts-ignore
            setService('router', new Router()); // @ts-ignore
            setService('apiService', APIService);
        })
    ]
};
