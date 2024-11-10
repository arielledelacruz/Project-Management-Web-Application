import React from "react";
import { db } from '../firebase/firebaseConfig.js';
import { getDocs, collection, doc, setDoc, updateDoc, arrayUnion, arrayRemove, getDoc } from 'firebase/firestore';

export function EditFilesInDB(taskID) {
    const dbRef =  doc(db, 'tasks', taskID);

    const taskTypes = ['Story', 'Bug'];
    const taskStages = ['Planning', 'Development', 'Testing', 'Integration'];
    const priorities = ['Low', 'Medium', 'Important', 'Urgent'];
    const availableTags = ['Frontend', 'Backend', 'API', 'Database', 'Framework', 'Testing', 'UI', 'UX'];

    const changeName = async (newName) => {
        setDoc(dbRef, { name: newName }, { merge: true });
    }

    const changeType = async (newType) => {

        setDoc(dbRef, { type: newType }, { merge: true });

    }

    const changeStage = async (newStage) => {

  
        setDoc(dbRef, { stage: newStage }, { merge: true });
    }

    const changeStoryPoints = async (newStoryPoints) => {
        setDoc(dbRef, { storyPoints: newStoryPoints }, { merge: true });
    }

    const changePriority = async (newPriority) => {

        setDoc(dbRef, { priority: newPriority }, { merge: true });

    }

    const changeTags = async (newTags) => {

        setDoc(dbRef, { tags: newTags }, { merge: true });

    }

    const changeAssignee = async (newAssignee) => {
        setDoc(dbRef, { assignee: newAssignee }, { merge: true });
    }

    const changeDescription = async (newDescription) => {
        setDoc(dbRef, { description: newDescription }, { merge: true });
    }

    const changeHistory = async (newHistory) => {
        setDoc(dbRef, { history: newHistory}, { merge: true });
    }

    const changeStatus = async (newStatus) => {
        setDoc(dbRef, { status: newStatus }, { merge: true });
    }

    const changeLogtimeSpent = async (newLogtimeSpent) => {
        setDoc(dbRef, { logtimeSpent: newLogtimeSpent }, { merge: true });
    }

    const changeLogTimeHistory = async (newLogTimeHistory) => {
        setDoc(dbRef, { logTimeHistory: newLogTimeHistory }, { merge: true });
    }

    const changeSprintId = async (newSprintId) => {
        setDoc(dbRef, { sprintId: newSprintId }, { merge: true });
    }

    const changeCompletedDate = async (taskId, newCompletedDate, sprintId) => {
        const taskRef = doc(db, 'tasks', taskId); // Reference to the specific task document
        const sprintRef = doc(db, 'sprints', sprintId); // Reference to the specific sprint document

        // Update the task document
        await setDoc(taskRef, { completedDate: newCompletedDate }, { merge: true });

        // Get the task data
        const taskSnapshot = await getDoc(taskRef);
        const taskData = taskSnapshot.data();

        // Get the sprint data
        const sprintSnapshot = await getDoc(sprintRef);
        const sprintData = sprintSnapshot.data();

        // Remove the old task data by matching the task ID
        const updatedTasks = sprintData.tasks.filter(task => task.id !== taskId);

        // Add the updated task data
        updatedTasks.push({ ...taskData, id: taskId, completedDate: newCompletedDate });

        // Update the sprint document with the modified tasks array
        await updateDoc(sprintRef, {
            tasks: updatedTasks
        });
    };


    const changeStatusSprintTask = async (taskId, newStatus, sprintId) => {
        const taskRef = doc(db, 'tasks', taskId); // Reference to the specific task document
        const sprintRef = doc(db, 'sprints', sprintId); // Reference to the specific sprint document

        console.log("editing is running")
        console.log("this is the sprint id", sprintId)
        console.log("this is the task id", taskId)

        // Update the task document
            await setDoc(taskRef, { status: newStatus }, { merge: true });

            // Get the task data
            const taskSnapshot = await getDoc(taskRef);
            const taskData = taskSnapshot.data();

            // Get the sprint data
            const sprintSnapshot = await getDoc(sprintRef);
            const sprintData = sprintSnapshot.data();

            // Remove the old task data by matching the task ID
            const updatedTasks = sprintData.tasks.filter(task => task.id !== taskId);
            console.log("Updated tasks after removal:", updatedTasks);


            // Add the updated task data
            updatedTasks.push({ ...taskData, id: taskId, status: newStatus });
            console.log("Updated tasks after addition:", updatedTasks);


            // Update the sprint document with the modified tasks array
            await updateDoc(sprintRef, {
                tasks: updatedTasks
            });
            
    };

    return {
        changeName,
        changeType,
        changeStage,
        changeStoryPoints,
        changePriority,
        changeTags,
        changeAssignee,
        changeDescription,
        changeHistory,
        changeStatus,
        changeLogtimeSpent,
        changeLogTimeHistory,
        changeStatusSprintTask,
        changeCompletedDate,
        changeSprintId

    };
}