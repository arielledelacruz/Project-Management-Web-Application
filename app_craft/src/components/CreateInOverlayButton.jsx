import React from "react";

const CreateInOverlayButton = ({ onClick, className }) => {
    return (
        <button type="button" onClick={onClick} className={`create-button ${className}`}>
            Create
        </button>
    );
}

export default CreateInOverlayButton;
