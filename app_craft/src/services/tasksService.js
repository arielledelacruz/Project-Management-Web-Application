// src/services/tasksService.js
import { addDoc, collection, getFirestore } from "firebase/firestore"; 
import { db } from '../firebase/firebaseConfig'; //import Firebase config

//function to create a new task
export const createTask = async (taskData) => {
  try {
    const docRef = await addDoc(collection(db, "tasks"), taskData);
    console.log("Task created with ID: ", docRef.id);
    return docRef.id;
  } catch (error) {
    console.error("Error adding task: ", error);
    throw new Error(error.message);
  }
};

//other task-related functions here

// Function to update an existing task
export const updateTask = async (taskId, updatedTaskData) => {
  try {
    const taskRef = doc(db, "tasks", taskId);
    await updateDoc(taskRef, updatedTaskData);
    console.log("Task updated successfully");
  } catch (error) {
    console.error("Error updating task: ", error);
    throw new Error(error.message);
  }
};
