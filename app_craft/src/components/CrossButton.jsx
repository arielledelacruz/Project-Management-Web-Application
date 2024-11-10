import * as React from 'react';

const CrossButton = ({ onClick, className }) => {
  return (
    <button 
      type="button" 
      onClick={onClick} 
      className={`cross-button ${className}`}>
      &times; {/* Using &times; for the 'x' symbol */}
    </button>
  );
};

export default CrossButton;
