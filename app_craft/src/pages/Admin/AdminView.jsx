import React, { useState, useEffect } from "react";
import { collection, onSnapshot, deleteDoc, doc, updateDoc, getDoc } from "firebase/firestore";
import { db, auth } from '../../firebase/firebaseConfig'; // Firestore and Auth config
import { reauthenticateWithCredential, EmailAuthProvider, updatePassword, onAuthStateChanged } from "firebase/auth";
import NavigationBar from "../../components/NavigationBar";
import CreateAccount from "./component/CreateAccount";
import AccountTable from "./component/AccountTable"; // Import the new component
import GraphOverlay from "./component/GraphOverlay";
import TimeRangeFilter from "./component/TimeRangeFilter"; // Import the TimeRangeFilter component
import PasswordChangeOverlay from "./component/PasswordChangeOverlay"; // Import the PasswordChangeOverlay component
import './AdminView.css'; 

function AdminView() {
    const [isOverlayVisible, setIsOverlayVisible] = useState(false);
    const [isGraphVisible, setGraphVisible] = useState(false);
    const [isPasswordChangeVisible, setPasswordChangeVisible] = useState(false);
    const [users, setUsers] = useState([]);
    const [filteredAccounts, setFilteredAccounts] = useState([]);
    const [selectedAccount, setSelectedAccount] = useState(null);
    const [timeRange, setTimeRange] = useState({ start: "", end: "" });
    const [currentUser, setCurrentUser] = useState(null); // State to store current user

    const memberAccounts = users.filter(account => !account.isAdmin);

    useEffect(() => {
        const unsubscribe = onSnapshot(collection(db, "users"), (snapshot) => {
            const usersData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setUsers(usersData);
            setFilteredAccounts(memberAccounts);
        });

        // Cleanup subscription on unmount
        return () => unsubscribe();
    }, []);

    useEffect(() => {
        const authUnsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                const userDoc = await getDoc(doc(db, "users", user.uid));
                if (userDoc.exists()) {
                    setCurrentUser({ uid: user.uid, ...userDoc.data() });
                } else {
                    setCurrentUser(null);
                }
            } else {
                setCurrentUser(null);
            }
        });

        // Cleanup subscription on unmount
        return () => authUnsubscribe();
    }, []);

    const toggleOverlay = () => {
        setIsOverlayVisible(!isOverlayVisible);
    };

    const handleAccountCreation = (newUser) => {
        setUsers([...users, newUser]);
        setIsOverlayVisible(false);
    };

    const handleDelete = async (id) => {
        // Add confirmation for deletion
        const confirmDelete = window.confirm("Are you sure you want to delete this account?");
        if (!confirmDelete) {
            return; // If the user cancels, do nothing
        }

        try {
            // Proceed with deletion if confirmed
            await deleteDoc(doc(db, "users", id));
            setUsers(users.filter(user => user.id !== id));
            setFilteredAccounts(filteredAccounts.filter(account => account.id !== id));
            console.log("Account successfully deleted");
        } catch (error) {
            console.error("Error deleting account: ", error);
        }
    };

    const handleGraph = (account) => {
        setSelectedAccount(account);
        setGraphVisible(true);
        console.log("Graph for account with ID: ", account.id);
    };

    const closeGraph = () => {
        setGraphVisible(false);
        setSelectedAccount(null);
    }

    const handleTimeRangeConfirm = (start, end) => {
        setTimeRange({ start, end });
        // For now, this is just a mockup - you'd filter accounts based on the time range in your real implementation
        console.log("Time range selected: ", start, end);
    };

    const handleChangePassword = (accountId) => {
        setSelectedAccount(accountId);
        setPasswordChangeVisible(true);
    };

    const handlePasswordChange = async (oldPassword, newPassword) => {
        try {
            const user = auth.currentUser;
            const credential = EmailAuthProvider.credential(user.email, oldPassword);

            // Re-authenticate the user
            await reauthenticateWithCredential(user, credential);

            // Update the password in Firebase Authentication
            await updatePassword(user, newPassword);

            // Update the password in Firestore
            const userDocRef = doc(db, "users", selectedAccount);
            await updateDoc(userDocRef, { password: newPassword });

            setUsers(users.map(user => 
                user.id === selectedAccount ? { ...user, password: newPassword } : user
            ));
            console.log("Password successfully updated");
            setPasswordChangeVisible(false);
            setSelectedAccount(null);
        } catch (error) {
            console.error("Error updating password: ", error);
            alert("Error updating password: " + error.message);
        }
    };
    const memberUsers = users.filter(user => !user.isAdmin);

    return (
        <div className="adminView-container">
            <NavigationBar currentUser={currentUser} />
            <div className="content">
                <h1 className="title">Admin View</h1>

                {/* Create Account Button */}
                <button className="green-button" onClick={toggleOverlay}>Create Account</button>
                {isOverlayVisible && <CreateAccount onClose={toggleOverlay} onCreate={handleAccountCreation} />}

                {/* Time Range Filter */}
                <TimeRangeFilter onConfirm={handleTimeRangeConfirm} />
                
                {/* Member Accounts Table */}
                <AccountTable 
                    title="Member Accounts" 
                    accounts={memberUsers}
                    onDelete={handleDelete}
                    graph={handleGraph}
                    changePassword={handleChangePassword} // Pass the changePassword function
                    timeRange={timeRange}
                />

                {isGraphVisible && <GraphOverlay 
                    onClose={closeGraph}
                    selectedAccount={selectedAccount}
                    timeRange={timeRange}
                    />}

                {isPasswordChangeVisible && (
                    <PasswordChangeOverlay 
                        onClose={() => setPasswordChangeVisible(false)} 
                        onChangePassword={handlePasswordChange} 
                    />
                )}
            </div>
        </div>
    );
}

export default AdminView;