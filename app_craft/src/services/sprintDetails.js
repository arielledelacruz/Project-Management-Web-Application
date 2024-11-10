import { doc, getDoc } from "firebase/firestore"; 
import { db } from '../firebase/firebaseConfig'; // Import Firebase config

// Function to fetch sprint details
export const fetchSprintDetails = async (sprintId) => {
  try {
    const sprintRef = doc(db, "sprints", sprintId);
    const sprintDoc = await getDoc(sprintRef);
    if (sprintDoc.exists()) {
      return sprintDoc.data();
    } else {
      throw new Error("Sprint not found");
    }
  } catch (error) {
    console.error("Error fetching sprint details: ", error);
    throw new Error(error.message);
  }
};