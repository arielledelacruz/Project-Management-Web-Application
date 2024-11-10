import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import NavigationBar from "../../components/NavigationBar"; // Adjust the path as necessary
import localDB from '../../LocalDatabase'; // Adjust the path as necessary
import TaskBoard from './Components/TaskBoard';
import './SprintPlanPage.css'; // Ensure this import is correct

const SprintPlanPage = () => {
    const location = useLocation();
    const sprintFromState = location.state?.sprint; // Retrieve the sprint object from location state if available

    const [backlog, setBacklog] = useState([]); // Initialize an empty backlog
    const [sprint, setSprint] = useState(sprintFromState || { name: '', tasks: [] }); // Initialize sprint

    // Fetch product backlog tasks from localDB
    const fetchBacklogTasks = async () => {
        try {
            await localDB.init(); // Initialize localDB and fetch the data
            const tasks = localDB.getData(); // Get the tasks from the localDB
            const filteredTasks = tasks.filter(task => task.status === null); // Filter backlog tasks
            setBacklog(filteredTasks);
        } catch (error) {
            console.error('Error fetching product backlog tasks:', error);
        }
    };

    useEffect(() => {
        fetchBacklogTasks();
    }, []); // Empty dependency array means this effect runs once when the component mounts

    useEffect(() => {
        console.log('Backlog', backlog);
    }, [backlog]); // This effect runs whenever the backlog state changes

        return (
            <div className="sprintPlanPage-container">
                <NavigationBar />
                <div className="content">
                    <Link to="/sprintboard" className="back-button">Back to Sprint Board</Link>
                    <h1>{sprint.name}</h1>
                    {console.log('Backlog passed to TaskBoard:', backlog)}
                    {console.log('Sprint tasks passed to TaskBoard:', sprint.tasks)}
                    <TaskBoard
                        backlog={backlog}
                        sprintTasks={sprint.tasks}
                        setBacklog={setBacklog}
                        setSprint={setSprint}
                        sprintID={sprint.id} // Pass the sprint ID if available
                    />
                </div>
            </div>
        );
    };

export default SprintPlanPage;
