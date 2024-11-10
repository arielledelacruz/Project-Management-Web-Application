import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { getFirestore, doc, updateDoc, collection, onSnapshot, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../../firebase/firebaseConfig'; // Firestore config
import BurndownChart from '../../SprintBacklog/BurnDownChart'; // Import the BurndownChart component
import '../css/sprintTable.css';
import '@fortawesome/fontawesome-free/css/all.min.css'; // Import Font Awesome CSS
import localDB from '../../../LocalDatabase';
import '../css/viewMembers.css';
import ViewMembers from './removeSprintMember';
import { removeMemberFromActiveSprint } from './sprintDatabaseLogic';

const SprintTable = ({ onEditSprint, onDeleteSprint, onStartSprint, isAdmin }) => {
  const [sprints, setSprints] = useState([]);
  const [showBurndownChart, setShowBurndownChart] = useState(false);
  const [showMembersOverlay, setShowMembersOverlay] = useState(false);
  const [selectedSprint, setSelectedSprint] = useState(null);
  const [selectedSprintMembers, setSelectedSprintMembers] = useState([]);
  const overlayRef = useRef(null);
  const navigate = useNavigate();

  const handleStartSprint = async (sprintToStart) => {
    const activeSprintExists = sprints.some((sprint) => sprint.status === 'Active');

    if (activeSprintExists) {
      alert('An active sprint is already in progress. Please finish the ongoing sprint before starting a new one.');
      return; // Prevent starting a new sprint
    }

    // Fetch tasks associated with the sprint
    await localDB.updateData();
    const tasks = localDB.getData();
    const sprintTasks = tasks.filter(task => task.sprintId === sprintToStart.id);

    if (sprintTasks.length === 0) {
      alert('Cannot start an empty sprint. Please add tasks to the sprint before starting it.');
      return; // Prevent starting an empty sprint
    }

    // If no active sprint exists and the sprint has tasks, start the selected sprint
    const currentDate = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
    await startSprintInFirestore(sprintToStart.id, currentDate);
    console.log(`Sprint ${sprintToStart.name} started`);
  };

  // Function to update Firestore with new sprint status
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

  // Function to check if the sprint should be activated
  const checkAndUpdateSprintStatus = (sprints) => {
    const currentDate = new Date().toLocaleDateString('en-CA'); // YYYY-MM-DD format in local time
    console.log('Current date:', currentDate);
    // First, check if any active sprints need to be completed
    sprints.forEach((sprint) => {
      if (sprint.status === 'Active' && sprint.endDate <= currentDate) {
        // Update Firestore status to 'Completed'
        updateSprintInFirestore(sprint.id, 'Completed');
        console.log(`Sprint ${sprint.name} Completed`); 
        console.log(sprint.endDate);
      }
    });

    // Then, check if any "Not Started" sprints need to be activated
    const activeSprintExists = sprints.some(sprint => sprint.status === 'Active');
    if (activeSprintExists) {
      console.log('An active sprint already exists. No updates will be made.');
      return;
    }

    sprints.forEach((sprint) => {
      if (sprint.status === 'Not Started' && sprint.startDate <= currentDate) {
        // Update Firestore status to 'Active'
        updateSprintInFirestore(sprint.id, 'Active');
        console.log(`Sprint ${sprint.name} activated`);
      }
    });
  };

  const startSprintInFirestore = async (sprintId, startDate) => {
    try {
      const sprintDocRef = doc(db, 'sprints', sprintId);
      await updateDoc(sprintDocRef, {
        status: 'Active',
        startDate: startDate,
      });
      console.log(`Sprint ${sprintId} started on ${startDate} in Firestore`);
    } catch (error) {
      console.error('Error starting sprint in Firestore:', error);
    }
  };

  // Use useEffect to set up real-time listener for sprints collection
  useEffect(() => {
    const sprintsCollectionRef = collection(db, 'sprints');
    const unsubscribe = onSnapshot(sprintsCollectionRef, (snapshot) => {
      const sprintsData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setSprints(sprintsData);
      checkAndUpdateSprintStatus(sprintsData);
    });

    return () => unsubscribe(); // Clean up the listener on component unmount
  }, []);

  const handleViewSprint = (sprint) => {
    if (sprint.status === 'Not Started') {
      navigate('/sprintplan/', { state: { sprint } });
    } else if (sprint.status === 'Active' || sprint.status === 'Completed') {
      navigate('/sprintbacklog/', { state: { sprintId: sprint.id, sprintName: sprint.name, sprintTask: sprint.tasks , sprintStatus: sprint.status} });
    }
  };

  const handleShowBurndownChart = (sprint) => {
    setSelectedSprint(sprint);
    setShowBurndownChart(true);
  };

  const handleCloseBurndownChart = () => {
    setShowBurndownChart(false);
    setSelectedSprint(null);
  };

  const handleClickOutside = (event) => {
    if (overlayRef.current && !overlayRef.current.contains(event.target)) {
      handleCloseBurndownChart();
    }
  };

  useEffect(() => {
    if (showBurndownChart) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showBurndownChart]);

  const handleViewMembers = async (sprint) => {
    try {
      // Fetch members from the database based on their names
      //const membersQuery = query(collection(db, 'users'));
      const membersQuery = query(collection(db, 'users'), where('username', 'in', sprint.members));
      const membersSnapshot = await getDocs(membersQuery);
      const membersWithIds = membersSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));

      console.log('Members in sprint:', membersWithIds);

      // Show the overlay and set the selected sprint members
      setSelectedSprint(sprint);
      setSelectedSprintMembers(membersWithIds);
      setShowMembersOverlay(true);
    } catch (error) {
      console.error('Error fetching members:', error);
    }
  };

  const handleCloseMembersOverlay = () => {
    setShowMembersOverlay(false);
    setSelectedSprint(null);
  };

  const handleRemoveMember = (member) => {
    const memberId = member.id || member;

    console.log(member.id, 'THIS IS THE MEMBER ID BOSS')

    console.log(selectedSprint.scrumMaster, 'THIS IS THE SCRUM MASTER')
    console.log(selectedSprint.productOwner, 'THIS IS THE PRODUCT OWNER')
    
    if (member.username === selectedSprint.scrumMaster || member.username === selectedSprint.productOwner) {
      alert('Cannot remove the Scrum Master or Product Owner from the sprint.');
      return;
    }

    if (window.confirm("Are you sure you want to remove this member?")) {
      const updatedMembers = selectedSprintMembers.filter(mem => mem.id !== memberId && mem !== memberId);
      setSelectedSprintMembers(updatedMembers);
      console.log("THIS IS THE ONE WE TRYING TO DELETE", selectedSprint.id, memberId)
      removeMemberFromActiveSprint(selectedSprint.id, member.username);
    }
  };

  // Calculate the progress of each sprint
  const calculateSprintProgress = (sprint) => {
    if (!sprint.tasks || sprint.tasks.length === 0) return 0;
    const completedTasks = sprint.tasks.filter(task => task.status === 'completed').length;
    return (completedTasks / sprint.tasks.length) * 100;
  };

  return (
    <div className="table-container"> {/* Added this div */}
      <table className="sprint-table">
        <thead>
          <tr>
            <th>Sprint Name</th>
            <th>Status</th>
            <th>Progress</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {sprints.map((sprint) => {
            const status = sprint.status ? sprint.status.toLowerCase().replace(/\s+/g, '-') : 'not-started'; // Ensure default status
            const progress = calculateSprintProgress(sprint);

            return (
              <tr key={sprint.id}>
                <td>{sprint.name}</td>
                <td>
                  <span className={`status-text status-${status}`}>
                    {sprint.status || 'Not Started'}
                  </span>
                </td>
                <td>
                  <div className="progress-bar">
                    <div
                      className="progress-bar-fill"
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                  <span>{progress.toFixed(2)}%</span>
                </td>
                <td className="actions-column">
                  <button className="view-sprint-btn" onClick={() => handleViewSprint(sprint)}>
                    View Sprint
                  </button>

                  {isAdmin && sprint.status === 'Not Started' && (
                    <button className="start-sprint-btn" onClick={() => handleStartSprint(sprint)}>
                      Start Sprint
                    </button>
                  )}

                  {isAdmin && sprint.status === 'Active' && (
                    <button className="view-members-btn" onClick={() => handleViewMembers(sprint)}>
                      View Members
                    </button>
                  )}

                  {isAdmin && sprint.status !== 'Completed' && sprint.status !== 'Active' && (
                    <button className="edit-sprint-btn" onClick={() => onEditSprint(sprint)}>
                      Edit Sprint
                    </button>
                  )}

                  {isAdmin && sprint.status === 'Not Started' && (
                    <button className="delete-sprint-btn" onClick={() => onDeleteSprint(sprint.id)}>
                      <i className="fas fa-trash-alt"></i>
                    </button>
                  )}

                  {sprint.status !== 'Not Started' && (
                    <button className="burndown-chart-btn" onClick={() => handleShowBurndownChart(sprint)}>
                      <i className="fas fa-chart-line"></i>
                    </button>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      {/* Render the Members Overlay when the button is clicked */}
      {showMembersOverlay && selectedSprint && (
        <div className="overlay">
          <div className="overlay-content" ref={overlayRef}>
            <div className="overlay-header">
              <h3>Members in Sprint</h3>
              <button className="close-overlay-btn" onClick={handleCloseMembersOverlay}>
                &times;
              </button>
            </div>
            <ViewMembers 
              sprintDetails={selectedSprint}
              members={selectedSprintMembers} 
              onRemoveMember={handleRemoveMember} // Pass the member removal function
            />
          </div>
        </div>
      )}
      {showBurndownChart && selectedSprint && (
        <div className="overlay">
          <div className="overlay-content" ref={overlayRef}>
            <button className="close-overlay-btn" onClick={handleCloseBurndownChart}>
              &times;
            </button>
            <BurndownChart sprintId={selectedSprint.id} />
          </div>
        </div>
      )}
    </div>
  );
};

export default SprintTable;