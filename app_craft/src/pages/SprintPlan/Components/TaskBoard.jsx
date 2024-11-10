import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable } from 'react-beautiful-dnd';
import DragTask from './DragTask';
import EditTaskOverlay from '../../../components/EditTaskOverLay';
import '../css/TaskBoard.css';
import { addTaskToSprintBacklog } from '../SprintBacklogAdd';
import { removeTaskFromSprintBacklog } from '../SprintBacklogRemove';
import { doc, updateDoc,getDoc  } from 'firebase/firestore'; 
import { db } from '../../../firebase/firebaseConfig';  


const TaskBoard = ({ backlog, sprintTasks, setBacklog, setSprint, sprintID, currentUser }) => {
    const [selectedTask, setSelectedTask] = useState(null);
    const [isOverlayVisible, setOverlayVisible] = useState(false);
    const [updateFlag2, setUpdateFlag2] = useState(false);


    const onDragEnd = (result) => {
        const { source, destination } = result;

        // If there's no destination, do nothing
        if (!destination) return;

        // If the source and destination are the same, do nothing
        if (source.droppableId === destination.droppableId && source.index === destination.index) return;

        console.log('source id', source.droppableId,  'destination id', destination.droppableId);

        let updatedBacklog = Array.from(backlog);
        let updatedSprintTasks = Array.from(sprintTasks);

        console.log('sprint we are in rn id', sprintID);

        // Moving from backlog to sprint tasks
        if (source.droppableId === 'backlog' && destination.droppableId === 'sprintTasks') {
            const [movedTask] = updatedBacklog.splice(source.index, 1);
            updatedSprintTasks.splice(destination.index, 0, movedTask);

            console.log(movedTask.id);

            // Add the task to the sprint backlog
            addTaskToSprintBacklog(movedTask.id, sprintID); // Replace 'sprintID' with the actual sprint ID

        }

        // Moving from sprint tasks to backlog
        if (source.droppableId === 'sprintTasks' && destination.droppableId === 'backlog') {
            const [movedTask] = updatedSprintTasks.splice(source.index, 1);
            updatedBacklog.splice(destination.index, 0, movedTask);
            
            removeTaskFromSprintBacklog(movedTask.id,sprintID);
        }

        setBacklog(updatedBacklog);
        setSprint(prevSprint => ({ ...prevSprint, tasks: updatedSprintTasks }));
    };

    const handleTaskClick = (task) => {
        setSelectedTask(task);
        setOverlayVisible(true);
    };

    const closeOverlay = () => {
        setOverlayVisible(false);
        setSelectedTask(null);
    };

    const handleUpdate = () => {
        setUpdateFlag2(!updateFlag2);
        closeOverlay();
    };

    const handleUpdate2 = async (updatedTask) => {

        //---------------- Update the task in Firestore -----------------
        const sprintDocRef = doc(db, 'sprints', sprintID);  // Reference to the sprint document in Firestore

        try {
            // Use getDoc to retrieve the current sprint document (Fixing the issue)
            const sprintDoc = await getDoc(sprintDocRef); // <-- Fix: use getDoc() here instead of sprintDocRef.get()
            
            if (sprintDoc.exists()) {
                const sprintData = sprintDoc.data();  // Get the current sprint data

                // Replace the updated task in the tasks array
                const updatedTasks = sprintData.tasks.map((task) =>
                    task.id === updatedTask.id ? updatedTask : task
                );

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

        //----------------------------- Update the task in the local state -----------------------------
        setSprint((prevSprint) => {
            const updatedSprint = { ...prevSprint };
            updatedSprint.tasks = updatedSprint.tasks.map((task) =>
                task.id === updatedTask.id ? updatedTask : task
            );
            return updatedSprint;
        });

        // Update the task in the backlog (if applicable)
        setBacklog((prevBacklog) =>
            prevBacklog.map((task) =>
                task.id === updatedTask.id ? updatedTask : task
            )
        );
        // Close the overlay
    };

    useEffect(() => {
        if (isOverlayVisible && selectedTask) {
            console.log('selected task', selectedTask);
        }
    }, [isOverlayVisible, selectedTask]);

    return (
        <>
            <DragDropContext onDragEnd={onDragEnd}>
                <div className="task-board">
                    <Droppable droppableId="sprintTasks">
                        {(provided) => (
                            <div className="sprint-tasks" ref={provided.innerRef} {...provided.droppableProps}>
                                <h2 className='board-title'>Sprint Tasks</h2>
                                {sprintTasks.map((task, index) => (
                                  task && <DragTask key={task.id} task={task} index={index} onClick={handleTaskClick} />
                                ))}
                                {provided.placeholder}
                            </div>
                        )}
                    </Droppable>
                    <Droppable droppableId="backlog">
                        {(provided) => (
                            <div className="backlog" ref={provided.innerRef} {...provided.droppableProps}>
                                <h2 className='board-title'>Backlog</h2>
                                {backlog.map((task, index) => (
                                   task && <DragTask key={task.id} task={task} index={index} onClick={handleTaskClick} />
                                ))}
                                {provided.placeholder}
                            </div>
                        )}
                    </Droppable>
                </div>
            </DragDropContext>
 
        </>
    );
};

export default TaskBoard;