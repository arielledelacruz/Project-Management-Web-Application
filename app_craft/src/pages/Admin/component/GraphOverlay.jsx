import React from "react";
import { useState , useEffect } from "react";
import PropTypes from "prop-types";
import { Bar } from "react-chartjs-2";
import '../css/GraphOverlay.css'; // Create and import a CSS file for styling if needed
import { plugins, Ticks } from "chart.js";

function GraphOverlay({ onClose, selectedAccount, timeRange }) {
    const [labels, setLabels] = useState([]);
    const [hoursSpent, setHoursSpent] = useState([]);

    useEffect(() => {
        /**
         * this badboy will generate the labels for the graph
         * only if there's a time range filter if not then
         * it will generate the labels for all the time
         */
        const generateDateLabels = (account, timeRange) => {

            if (account && account.logTimeSpentTasks && Object.keys(account.logTimeSpentTasks).length > 0) {
                let dates = Object.values(account.logTimeSpentTasks).map(task => task.date);

                let startDate = timeRange.start;
                let endDate = timeRange.end;
        
                if (startDate && endDate) {
                    dates = dates.filter(date => {
                        const currentDate = new Date(date);
                        return currentDate >= new Date(startDate) && currentDate <= new Date(endDate);
                    });
                }

                const filteredHoursSpent = dates.map(date => {
                    const entry = Object.values(account.logTimeSpentTasks).find(task => task.date === date);
                    return entry ? entry.logTimeSpent : 0;
                });

                setLabels(dates);
                setHoursSpent(filteredHoursSpent);
            } else {
                console.log("No account data");
                return;
            }
        };

        if (selectedAccount) {
            generateDateLabels(selectedAccount, timeRange);
        } else {
            console.log("No account selected");
            setLabels([]);
            setHoursSpent([]);
        }
    }, []);

    const data = {
        labels: labels,
        datasets: [
            {
                data: hoursSpent,
                backgroundColor: 'rgba(54, 162, 235, 0.2)',
                borderColor: 'rgba(54, 162, 235, 1)',
                borderWidth: 1,
            },
        ],
    };

    const options = {
        scales: {
            x: {
                beginAtZero: true,
            },
            y: {
                beginAtZero: true,
                ticks: {
                    stepSize: 1,
                },
            },
        },
        plugins: {
            legend: {
                display: false,
            },
        },
    };

    return (
        <div className="graph-overlay">
            <div className="graph-container">
                <button className="overlay-close"onClick={onClose}>Close</button>
                <h2>Hours Spent</h2>
                <Bar data={data} options={options} />
            </div>
        </div>
    );
}

GraphOverlay.prototype = {
    onClose: PropTypes.func.isRequired,
    selectedAccount: PropTypes.object,
};

export default GraphOverlay;