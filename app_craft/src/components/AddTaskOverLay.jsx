// AddTaskOverlay.jsx
import React, { useState } from 'react';
import '../cssFiles/AddTaskOverlay.css';
import CancelButton from './CancelButton.jsx';
import CreateInOverlayButton from './CreateInOverlayButton.jsx';
import CrossButton from './CrossButton.jsx';
import Dropdown from './Dropdown.jsx';  // Import Dropdown if needed
import localDB from '../LocalDatabase.jsx';

function validateForm(value) {
    // Validate the task object
    if (!value.name) {
        alert('Task name is required');
        return false;
    }
    if (value.tags.length === 0) {
        alert('Tags are required at least one');
        return false;
    }
    if (!value.description) {
        alert('Description is required');
        return false;
    }
    return true;
}

function AddTaskOverlay({ onClose, onSave }) {
    const [taskName, setTaskName] = useState('');
    const [taskType, setTaskType] = useState('Story');
    const [taskStage, setTaskStage] = useState('Planning');
    const [storyPoints, setStoryPoints] = useState(1);
    const [priority, setPriority] = useState('Low');
    const [tags, setTags] = useState([]);
    const [assignee, setAssignee] = useState('');
    const [description, setDescription] = useState('');

    const taskTypes = ['Story', 'Bug'];
    const taskStages = ['Planning', 'Development', 'Testing', 'Integration'];
    const priorities = ['Low', 'Medium', 'Important', 'Urgent'];
    const availableTags = ['Frontend', 'Backend', 'API', 'Database', 'Framework', 'Testing', 'UI', 'UX'];

    const handleTagChange = (event) => {
        const value = event.target.value;
        setTags(prevTags => 
            prevTags.includes(value) ? prevTags.filter(tag => tag !== value) : [...prevTags, value]
        );
    };

    const handleSave = () => {
        // Example save logic
        const task = {
            name: taskName,
            type: taskType,
            stage: taskStage,
            storyPoints,
            priority,
            priorityNum: priority === 'Low' ? 1 : priority === 'Medium' ? 2 : priority === 'Important' ? 3 : 4,
            tags,
            assignee,
            description,
            history: [],
            dateCreated: new Date(),
            status: null, // if its null then its not in any of the active sprints
            completedDate: null,
        };
        if (validateForm(task)) {
            onSave(task);
            localDB.addData(task);
            onClose();  // Close the overlay after saving
        }
    };

    return (
        <div className="overlay">
            <div className="overlay-content">
                <h2 className="overlay-title">Add Task</h2>
                <div><CrossButton onClick={onClose} className="cross-button"/></div>
                <div className="form-group">
                    <label htmlFor="task-name" className="task-label">Task Name</label>
                    <input
                        type="text"
                        id="task-name"
                        placeholder="Enter task name"
                        className="task-input"
                        value={taskName}
                        onChange={(e) => setTaskName(e.target.value)}
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="task-type" className="task-label">Task Type</label>
                    <Dropdown
                        id="task-type"
                        options={taskTypes.map(type => ({ value: type, label: type }))}
                        selectedOption={taskType}
                        onChange={setTaskType}
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="task-stage" className="task-label">Task Stage</label>
                    <Dropdown
                        id="task-stage"
                        options={taskStages.map(stage => ({ value: stage, label: stage }))}
                        selectedOption={taskStage}
                        onChange={setTaskStage}
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="story-points" className="task-label">Story Points</label>
                    <input
                        type="number"
                        id="story-points"
                        min="1"
                        max="10"
                        value={storyPoints}
                        onChange={(e) => setStoryPoints(Number(e.target.value))}
                        className="task-input"
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="priority" className="task-label">Priority</label>
                    <div className="priority-container">
                        {['Low', 'Medium', 'Important', 'Urgent'].map(priorityLevel => (
                            <div key={priorityLevel} className="priority-checkbox-wrapper">
                                <input
                                    type="radio"  // Use radio buttons since only one priority can be selected
                                    name="priority"
                                    value={priorityLevel}
                                    checked={priority === priorityLevel}
                                    onChange={() => setPriority(priorityLevel)}
                                    className={`priority-checkbox ${priorityLevel.toLowerCase()}`}
                                />
                                <label className={`priority-label ${priorityLevel.toLowerCase()}`}>
                                    {priorityLevel}
                                </label>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="form-group">
                    <label htmlFor="tags" className="task-label">Tags</label>
                    <div className="tags-container">
                        {availableTags.map(tag => (
                            <div key={tag} className="tag-checkbox-wrapper">
                                <input
                                    type="checkbox"
                                    value={tag}
                                    checked={tags.includes(tag)}
                                    onChange={handleTagChange}
                                    className={`tag-checkbox ${tag.toLowerCase()}`}
                                />
                                <label className={`tag-label ${tag.toLowerCase()}`}>
                                    {tag}
                                </label>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="form-group">
                    <label htmlFor="description" className="task-label">Description</label>
                    <textarea
                        id="description"
                        placeholder="Enter task description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="task-textarea"
                    />
                </div>
                <div className="overlay-actions">
                    <CancelButton onClick={onClose} className="cancel-button" />
                    <CreateInOverlayButton onClick={handleSave} className="create-button" />

                </div>
            </div>
        </div>
    );
}

export default AddTaskOverlay;
