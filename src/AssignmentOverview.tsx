import React, { useState } from 'react';
import { JupyterFrontEnd } from '@jupyterlab/application';
import { LabIcon } from '@jupyterlab/ui-components';
import { notebookIcon } from '@jupyterlab/ui-components';
import { requestAPI } from './handler';
import PopUp from './PopUp';

interface AssignmentOverviewProps {
  assignmentname: string;
  app: JupyterFrontEnd;
  notebooklist: string[];
  assignmentDir: string;
  isReleased: boolean;
}

const ConvertToNbgraderButton: React.FC = () => (
  <button className="convert-button" onClick={() => console.log('Generate Assignment')}>
    Generate Assignment
  </button>
);

const NotebookItem: React.FC<{ notebookname: string }> = ({ notebookname }) => (
  <div className="notebook-item">
    <LabIcon.resolveReact icon={notebookIcon} />
    <a href={notebookname} className="notebook-link">
      {notebookname}
    </a>
    <ConvertToNbgraderButton />
  </div>
);

const Notebooks: React.FC<{ notebooklist: string[] }> = ({ notebooklist }) => {
  return (
    <div className="notebooks-container">
      <h3>Jupyter Notebooks:</h3>
      {notebooklist.map((notebook, index) => (
        <NotebookItem key={index} notebookname={notebook} />
      ))}
    </div>
  );
};

const ReleaseButton: React.FC<{ assignmentname: string; onRelease: () => void }> = ({ assignmentname, onRelease }) => {
  const [showPopup, setShowPopup] = useState(false);
  const [popupMessage, setPopupMessage] = useState('');

  const handleRelease = async () => {
    try {
      const response = await requestAPI<any>('release-assignment', {
        method: 'POST',
        body: JSON.stringify({ assignment_id: assignmentname })
      });
      
      setPopupMessage(response['message']);
      setShowPopup(true);
      if (response['success']) {
        onRelease();
      } 
    } catch (error) {
      console.error('Error releasing assignment:', error);
      setPopupMessage('Failed to release assignment. Please try again.');
      setShowPopup(true);
    }
  };

  return (
    <>
      <button className="release-button" onClick={handleRelease}>
        Release Assignment
      </button>
      {showPopup && <PopUp message={popupMessage} onClose={() => setShowPopup(false)} />}
    </>
  );
};

const UnreleaseButton: React.FC<{ assignmentname: string; onUnrelease: () => void }> = ({ assignmentname, onUnrelease }) => {
  const [showPopup, setShowPopup] = useState(false);
  const [popupMessage, setPopupMessage] = useState('');

  const handleUnrelease = async () => {
    try {
      const response = await requestAPI<any>(`release-assignment?assignment_id=${encodeURIComponent(assignmentname)}`, {
        method: 'DELETE'
      });
      setPopupMessage(response['message']);
      setShowPopup(true);
      if (response['success']) {
        onUnrelease();
      }
    } catch (error) {
      console.error('Error unreleasing assignment:', error);
      setPopupMessage('Failed to unrelease assignment. Please try again.');
      setShowPopup(true);
    }
  };

  return (
    <>
      <button className="unrelease-button" onClick={handleUnrelease}>
        Unrelease Assignment
      </button>
      {showPopup && <PopUp message={popupMessage} onClose={() => setShowPopup(false)} />}
    </>
  );
};

export const AssignmentOverview: React.FC<AssignmentOverviewProps> = ({
  assignmentname,
  app,
  notebooklist,
  assignmentDir,
  isReleased,
}) => {
  const [releaseStatus, setReleaseStatus] = useState(isReleased);

  const handleRelease = () => {
    setReleaseStatus(true);
  };

  const handleUnrelease = () => {
    setReleaseStatus(false);
  };

  return (
    <div className="assignment-overview">
      <h2>Assignment: {assignmentname}</h2>
      <a
        href="#"
        onClick={() => app.commands.execute('filebrowser:go-to-path', { path: assignmentDir })}
        className="open-filebrowser-link"
      >
        Edit files in File Browser
      </a>
      <Notebooks notebooklist={notebooklist} />
      {!releaseStatus ? (
        <ReleaseButton assignmentname={assignmentname} onRelease={handleRelease} />
      ) : (
        <UnreleaseButton assignmentname={assignmentname} onUnrelease={handleUnrelease} />
      )}
    </div>
  );
};
