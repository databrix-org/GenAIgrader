import React from 'react';
import '../style/AssignmentList.css';
import { FaBook } from 'react-icons/fa'; // Import the book icon

interface AssignmentListProps {
  assignments: { name: string }[];
  onAssignmentClick: (assignmentName: string) => void;
}

export const AssignmentList: React.FC<AssignmentListProps> = ({ assignments, onAssignmentClick }) => {
  return (
    <div className="assignment-list">
      {assignments.map((assignment) => (
        <div
          key={assignment.name}
          className="assignment-card"
          onClick={() => onAssignmentClick(assignment.name)}
        >
          <FaBook className="book-icon" />
          <h3>{assignment.name}</h3>
        </div>
      ))}
    </div>
  );
};
