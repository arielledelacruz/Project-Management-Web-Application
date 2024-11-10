import { collection, query, where, getDocs,getDoc } from "firebase/firestore"; 
import { db } from "../../firebase/firebaseConfig";
import { doc, updateDoc, arrayUnion } from "firebase/firestore";


/**
 * Fetch non-started sprints
 * 
 * @returns {Array} - A list of sprints that are not yet started
 */
export async function fetchNonStartedSprints() {
    try {
        const sprintsCollection = collection(db, "sprints");
        const nonStartedQuery = query(sprintsCollection, where("status", "==", "not started")); 
        const snapshot = await getDocs(nonStartedQuery);
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
        console.error("Error fetching non-started sprints:", error);
    }
}


/**
 * Fetch tasks in the product backlog (not assigned to any sprint)
 * 
 * @returns {Array} - A list of tasks not assigned to any sprint
 */
export async function fetchProductBacklogTasks() {
    try {
        const tasksCollection = collection(db, "tasks");
        const backlogQuery = query(tasksCollection, where("sprintId", "==", null));
        const snapshot = await getDocs(backlogQuery);
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
        console.error("Error fetching product backlog tasks:", error);
    }
}


/**
 * Add a task to a sprint backlog
 * 
 * @param {string} taskId - The ID of the task to add to the sprint
 * @param {string} sprintId - The ID of the sprint to add the task to
 * @throws {Error} - Throws an error if the task update fails
 */
export async function addTaskToSprintBacklog(taskId, sprintId) {
    try {
        //reference to the task document
        const taskRef = doc(db, "tasks", taskId);
        const sprintRef = doc(db, "sprints", sprintId);


        await updateDoc(taskRef, { 
            sprintId: sprintId,
            status: "not started"  //vhange status from null to not started
        });

        const taskSnapshot = await getDoc(taskRef);
        const taskData = { id: taskSnapshot.id, ...taskSnapshot.data()};

        // Reference to the sprint document
        
        console.log(taskId)

        // Add the task ID to the sprint's tasks array
        await updateDoc(sprintRef, {
            tasks: arrayUnion(taskData) // Add the taskId to the sprint's tasks array using arrayUnion
            
        });


        console.log(`Task ${taskId} added to sprint ${sprintId} backlog successfully.`);
    } catch (error) {
        console.error("Error adding task to sprint backlog:", error);
    }
}



//NOT SURE IF WANNA VALIDATE OR NOT but i think we should?? will check for other validations
export async function addValidatedTaskToSprint(taskId, sprintId) {
    //fetch the sprint to check its status
    const sprint = (await getDoc(doc(db, "sprints", sprintId))).data();

    if (sprint.status !== "null") {
        console.error("Cannot add task to a sprint that has already been added?");
        return;
    }

    //add the task to the sprint backlog if valid
    await addTaskToSprintBacklog(taskId, sprintId);
}
