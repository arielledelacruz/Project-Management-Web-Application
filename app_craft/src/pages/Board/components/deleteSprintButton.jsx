import React from 'react';

const SprintButton = ({ sprintName, onDelete }) => {
  return (
    <div className="sprint-button">
      <span>{sprintName}</span>
      <button className="delete-button" onClick={onDelete}>-</button>
    </div>
  );
};

export default SprintButton;
