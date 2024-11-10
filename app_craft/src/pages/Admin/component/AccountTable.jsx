import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import '../css/AccountTable.css'; // Create and import a CSS file for styling if needed
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'; // run this: npm install @fortawesome/react-fontawesome @fortawesome/free-solid-svg-icons
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';

function AccountTable({ title, accounts, onDelete, graph, changePassword, timeRange }) {
    const [passwordVisibility, setPasswordVisibility] = useState({});
    const [averageLogTimes, setAverageLogTimes] = useState([]);
    const [totalLogTimes, setTotalLogTimes] = useState([]);

    const togglePasswordVisibility = (index) => {
        setPasswordVisibility((prevState) => ({
            ...prevState,
            [index]: !prevState[index],
        }));
    };
    const convertDate = (dateStr) => {
        const [day, month, year] = dateStr.split('/');
        return `${year}-${month}-${day}`;
    };
    useEffect(() => {
        // Calculate average log times and total log times and store them in the arrays
        const calculateLogTimes = () => {
            const averages = [];
            const totals = [];
            console.log("this is run")

            accounts.forEach(account => {
                if (account.logTimeSpentTasks && account.logTimeSpentTasks.length > 0) {
                    let filteredTasks = account.logTimeSpentTasks;
                    console.log("this is run")
                    // Filter tasks based on the timeRange if provided
                    if (timeRange && timeRange.start && timeRange.end) {
                        filteredTasks = account.logTimeSpentTasks.filter(task => {
                            console.log("this is task", task)
                            const taskDate = new Date(convertDate(task.date));
                            const startDate = new Date(timeRange.start);
                            const endDate = new Date(timeRange.end);
                            console.log(`Task Date: ${taskDate}, Start Date: ${startDate}, End Date: ${endDate}`);
                            return taskDate >= startDate && taskDate <= endDate;
                        });
                    }

                    if (filteredTasks.length > 0) {
                        const totalLogTime = filteredTasks.reduce((total, task) => total + task.logTimeSpent, 0);
                        totals.push(totalLogTime);

                        let averageLogTime;
                        if (timeRange && timeRange.start && timeRange.end) {
                            const periodLength = (new Date(timeRange.end) - new Date(timeRange.start)) / (1000 * 60 * 60 * 24) + 1; // Period length in days
                            averageLogTime = (totalLogTime / periodLength).toFixed(2);
                        } else {
                            averageLogTime = (totalLogTime / filteredTasks.length).toFixed(2);
                        }
                        averages.push(averageLogTime);
                    } else {
                        totals.push(0);
                        averages.push(0);
                    }
                } else {
                    totals.push(0);
                    averages.push(0);
                }
            });

            setTotalLogTimes(totals);
            setAverageLogTimes(averages);
        };

        calculateLogTimes();
    }, [accounts, timeRange]);

    return (
        <div className="account-table">
            <h2>{title}</h2>
            <table>
                <thead>
                    <tr>
                        <th>Username</th>
                        <th>Password</th>
                        <th>Log Time Spent</th>
                        <th>Average Log Time</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody>
                    {accounts.map((account, index) => (
                        <tr key={index}>
                            {/* Username */}
                            <td className="username-column">{account.email}</td> 

                            {/* Password */}
                            <td className="password-column">
                                <div className="password-container">
                                    <span>
                                        {passwordVisibility[index] ? account.password : "*".repeat(10)}
                                    </span>
                                    <FontAwesomeIcon
                                        icon={passwordVisibility[index] ? faEye : faEyeSlash}
                                        onClick={() => togglePasswordVisibility(index)}
                                    />
                                </div>
                            </td>

                            {/* Log Time Spent */}
                            <td className="time-spent-column">{totalLogTimes[index]}</td>

                            {/* Average Log Time */}
                            <td className="average-column">{averageLogTimes[index]}</td>

                            {/* Action */}
                            <td className="buttons-column">
                                <button 
                                    className="change-password-button"
                                    onClick={() => changePassword(account.id)}
                                >
                                    Change Password
                                </button>
                                <button 
                                    className="show-graph-button" 
                                    onClick={() => graph(account)}
                                >
                                    <i className="fa fa-bar-chart"></i>
                                </button>
                                <button 
                                    className="delete-button" 
                                    onClick={() => onDelete(account.id)}
                                >
                                    <i className="fa fa-trash"></i>
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

AccountTable.propTypes = {
    title: PropTypes.string.isRequired,
    accounts: PropTypes.arrayOf(
        PropTypes.shape({
            id: PropTypes.string.isRequired,
            email: PropTypes.string.isRequired,
            isAdmin: PropTypes.bool.isRequired,
            logTimeSpentTasks: PropTypes.arrayOf(
                PropTypes.shape({
                    date: PropTypes.string.isRequired,
                    logTimeSpent: PropTypes.number.isRequired,
                })
            ),
        })
    ).isRequired,
    onDelete: PropTypes.func.isRequired,
    graph: PropTypes.func.isRequired,
    changePassword: PropTypes.func.isRequired,
    timeRange: PropTypes.shape({
        start: PropTypes.string,
        end: PropTypes.string,
    }),
};

export default AccountTable;