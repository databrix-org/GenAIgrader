import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from '@jupyterlab/application';

import { requestAPI } from './handler';

/**
 * Initialization data for the GenAIgrader extension.
 */
const plugin: JupyterFrontEndPlugin<void> = {
  id: 'GenAIgrader:plugin',
  description: 'A JupyterLab extension for using nbgrader with GenAI.',
  autoStart: true,
  activate: (app: JupyterFrontEnd) => {
    console.log('JupyterLab extension GenAIgrader is activated!');

    requestAPI<any>('get-example')
      .then(data => {
        console.log(data);
      })
      .catch(reason => {
        console.error(
          `The GenAIgrader server extension appears to be missing.\n${reason}`
        );
      });
  }
};

export default plugin;
