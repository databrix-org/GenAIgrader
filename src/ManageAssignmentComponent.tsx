import React, { useState, useEffect } from 'react';
import { JupyterFrontEnd } from '@jupyterlab/application';
import { fetchAssignmentDetails } from './handler';
import { LabIcon } from '@jupyterlab/ui-components';
import { homeIcon, listIcon } from '@jupyterlab/ui-components';
import { AssignmentOverview } from './AssignmentOverview';
import { Submissions } from './Submissions';
import '../style/ManageAssignment.css';

interface ManageAssignmentPageProps {
  assignmentname: string;
  app: JupyterFrontEnd;
  isReleased: boolean;
}

const LeftNavBar: React.FC<{ activeTab: string; setActiveTab: (tab: string) => void; app: JupyterFrontEnd }> = ({ activeTab, setActiveTab, app  }) => (
  <div className="left-nav-bar">
    <div className="nav-buttons">
      <button onClick={() => setActiveTab('Overview')} className={activeTab === 'Overview' ? 'active' : ''}>
        <LabIcon.resolveReact icon={homeIcon} />
        <span>Overview</span>
      </button>
      <button onClick={() => setActiveTab('Submissions')} className={activeTab === 'Submissions' ? 'active' : ''}>
        <LabIcon.resolveReact icon={listIcon} />
        <span>Submissions</span>
      </button>
    </div>
  </div>
);

const BackButton: React.FC<{ app: JupyterFrontEnd }> = ({ app }) => (
  <button 
    className="back-button" 
    onClick={() => {
      app.shell.currentWidget?.close();
      app.commands.execute('genaigrader:open-home-page');
    }}
  >
    <LabIcon.resolveReact icon={homeIcon} />
    <span>Back to Home</span>
  </button>
);

export const ManageAssignmentPage: React.FC<ManageAssignmentPageProps> = ({ assignmentname, app, isReleased }) => {
  const [activeTab, setActiveTab] = useState('Overview');
  const [notebooks, setNotebooks] = useState<string[]>([]);
  const [relativeassignmentDir, setRelativessignmentDir] = useState<string>('');

  useEffect(() => {
    const fetchAssignmentPath = async () => {
      try {
        const response = await fetchAssignmentDetails(assignmentname);
        const notebookNames = response.notebooks.map((notebook: any) => notebook.name);
        setNotebooks(notebookNames);

        const relativeassignmentDir = response.assignment_dir;
        setRelativessignmentDir(relativeassignmentDir);
        console.log(relativeassignmentDir);
        console.log(notebookNames);
      } catch (error) {
        console.error('Error fetching assignment path:', error);
      }
    };
    fetchAssignmentPath();
  }, [assignmentname]);

  return (
    <div className="manage-assignment-page">
      <div className="manage-assignment-content">
        <LeftNavBar activeTab={activeTab} setActiveTab={setActiveTab} app={app} />
        <div className="main-content">
          {activeTab === 'Overview' ? (
            <AssignmentOverview 
              assignmentname={assignmentname} 
              app={app} 
              notebooklist={notebooks}
              assignmentDir={relativeassignmentDir}
              isReleased={isReleased}
            />
          ) : (
            <Submissions assignmentname={assignmentname} app={app} />
          )}
        </div>
        <BackButton app={app} />
      </div>
    </div>
  );
};
