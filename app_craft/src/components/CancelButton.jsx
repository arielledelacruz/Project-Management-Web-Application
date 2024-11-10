import * as React from 'react';

const CancelButton = ({ onClick, className }) => {
  return (
    <div>
      <button type="button" onClick={onClick} className={`cancel-button ${className}`}>
        Cancel
      </button>
    </div>
  );
};

export default CancelButton;
