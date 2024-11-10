import React from "react";
import { getFirestore, doc, deleteDoc } from "firebase/firestore"; // Only import necessary Firestore functions

// Initialize Firestore
const db = getFirestore(); 

async function deleteTask(taskId) {
  try {
    // Delete the task document from the 'tasks' collection
    await deleteDoc(doc(db, 'tasks', taskId));
    console.log(`Task with ID ${taskId} has been deleted.`);
  } catch (error) {
    console.error("Error deleting task: ", error);
  }
}

export default deleteTask;