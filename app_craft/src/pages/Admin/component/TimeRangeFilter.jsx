import React, { useState } from "react";
import '../css/TimeRangeFilter.css';

function TimeRangeFilter({ onConfirm }) {
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [errorMessage, setErrorMessage] = useState("");


    const handleConfirm = () => {
        // Validate if both fields are filled
        console.log(`Start Date: ${startDate}`);
        console.log(`End Date: ${endDate}`);

        if (!startDate || !endDate) {
            setErrorMessage("Both 'From' and 'To' date fields are required."); // Set error message
        } else {
            setErrorMessage(""); // Clear error message
            onConfirm(startDate, endDate); // Pass the selected date range to the parent component
        }
    };

    return (
        <div>
            <div className="time-range-filter">
                <label htmlFor="startDate">From:</label>
                <input 
                    type="date" 
                    id="startDate" 
                    value={startDate} 
                    onChange={(e) => setStartDate(e.target.value)} 
                />
                <label htmlFor="endDate">To:</label>
                <input 
                    type="date" 
                    id="endDate" 
                    value={endDate} 
                    onChange={(e) => setEndDate(e.target.value)} 
                />
                <button onClick={handleConfirm}>Confirm</button>
            </div>

            {/* Error message in a new div under the time-range-filter */}
            {errorMessage && (
                <div className="error-message-container">
                    <p className="error-message">{errorMessage}</p>
                </div>
            )}
        </div>
    );
}

export default TimeRangeFilter;
