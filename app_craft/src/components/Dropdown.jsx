// Dropdown.jsx
import React from 'react';
import '../cssFiles/Dropdown.css';  // Include the CSS file for Dropdown

function Dropdown({ options, selectedOption, onChange, label }) {
    return (
        <div className="dropdown">
            {label && <label className="dropdown-label">{label}</label>}
            <select 
                value={selectedOption} 
                onChange={(e) => onChange(e.target.value)} 
                className="dropdown-select"
            >
                {options.map((option, index) => (
                    <option key={index} value={option.value}>
                        {option.label}
                    </option>
                ))}
            </select>
        </div>
    );
}

export default Dropdown;
