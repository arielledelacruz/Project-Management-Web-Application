import React, { useEffect, useState } from 'react';
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from 'firebase/firestore';

import { auth, db } from "../../firebase/firebaseConfig"; // Adjust the path as necessary
import CreateSprintOverlay from './components/createSprint.jsx';
import EditSprintOverlay from './components/editSprint.jsx';
import NavigationBar from "../../components/NavigationBar";
import './SprintBoard.css'; 
import createSprint from './components/sprintDatabaseLogic.jsx'; //import the createSprint function
import { editSprintDetails } from './components/sprintDatabaseLogic.jsx';
import SprintTable from './components/sprintTable'; // Import the SprintTable component
import { fetchSprints } from './components/sprintDatabaseLogic.jsx';
import { deleteSprint } from './components/sprintDatabaseLogic.jsx';
import localDB from '../../LocalDatabase.jsx';
import { EditFilesInDB } from '../../components/EditFilesInDB.jsx';

const SprintBoard = () => { 
    //all sprints in this page are stored here
    const [sprints, setSprints] = useState([]);
    const [showOverlay, setShowOverlay] = useState(false);
    const [tasksInSprint, setTasksInSprint] = useState([]);
    const [showEditOverlay, setShowEditOverlay] = useState(false);
    const [selectedSprint, setSelectedSprint] = useState(null); // Track sprint being edited
    const [currentUser, setCurrentUser] = useState({ isAdmin: false }); // Track the current user

    useEffect(() => {
        const fetchAndSetSprints = async () => {
            const fetchedSprints = await fetchSprints();
            setSprints(fetchedSprints);
        };
        fetchAndSetSprints();
    
        // Firebase authentication listener to get the current user
        const auth = getAuth();
        onAuthStateChanged(auth, async (user) => {
            if (user) {
                console.log("Fetching user data for:", user); // Log the current user
                const userDoc = await getDoc(doc(db, "users", user.uid)); // Query from "users" collection
                if (userDoc.exists()) {
                    const userData = userDoc.data();
                    setCurrentUser(userData); // Set the user data (including isAdmin flag)
                } else {
                    console.log("No user data found");
                }
            }
        });
    }, []);

    const handleViewTasksInSprint = (sprintID) => {
        console.log("View tasks in sprint with ID:", sprintID);
        setSelectedSprint(sprintID); // Set the selected sprint

        // Fetch tasks in the selected sprint
        const taskInSprint = sprints.tasks.array.forEach(element => { // Get the tasks array from the selected sprint
            console.log(element);
            setTasksInSprint([...tasksInSprint, element]);
        });
    };

    // Frontend-only deletion logic
    const handleDeleteSprint = async (sprintID) => {
        // Filter out the sprint with the given ID
        const updatedSprints = sprints.filter(sprint => sprint.id !== sprintID);
        setSprints(updatedSprints);
        console.log(`Sprint with ID ${sprintID} deleted (frontend only).`);

        // Fetch all tasks
        await localDB.updateData();
        const tasks = localDB.getData();

        console.log('this is the tasks', tasks);

        // Filter tasks that belong to the sprint
        tasks.forEach(task => { console.log(task.sprintId) });
        const sprintTasks = tasks.filter(task => task.sprintId === sprintID);

        console.log('this is the sprint tasks', sprintTasks);

        // Update the status of each task to null
        const updatedTasks = sprintTasks.map(task => ({
            ...task,
            status: null,
            sprintId: null // Optionally, clear the sprintId if needed
        }));

        // Save the updated tasks back to the database
        updatedTasks.forEach(task => {
            localDB.editData(task.id, task);
            const editFiles = new EditFilesInDB(task.id);
            editFiles.changeStatus(null)
            editFiles.changeSprintId(null);
        });

        console.log(`Tasks in sprint ${sprintID} moved back to the backlog.`);
        console.log('this is the updated', updatedTasks);

        // Backend deletion logic
        deleteSprint(sprintID); // Delete the sprint from the database
    };

    const handleCreateSprint = async (newSprint) => {
        try {
            const sprintID = await createSprint(newSprint); // Get the Firestore document ID
            setSprints([...sprints, { ...newSprint, id: sprintID }]); // Save the sprint with the Firestore document ID
            console.log(sprints, newSprint);
        } catch (error) {
            console.error("Error creating sprint:", error);
        }
    };

    // Takes in a sprintID (already inside the sprint) and updatedSprint (should be from the edit overlay)
    const handleEditSprint = async (sprintID, updatedSprint) => {
        const updatedSprints = sprints.map(sprint => 
            sprint.id === sprintID ? { ...sprint, ...updatedSprint } : sprint
        );
        //update the local sprints array/list
        setSprints(updatedSprints);
        setShowEditOverlay(false); // Close overlay after saving changes

        //find the sprint on the db using the sprintID
        const databaseSprint = editSprintDetails(sprintID);

        //update the sprint on the cloud database
        try {
            if (updatedSprint.name) await databaseSprint.changeName(updatedSprint.name);
            if (updatedSprint.startDate) await databaseSprint.changeStartDate(updatedSprint.startDate);
            if (updatedSprint.endDate) await databaseSprint.changeEndDate(updatedSprint.endDate);
            if (updatedSprint.status) await databaseSprint.changeStatus(updatedSprint.status);
            if (updatedSprint.reference) await databaseSprint.changeReference(updatedSprint.reference);
            if (updatedSprint.productOwner) await databaseSprint.changeOwner(updatedSprint.productOwner);
            if (updatedSprint.scrumMaster) await databaseSprint.changeMaster(updatedSprint.scrumMaster);
            if (updatedSprint.members) await databaseSprint.changeMembers(updatedSprint.members)
        } catch (error) {
            console.error("Error updating sprint:", error);
        }
    };

    return (
        <div className="sprintBoard-container">
            <NavigationBar currentUser={currentUser}/>
            <div className="content">
                <h1 className="title">Sprint Board</h1>
                {currentUser.isAdmin && (
                    <button className='create-sprint-button'
                        onClick={() => setShowOverlay(true)}>Create Sprint</button>
                )}
                
                {/* Create Sprint Overlay */}
                {showOverlay && (
                    <CreateSprintOverlay 
                        onCreate={handleCreateSprint} 
                        onClose={() => setShowOverlay(false)} 
                    />
                )}

                {/* Edit Sprint Overlay */}
                {showEditOverlay && selectedSprint && (
                    <EditSprintOverlay 
                        sprintDetails={selectedSprint}
                        onEdit={(updatedSprint) => handleEditSprint(selectedSprint.id, updatedSprint)} 
                        onClose={() => setShowEditOverlay(false)} 
                    />
                )}

                {/* Use the SprintTable component */}
                <SprintTable 
                    sprints={sprints} 
                    onEditSprint={(sprint) => {
                        setSelectedSprint(sprint);
                        setShowEditOverlay(true);
                    }}
                    onDeleteSprint={handleDeleteSprint}
                    isAdmin={currentUser.isAdmin} // Pass the isAdmin prop to SprintTable
                />
            </div>
        </div>
    );
};

export default SprintBoard;