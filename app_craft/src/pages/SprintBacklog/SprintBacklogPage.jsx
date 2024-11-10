import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { useLocation } from 'react-router-dom';
import './SprintBacklogPage.css';
import NavigationBar from "../../components/NavigationBar";
import { Link } from "react-router-dom";
import localDB from '../../LocalDatabase';
import { EditFilesInDB } from '../../components/EditFilesInDB';
import { getFirestore, doc, collection, query, where, getDoc, onSnapshot, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase/firebaseConfig';
import EditTaskOverlay from '../../components/EditTaskOverLay';
import { editSprintDetails } from '../Board/components/sprintDatabaseLogic';
import { getAuth, onAuthStateChanged } from 'firebase/auth'; // Import Firebase Auth


const KanbanTemplate = {
    tasks: {},
    columns: {
        'not-started': {
            id: 'not-started',
            title: 'Not Started',
            taskIds: [],
        },
        'in-progress': {
            id: 'in-progress',
            title: 'In Progress',
            taskIds: [],
        },
        'completed': {
            id: 'completed',
            title: 'Completed',
            taskIds: [],
        },
    },
    columnOrder: ['not-started', 'in-progress', 'completed'],
};

function SprintBacklogPage() {
    const location = useLocation();
    console.log("SprintBacklogPage location:", location);
    const sprintId = location.state?.sprintId; // Retrieve sprintId from location state
    const sprintName = location.state?.sprintName || "Current Sprint";
    const sprintStatus = location.state?.sprintStatus || "Not Started";
    const sprintTasks = location.state?.sprintTask || [];

    const [state, setState] = useState(KanbanTemplate);
    const [view, setView] = useState('kanban'); // Add state to track view mode (kanban or list)
    const [currentUser, setCurrentUser] = useState(null);
    const [userData, setUserData] = useState(null);
    console.log("SprintBacklogPage state:", state);

    useEffect(() => {
        const auth = getAuth();
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                setCurrentUser(user);
                console.log('Current user:', user);

                // Fetch user-specific data from Firestore
                const userDocRef = doc(db, 'users', user.uid);
                const userDocSnap = await getDoc(userDocRef);

                if (userDocSnap.exists()) {
                    const fetchedUserData = userDocSnap.data();
                    console.log('Fetched User data:', fetchedUserData);
                    setUserData(fetchedUserData);
                } else {
                    console.log('No such document!');
                }
            } else {
                setCurrentUser(null);
                setUserData(null);
                console.log('No user is signed in');
            }
        });

        return () => unsubscribe();
    }, []);

    const handleEndSprint = async () => {
        // Use the latest task statuses from state instead of sprintTasks
        const sprintTasks = Object.values(state.tasks);
    
        // Filter tasks that are "Not Started" or "In Progress"
        const tasksToMoveBack = sprintTasks.filter(task => 
            task.status === 'not started' || task.status === 'in progress'
        );
    
        try {
            // Move each task back to the product backlog
            for (const task of tasksToMoveBack) {
                await moveTaskToBacklog(task.id);
            }
    
            // Update sprint status to "Completed"
            await updateSprintInFirestore(sprintId, 'Completed');
            
            alert(`Sprint ${sprintName} ended successfully. All tasks moved back to backlog.`);
            console.log('Sprint ended successfully');
        } catch (error) {
            console.error('Error ending sprint:', error);
            alert('There was an error ending the sprint. Please try again.');
        }
    };
    
    //function to move a task back to the product backlog
    const moveTaskToBacklog = async (taskId) => {
        try {
            const taskRef = doc(db, 'tasks', taskId);
            await updateDoc(taskRef, {
                sprintId: null, 
                status: null
            });
            console.log(`Task ${taskId} moved to product backlog.`);
        } catch (error) {
            console.error('Error moving task to backlog:', error);
        }
    };

    const updateSprintInFirestore = async (sprintId, updatedStatus) => {
        try {
          const sprintDocRef = doc(db, 'sprints', sprintId);
          await updateDoc(sprintDocRef, {
            status: updatedStatus,
          });
          console.log(`Sprint ${sprintId} updated to ${updatedStatus} in Firestore`);
        } catch (error) {
          console.error('Error updating sprint in Firestore:', error);
        }
      };


    useEffect(() => {
        if (sprintId) {
            const sprintRef = doc(db, 'sprints', sprintId);
            const unsubscribe = onSnapshot(sprintRef, (sprintSnapshot) => {
                if (sprintSnapshot.exists()) {
                    const sprintData = sprintSnapshot.data();
                    const newData = { ...KanbanTemplate };

                    // First, clear any existing taskIds in each column to avoid duplication
                    newData.columns['not-started'].taskIds = [];
                    newData.columns['in-progress'].taskIds = [];
                    newData.columns['completed'].taskIds = [];

                    // Add each task to the appropriate column based on its status
                    sprintData.tasks.forEach((task) => {
                        console.log(task.status.replace(' ', '-')); // Check if this matches your column IDs

                        newData.tasks[task.id] = task;
                        newData.columns[task.status.replace(' ', '-')].taskIds.push(task.id);
                    });


                    // Update the state with the new task data, avoiding duplication
                    setState(newData);
                }
            });

            // Cleanup subscription on unmount
            return () => unsubscribe();
        }
    }, [sprintId]);

    const onDragEnd = (result) => {
        const { destination, source, draggableId } = result;

        if (sprintStatus === 'Completed') return; // Prevent dragging tasks if sprint is Completed

        if (!destination) return;

        if (destination.droppableId === source.droppableId && destination.index === source.index) return;

        const start = state.columns[source.droppableId];
        const finish = state.columns[destination.droppableId];

        if (!start || !finish) return; // Ensure start and finish columns are defined

        if (start === finish) {
            const newTaskIds = Array.from(start.taskIds);
            newTaskIds.splice(source.index, 1);
            newTaskIds.splice(destination.index, 0, draggableId);

            const newColumn = { ...start, taskIds: newTaskIds };

            const newState = { ...state, columns: { ...state.columns, [newColumn.id]: newColumn } };
            setState(newState);
            return;
        }

        const startTaskIds = Array.from(start.taskIds);
        startTaskIds.splice(source.index, 1);
        const newStart = { ...start, taskIds: startTaskIds };

        const finishTaskIds = Array.from(finish.taskIds);
        finishTaskIds.splice(destination.index, 0, draggableId);
        const newFinish = { ...finish, taskIds: finishTaskIds };

        const newState = { ...state, columns: { ...state.columns, [newStart.id]: newStart, [newFinish.id]: newFinish } };
        setState(newState);

        // Update the status of the task in the localDB and in the cloud
        const task = state.tasks[draggableId];
        const updatedTask = { ...task, status: finish.id.replace('-', ' ') }; // Ensure status is correctly formatted
        const editDataInCloud = EditFilesInDB(task.id); // Create an instance of the EditFilesInDB class

        localDB.editData(task.id, updatedTask);
        console.log("this is the sprint id", sprintId);
        editDataInCloud.changeStatusSprintTask(task.id, updatedTask.status, sprintId); // Update in cloud database

        if (finish.id === 'completed') {
            const currentDate = new Date();
            const completedDate = currentDate.toISOString();
            const updatedTask = { ...task, completedDate }; // Add a 'completedDate' field to the task
            localDB.editData(task.id, updatedTask);
            editDataInCloud.changeCompletedDate(task.id, completedDate, sprintId); // Update in cloud database
        }
    };

    const handleUpdate2 = async (updatedTask) => {
        //---------------- Update the task in Firestore -----------------
        const sprintDocRef = doc(db, 'sprints', sprintId);  // Reference to the sprint document in Firestore

        try {
            // Use getDoc to retrieve the current sprint document (Fixing the issue)
            const sprintDoc = await getDoc(sprintDocRef); // <-- Fix: use getDoc() here instead of sprintDocRef.get()

            if (sprintDoc.exists()) {
                const sprintData = sprintDoc.data();  // Get the current sprint data

                console.log('Sprint data:', sprintData);

                // Replace the updated task in the tasks array
                const updatedTasks = sprintData.tasks.map((task) => {
                    const updatedTaskData = localDB.getDataByID(updatedTask.id);
                    return task.id === updatedTask.id ? updatedTaskData : task;
                });

                // Check for undefined values in updatedTasks
                if (updatedTasks.includes(undefined)) {
                    throw new Error('Updated task data is undefined');
                }

                // Debugging output to ensure the task is correct
                console.log('Updated tasks array:', updatedTasks);

                // Update Firestore with the new tasks array
                await updateDoc(sprintDocRef, {
                    tasks: updatedTasks
                });

                console.log('Task updated successfully in Firestore');
            } else {
                console.error('Sprint document does not exist in Firestore');
            }
        } catch (error) {
            console.error('Error updating task in Firestore:', error);
        }

        //---------------- Update the task in the local state ------------------------
        const newState = { ...state, tasks: { ...state.tasks, [updatedTask.id]: updatedTask } };
        setState(newState);
        // Close the overlay
    };

    return (
        <div className="sprintBacklogPage-container">
            <NavigationBar />
            <div className="content">
                <Link to="/sprintboard" className="back-button">Back to Sprint Board</Link>

                {/* Toggle Button for Kanban/List View */}
                <div className='top-section'>
                    <h2 className="sprint-name">{sprintName}</h2>
                    <div className="toggle-buttons">
                        <button
                            className={view === 'kanban' ? 'active' : ''}
                            onClick={() => setView('kanban')}
                        >
                            Kanban
                        </button>
                        <button
                            className={view === 'list' ? 'active' : ''}
                            onClick={() => setView('list')}
                        >
                            List
                        </button>
                    </div>
                </div>

                {/* Conditionally render Kanban or List view */}
                        {view === 'kanban' ? (
            <>
                <DragDropContext onDragEnd={onDragEnd}>
                    <div className="kanban-board">
                        {state.columnOrder.map((columnId) => {
                            const column = state.columns[columnId];
                            const tasks = column.taskIds.map((taskId) => state.tasks[taskId]);

                            return <Column key={column.id} column={column} tasks={tasks} updateTask={handleUpdate2} currentUser={userData}/>;
                        })}
                    </div>
                </DragDropContext>            </>
        ) : (
            <ListView tasks={Object.values(state.tasks)} columns={state.columns} sprintId={sprintId} updateTask={handleUpdate2} currentUser={userData}/>
        )}

        <button className="end-sprint-button" onClick={handleEndSprint}>
            End Sprint
        </button>
    </div>
</div>
    );
}

