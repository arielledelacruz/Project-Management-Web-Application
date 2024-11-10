import { useState, useEffect } from 'react';
import CreateTaskButton from './components/CreateTaskButton.jsx';
import AddTaskOverlay from './components/AddTaskOverLay.jsx';
import EditTaskOverlay from './components/EditTaskOverLay.jsx';
import './cssFiles/App.css';
import NavigationBar from './components/NavigationBar.jsx';
import { doc, getDoc } from 'firebase/firestore';
import { db } from './firebase/firebaseConfig.js';
import { createTask } from "./services/tasksService"; // import task service
import CollapsibleTable from './components/TaskCardDetail.jsx';
import TaskFilter from './components/TaskFilter.jsx';
import SortButton from './components/SortButton.jsx';  // Import SortButton
import localDB from './LocalDatabase.jsx';
import { getAuth, onAuthStateChanged } from 'firebase/auth'; // Import Firebase Auth

function App() {
  // State to control overlay visibility
  const [isOverlayVisible, setOverlayVisible] = useState(false);
  const [isEditOverlayVisible, setEditOverlayVisible] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [tasks, setTasks] = useState([]); // Manage all tasks
  const [sortedTasks, setSortedTasks] = useState([]); // Manage sorted tasks
  const [updateFlag, setUpdateFlag] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [userData, setUserData] = useState(null); // State to store user-specific data

  const docRef = doc(db, 'tasks', 'Yn7xWRHWqZlKgEiWTo0n');

  // Fetch the current user when the component mounts
  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setCurrentUser(user);
        console.log('Current user:', user); // Log the current user
  
        // Fetch user-specific data from Firestore
        const userDocRef = doc(db, 'users', user.uid);
        const userDocSnap = await getDoc(userDocRef);
  
        if (userDocSnap.exists()) {
          const fetchedUserData = userDocSnap.data();
          console.log('Fetched User data:', fetchedUserData); // Log fetched data
          
          // Instead of relying on setUserData, directly call the function here
          handleUserData(fetchedUserData);  // Call your method to process or use userData
          setUserData(fetchedUserData); // Optionally set the state if needed for later
        } else {
          console.log('No such document!');
        }
      } else {
        setCurrentUser(null);
        setUserData(null); // Clear user data when no user is signed in
        console.log('No user is signed in');
      }
    });
  
    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);
  
  // Method to handle or process user data
  const handleUserData = (data) => {
    console.log('Processing user data:', data);

    return data;
    // Do something with user data immediately
    console.log('Processing user data:', data);
    // You can call other functions here or update UI, etc.
  };

  useEffect(() => {
    console.log('Updated userData:', userData); // Log the updated userData
  }, [userData]);
  
  // Function to handle the "Create" button click
  const handleCreateButtonClick = () => {
    setOverlayVisible(true);  // Show the overlay
  };

  // Function to handle closing the overlay
  const handleOverlayClose = () => {
    setOverlayVisible(false);  // Hide the overlay
    setUpdateFlag(!updateFlag);  // Update the flag to refresh the task list
  };

  const handleFilterChange = (criteria) => { 
    setFilterCriteria(criteria);
  };

  const handleTaskSave = async (task) => {
    try {
      const taskId = await createTask(task);
      console.log('Task created with ID:', taskId);
    } catch (error) {
      console.error('Error saving task:', error);
    }
    setOverlayVisible(false);
    setUpdateFlag(!updateFlag);
  };

  const handleTaskClick = (task) => {
    setSelectedTask(task);
    setEditOverlayVisible(true);
  };

  const handleEditOverlayClose = () => {
    setEditOverlayVisible(false);
    setUpdateFlag(!updateFlag);
  };

  const handleTaskEditSave = async (updatedTask) => {
    try {
      console.log('Task updated:', updatedTask);
    } catch (error) {
      console.error('Error updating task:', error);
    }
    setEditOverlayVisible(false);
    setUpdateFlag(!updateFlag);
  };

  return (
    <div className="app-container">
      <NavigationBar currentUser={userData}/>
      <div className="content">
        <h1 className="title">Product Backlog</h1>
        <div className="button-group">
          <CreateTaskButton onClick={handleCreateButtonClick} />
          {/* Add Sort Button */}
        </div>
        <CollapsibleTable updateFlag={updateFlag}
        currentUser={userData} /> 
      </div>

      {/* Conditionally render the AddTaskOverlay */}
      {isOverlayVisible && (
        <AddTaskOverlay onClose={handleOverlayClose} onSave={handleTaskSave} />
      )}

      {/* Conditionally render the EditTaskOverlay */}
      {isEditOverlayVisible && selectedTask && userData &&(
        <> 
            {console.log('Passing userData to EditTaskOverlay:', userData)}
        <EditTaskOverlay
          task={selectedTask}
          onClose={handleEditOverlayClose}
          onSave={handleTaskEditSave}
          showAssignee={false}
          currentUser ={userData}        />
        </>
      )}
    </div>
  );
}

export default App;