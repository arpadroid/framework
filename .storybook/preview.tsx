/**
 * Storybook preview configuration.
 * This file imports the preview configuration from the module and exports it.
 * Add your Storybook preview configuration overrides here if needed.
 */
import type { Preview } from '@storybook/web-components-vite';
import PreviewConfig from '@arpadroid/module/storybook/preview';

import { bootstrapDecorator } from '@arpadroid/module/storybook/decorators';
import { setService } from '@arpadroid/context';
import { Router, APIService } from '@arpadroid/services';
import { mergeObjects } from '@arpadroid/tools';

const config: Preview = mergeObjects(
    PreviewConfig,
    {
        parameters: {
            options: {
                // storySort: {
                //     order: [
                //         'Application',
                //         'Forms',
                //         ['Form', 'Field', 'Fields', 'Components'],
                //         'Lists',
                //         ['List', 'List Item', 'Components', 'Controls', 'Lists'],
                //         'Gallery',
                //         ['Gallery', 'Gallery Item', 'Components'],
                //         'UI',
                //         ['Components', 'Buttons', 'Dialogs'],
                //         'Navigation',
                //         'Messages',
                //         'I18n'
                //     ]
                // }
            }
        },
        decorators: [
            bootstrapDecorator(() => {
                setService('router', new Router());
                setService('apiService', APIService);
            })
        ]
    },
    { mergeArrays: true }
);

export default { ...config };
