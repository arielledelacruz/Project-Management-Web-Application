import * as React from 'react';
import '@fortawesome/fontawesome-free/css/all.min.css';

const DeleteTaskButton = ({ onClick, className }) => {
  return (
    <div>
      <button type="button" onClick={onClick} className={className}>
        <i className="fas fa-trash-alt"></i>
      </button>
    </div>
  );
};

export default DeleteTaskButton;