import React, { useState, useEffect } from 'react';
import { ReactWidget } from '@jupyterlab/ui-components';
import '../style/HomePage.css';
import { AssignmentList } from './AssignmentList';
import { JupyterFrontEnd } from '@jupyterlab/application';
import { getAssignments } from './handler';
import { ManageAssignmentPage } from './ManageAssignmentComponent';

// Modify the HomePage component to accept props
const HomePage: React.FC<{ app: JupyterFrontEnd, coursedirectorypath: string }> = ({ app, coursedirectorypath }) => {
  const [allAssignments, setAllAssignments] = useState<{ name: string }[]>([]);
  const [releasedAssignments, setReleasedAssignments] = useState<{ name: string }[]>([]);
  const [selectedAssignment, setSelectedAssignment] = useState<string | null>(null);

  useEffect(() => {
    fetchAssignments();
  }, []);

  const fetchAssignments = async () => {
    try {
      const response = await getAssignments();
      if (response && response.all_assignments && response.released_assignments) {
        setAllAssignments(response.all_assignments.map((assignment: string) => ({ name: assignment })));
        setReleasedAssignments(response.released_assignments.map((assignment: string) => ({ name: assignment })));
      }
    } catch (error) {
      console.error('Error fetching assignments:', error);
      // Handle error (e.g., show an error message to the user)
    }
  };

  const createAssignment = () => {
    app.commands.execute('genaigrader:open-create-assignment');
  };

  const handleAssignmentClick = (assignmentName: string) => {
    setSelectedAssignment(assignmentName);
  };

  if (selectedAssignment) {
    const isReleased = releasedAssignments.some(assignment => assignment.name === selectedAssignment);
    return (
      <ManageAssignmentPage
        assignmentname={selectedAssignment}
        app={app}
        isReleased={isReleased}
      />
    );
  }

  const unreleasedAssignments = allAssignments.filter(
    assignment => !releasedAssignments.some(released => released.name === assignment.name)
  );

  return (
    <div className="home-page">
      <h2>Drafts:</h2>
      <AssignmentList assignments={unreleasedAssignments} onAssignmentClick={handleAssignmentClick} />
      <h2>Released Assignments:</h2>
      <AssignmentList assignments={releasedAssignments} onAssignmentClick={handleAssignmentClick} />
      <h2>Create New Assignment</h2>
      <div className="new-assignment-card" onClick={createAssignment}>
        <span className="plus-symbol">+</span>
      </div>
    </div>
  );
};

export class HomePageWidget extends ReactWidget {
  private app: JupyterFrontEnd;
  private coursedirectorypath: string;

  constructor(app: JupyterFrontEnd, coursedirectorypath: string) {
    super();
    this.addClass('home-widget');
    this.app = app;
    this.coursedirectorypath = coursedirectorypath;
  }

  render(): JSX.Element {
    return <HomePage app={this.app} coursedirectorypath={this.coursedirectorypath}  />;
  }
}