function Column({ column, tasks, updateTask, currentUser }) {
    const [showOverlay, setShowOverlay] = useState(false);
    const [selectedTask, setSelectedTask] = useState(null);
    const [updateFlag, setUpdateFlag] = useState(false);

    const handleClick = (task) => {
        console.log("Task clicked:", task);
        setSelectedTask(task);
        setShowOverlay(true);
    };

    const handleClose = () => {
        setSelectedTask(null);
        setShowOverlay(false);
    };

    const handleUpdate = async () => {
        setUpdateFlag(!updateFlag);
        handleClose();
    };

    useEffect(() => {
        if (showOverlay && selectedTask) {
            console.log('selected task', selectedTask);
        }
    }, [showOverlay, selectedTask, updateFlag]);

    return (
        <div className={`column ${column.id}`}>
            <h2>{column.title}</h2>
            <Droppable droppableId={column.id}>
                {(provided) => (
                    <div className="task-list" {...provided.droppableProps} ref={provided.innerRef}>
                        {tasks.map((task, index) => (
                            <Draggable key={task.id} draggableId={task.id} index={index}>
                                {(provided) => (
                                    <div
                                        className={`task ${column.id}`}
                                        ref={provided.innerRef}
                                        {...provided.draggableProps}
                                        {...provided.dragHandleProps}
                                        onClick={() => handleClick(task)}
                                    >
                                        <div className="task-name">{task.name}</div>  {/* Task name bubble */}
                                        <div className="task-field story-points">{task.storyPoints}</div>
                                        <div className={`task-field priority-${task.priority.toLowerCase()}`}>{task.priority}</div>
                                        <div className="task-tags-container">
                                        {task.tags.map((tag, index) => (
                                            <span key={index} className={`task-tags ${tag.trim().toLowerCase()}`}>{tag.trim()}</span>
                                        ))}
                                    </div>
                                    </div>
                                )}
                            </Draggable>
                        ))}
                        {provided.placeholder}
                    </div>
                )}
            </Droppable>
            {showOverlay && selectedTask && (
            <EditTaskOverlay
                task={selectedTask}
                onClose={() => handleClose()}
                onSave={(updatedTask) => updateTask(updatedTask)}
                onUpdate={handleUpdate}
                showAssignee={true} // Show assignee in sprint backlog
                currentUser={currentUser} // Pass the current
            />
        )}
        </div>
    );
}

