import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from '@jupyterlab/application';
import { ICommandPalette } from '@jupyterlab/apputils';
import { HomePageWidget } from './HomePage';
import { ILauncher } from '@jupyterlab/launcher';
import { CreateAssignmentPageWidget } from './CreateAssignmentWidget';
import { requestAPI } from './handler';

/**
 * The command IDs used by the react-widget plugin.
 */
namespace CommandIDs {
  export const homepage = 'genaigrader:open-home-page';
  export const createassignment = 'genaigrader:open-create-assignment';
}


const plugin: JupyterFrontEndPlugin<void> = {
  id: 'GenAIgrader:plugin',
  description: 'A JupyterLab extension for grading assignment using GenAI',
  autoStart: true,
  requires: [ICommandPalette, ILauncher],
  activate: (app: JupyterFrontEnd, palette: ICommandPalette, launcher: ILauncher) => {
    console.log('JupyterLab extension GenAIgrader is activated!');

    let nbgraderConfig: any = {};
    
    const { commands } = app;

    const command = CommandIDs.homepage;
    commands.addCommand(command, {
      label: 'Open GenAI Grader Home Page',
      execute: async () => {
        try {
          nbgraderConfig = await requestAPI<any>('get-config');
          const widget = new HomePageWidget(app, nbgraderConfig.config.course_directory);
          const id = `home-${Private.id++}`;
          widget.id = id
          widget.title.label = 'GenAI Grader Home Page';
          widget.title.closable = true;
          app.shell.add(widget, 'main');
          app.shell.activateById(widget.id);
        }catch (error) {
          console.error('Error fetching nbgrader configuration:', error);
        }
      }
    });

    // Add create assignment command
    const createAssignmentCommand = CommandIDs.createassignment;
    commands.addCommand(createAssignmentCommand, {
      label: 'Create New Assignment',
      execute: async () => {
           // Fetch nbgrader configuratio


        try {
          nbgraderConfig = await requestAPI<any>('get-config');
          console.log('Nbgrader configuration:', nbgraderConfig);
          const widget = new CreateAssignmentPageWidget(app, nbgraderConfig.config.course_directory);
          const id = `create-assignment-${Private.id++}`;
          widget.id = id;
          widget.title.label = 'Create New Assignment';
          widget.title.closable = true;
          app.shell.add(widget, 'main');
          app.shell.activateById(widget.id);
        } catch (error) {
          console.error('Error fetching nbgrader configuration:', error);
        }
           
      }
    });

    palette.addItem({
      command: command,
      category: 'GenAI Grader'
    });

    palette.addItem({
      command: createAssignmentCommand,
      category: 'GenAI Grader'
    });

    if (launcher) {
      launcher.add({
        command
      });
      launcher.add({
        command: createAssignmentCommand
      });
    }
  }
};

export default plugin;

/**
* The namespace for module private data.
*/
namespace Private {

  export let id = 0;
  }
