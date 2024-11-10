import * as React from 'react';
import '../cssFiles/CreateTaskButton.css'; // Assuming this is the CSS file where styles are defined

const CreateTaskButton = ({ onClick }) => {
    return (
        <div>
            <button type="button" onClick={onClick} className="create-task-button">
                Create
            </button>
        </div>
    );
};

export default CreateTaskButton;
