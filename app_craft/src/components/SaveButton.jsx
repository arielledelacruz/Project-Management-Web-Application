import * as React from 'react';

const SaveButton = ({ onClick, className }) => {
  return (
    <div>
      <button type="button" onClick={onClick} className={`save-button ${className}`}>
        Save
      </button>
    </div>
  );
};

export default SaveButton;
