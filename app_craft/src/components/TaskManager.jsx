import React, { useState } from 'react';
import CreateTaskButton from './CreateTaskButton.jsx';
import AddTaskOverlay from '/AddTaskOverlay.jsx';  // Corrected import path
import '../cssFiles/TaskManager.css';

const TaskManager = () => {
    const [isOverlayVisible, setOverlayVisible] = useState(false);
    const [tasks, setTasks] = useState([]);  // State to manage list of tasks

    const handleCreateButtonClick = () => {
        setOverlayVisible(true);  // Show the overlay
    };

    const handleOverlayClose = () => {
        setOverlayVisible(false);  // Hide the overlay
    };

    const handleTaskSave = (task) => {
        console.log('Task saved:', task);  // Check if the task object is correct
        setTasks((prevTasks) => {
            const updatedTasks = [...prevTasks, task];  // Add new task to the list
            console.log('Updated tasks list:', updatedTasks);  // Debugging output
            return updatedTasks;
        });
        setOverlayVisible(false);  // Hide the overlay after saving
    };

    console.log('Current tasks:', tasks);  // Check the state before rendering

    return (
        <div>
            <CreateTaskButton onClick={handleCreateButtonClick} />
            {isOverlayVisible && (
                <AddTaskOverlay onClose={handleOverlayClose} onSave={handleTaskSave} />
            )}

            {/* Render tasks dynamically */}
            <div className="task-list">
                {tasks.map((task, index) => (
                    <div key={index} className="task-item">
                        <div className="task-name">{task.name}</div>
                        <div className="task-details">
                            {/* Display tags, priority, and other task details */}
                            {task.tags.map((tag, i) => (
                                <span key={i} className="task-tag">{tag}</span>
                            ))}
                            <span className="task-priority">{task.priority}</span>
                            <span className="task-story-points">{task.storyPoints}</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default TaskManager;
