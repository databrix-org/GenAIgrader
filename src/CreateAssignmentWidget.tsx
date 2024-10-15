import React, { useState} from 'react';
import { JupyterFrontEnd } from '@jupyterlab/application';
import { ReactWidget } from '@jupyterlab/ui-components';
import { ManageAssignmentPage } from './ManageAssignmentComponent';
import { requestAPI } from './handler';


const CreateAssignmentPage: React.FC<{ app: JupyterFrontEnd, coursedirectorypath: string }> = ({ app }) => {
  const [assignmentName, setAssignmentName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [directoryCreated, setDirectoryCreated] = useState(false);

  const handleCreateAssignment = async () => {
    if (!assignmentName.trim()) {
      setError('Assignment name cannot be empty');
      return;
    }

    try {
      const response = await requestAPI<any>('create-assignment', {
        method: 'POST',
        body: JSON.stringify({ assignment_name: assignmentName })
      });

      if (response.success) {
        setDirectoryCreated(true);
        setError(null);
        console.log('Assignment created successfully:', response.directory);
      } else {
        setError(response.error || 'Failed to create assignment');
      }
    } catch (error) {
      console.error('Error creating assignment:', error);
      setError('An error occurred while creating the assignment');
    }
  };

  return (
    <div className="create-assignment-widget">
      <h2>Create New Assignment</h2>
      {!directoryCreated ? (
        <>
          <input
            type="text"
            value={assignmentName}
            onChange={(e) => setAssignmentName(e.target.value)}
            placeholder="Enter assignment name"
          />
          <button onClick={handleCreateAssignment}>Create Assignment</button>
          {error && <p className="error">{error}</p>}
        </>
      ) : (
        <ManageAssignmentPage assignmentname={assignmentName}  app={app} isReleased={false} />
      )}
    </div>
  );
}

export class CreateAssignmentPageWidget extends ReactWidget {
  private app: JupyterFrontEnd;
  private coursedirectorypath: string;

  constructor(app: JupyterFrontEnd, coursedirectorypath: string) {
    super();
    this.addClass('create-assignment-widget');
    this.app = app;
    this.coursedirectorypath = coursedirectorypath;
  }

  render(): JSX.Element {
    return <CreateAssignmentPage app={this.app} coursedirectorypath={this.coursedirectorypath} />;
  }
}