function ListView({ tasks, columns, sprintId, updateTask, currentUser}) {
    const [showOverlay, setShowOverlay] = useState(false);
    const [selectedTask, setSelectedTask] = useState(null);
    const [updateFlag, setUpdateFlag] = useState(false);

    const handleClick = (task) => {
        console.log("Task clicked:", task);
        setSelectedTask(task);
        setShowOverlay(true);
    };

    const handleClose = () => {
        setSelectedTask(null);
        setShowOverlay(false);
    };

    const handleUpdate = () => {
        setUpdateFlag(!updateFlag);
        updateTask(selectedTask);
        handleClose();
    };  

    useEffect(() => {
        if (showOverlay && selectedTask) {
            console.log('selected task', selectedTask);
        }
    }, [showOverlay, selectedTask]);

    const filteredTasks = tasks.filter(task => task.sprintId === sprintId);

    return (
        <table className="list-view-table">
            <thead>
                <tr>
                    <th>Task</th>
                    <th>Status</th>
                    <th>Tags</th>
                    <th>Priority</th>
                    <th>Story points</th>
                </tr>
            </thead>
            <tbody>
                {filteredTasks.map((task) => {
                    // Find the status of the task by checking which column it's in
                    let status = '';
                    for (const columnId in columns) {
                        if (columns[columnId].taskIds.includes(task.id)) {
                            status = columns[columnId].title; // Get the column title (status)
                            break;
                        }
                    }

                    const handleRowClick = () => {
                        console.log("Task clicked:", task);
                        setSelectedTask(task);
                        setShowOverlay(true);
                    }

                    return (
                        <tr key={task.id} onClick={handleRowClick}>
                            <td>{task.name}</td>
                            <td><span className={`task-status ${status.toLowerCase().replace(" ", "-")}`}>{status}</span></td>
                            <td>{task.tags.map(tag => (
                                <span key={tag} className={`task-tags ${tag.toLowerCase()}`}>{tag}</span>
                            ))}</td>
                            <td><span className={`task-priority ${task.priority.toLowerCase()}`}>{task.priority}</span></td>
                            <td>{task.storyPoints}</td>
                        </tr>
                    );
                })}
            </tbody>
            {showOverlay && selectedTask && (
                <EditTaskOverlay
                task={selectedTask}
                onClose={() => handleClose()}
                onSave={(updatedTask) => updateTask(updatedTask)}
                onUpdate={handleUpdate}
                currentUser={currentUser}
                />
            )}
        </table>
    );
}

export default SprintBacklogPage;