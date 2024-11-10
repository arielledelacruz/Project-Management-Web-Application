import { doc, updateDoc, arrayRemove, getDoc } from "firebase/firestore";
import { db } from "../../firebase/firebaseConfig";

/**
 * Remove a task from the sprint backlog and move it to the product backlog.
 * 
 * @param {string} taskId - The ID of the task to remove from the sprint.
 * @throws {Error} - Throws an error if the task update fails.
 */
export async function removeTaskFromSprintBacklog(taskId,sprintId) {
    try {
        const taskRef = doc(db, "tasks", taskId);
        const sprintRef = doc(db, "sprints", sprintId);

        const taskSnapshot = await getDoc(taskRef);
        const taskData = { id: taskSnapshot.id, ...taskSnapshot.data() }

        console.log("Removing task data:", taskData);


        await updateDoc(sprintRef, {
            tasks: arrayRemove(taskData) // Remove the task object from the sprint's tasks array
        });

        await updateDoc(taskRef, {
            sprintId: null,
            status: null,
        });

        console.log(`Task ${taskId} removed from sprint backlog and moved back to product backlog.`);
    } catch (error) {
        console.error("Error removing task from sprint backlog:", error);
    }
}

