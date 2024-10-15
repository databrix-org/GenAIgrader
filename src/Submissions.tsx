import React, { useState, useEffect } from 'react';
import { JupyterFrontEnd } from '@jupyterlab/application';
import { requestAPI } from './handler';
import PopUp from './PopUp';

interface SubmissionsProps {
  assignmentname: string;
  app: JupyterFrontEnd;
}

const SubmissionTable: React.FC<{ assignmentname: string }> = ({ assignmentname}) => {
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [showPopup, setShowPopup] = useState(false);
  const [popupMessage, setPopupMessage] = useState('');

  const fetchSubmissions = async () => {
    try {
      const response = await requestAPI<any>(`get-submissions?assignment_id=${encodeURIComponent(assignmentname)}`);
      setSubmissions(response.submissions);
    } catch (error) {
      console.error('Error fetching submissions:', error);
    }
  };

  useEffect(() => {
    fetchSubmissions();
  }, [assignmentname]);

  const handleCollect = async () => {
    try {
      const response = await requestAPI<any>('get-submissions', {
        method: 'POST',
        body: JSON.stringify({ assignment_id: assignmentname }),
      });
      setPopupMessage(response.message || 'Assignments collected successfully');
      setShowPopup(true);
      fetchSubmissions();
    } catch (error) {
      console.error('Error collecting assignments:', error);
      setPopupMessage('Error collecting assignments');
      setShowPopup(true);
    }
  };

  return (
    <>
      <button 
        onClick={handleCollect}
        style={{ backgroundColor: 'green', color: 'white', padding: '10px', margin: '10px 0' }}
      >
        Collect Assignments
      </button>
      <table className="submission-table">
        <thead>
          <tr>
            <th>Student</th>
            <th>Notebook</th>
          </tr>
        </thead>
        <tbody>
          {submissions.map((submission, index) => (
            <tr key={index}>
              <td>{submission.student}</td>
              <td><a href={`#${submission.notebook}`}>{submission.notebook}</a></td>
            </tr>
          ))}
        </tbody>
      </table>
      {showPopup && (
        <PopUp message={popupMessage} onClose={() => setShowPopup(false)} />
      )}
    </>
  );
};

export const Submissions: React.FC<SubmissionsProps> = ({ assignmentname, app }) => {

  return (
    <div className="submissions">
      <h2>Submissions of Assignment: {assignmentname}</h2>
      <SubmissionTable assignmentname={assignmentname}  />
    </div>
  );
};
