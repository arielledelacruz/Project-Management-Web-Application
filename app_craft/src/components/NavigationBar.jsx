import React, { useState, useEffect } from "react";
import { Link, useLocation } from 'react-router-dom';
import '../cssFiles/NavigationBar.css';
import accountIcon from '../assets/images/accountIcon.png';
import backlogIcon from '../assets/images/backlogIcon.png';
import kanbanIcon from '../assets/images/kanbanIcon.png';
import adminIcon from '../assets/images/adminIcon.png';
import { auth, db } from '../firebase/firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';

const NavigationBar = ({ currentUser }) => {
    const [activeItem, setActiveItem] = useState("");
    const location = useLocation();
    const [isAdmin, setIsAdmin] = useState(false);

    useEffect(() => {
        const checkAdminStatus = async () => {
            const user = auth.currentUser;
            if (user) {
                const userDoc = await getDoc(doc(db, 'users', user.uid));
                if (userDoc.exists()) {
                    const userData = userDoc.data();
                    setIsAdmin(userData.isAdmin);
                }
            }
        };
        checkAdminStatus();

        const path = location.pathname;
        if (path.includes("account")) {
            setActiveItem("Account");
        } else if (path === "/") {
            setActiveItem("Backlog");
        } else if (path.includes("sprintboard")) {
            setActiveItem("Board");
        } else if (path.includes("admin")) {
            setActiveItem("Admin");
        }
    }, [location]);

    const handleItemClick = (item) => {
        setActiveItem(item);
    };

    return (
        <header className="header">
            <div className="lightblue-bar"></div> {/* Light blue vertical bar */}
            <nav className="navbar">
                <Link 
                    to="/account" 
                    className={`nav-item ${activeItem === "Account" ? "active" : ""}`}
                    onClick={() => handleItemClick("Account")}
                >
                    <img src={accountIcon} alt="Account Icon" className="nav-icon" />
                    <span>Account</span>
                </Link>
                <Link 
                    to="/app" 
                    className={`nav-item ${activeItem === "Backlog" ? "active" : ""}`}
                    onClick={() => handleItemClick("Backlog")}
                >
                    <img src={backlogIcon} alt="Backlog Icon" className="nav-icon" />
                    <span>Backlog</span>
                </Link>
                <Link 
                    to="/sprintboard" 
                    className={`nav-item ${activeItem === "Board" ? "active" : ""}`}
                    onClick={() => handleItemClick("Board")}
                >
                    <img src={kanbanIcon} alt="Kanban Board Icon" className="nav-icon" />
                    <span>Board</span>
                </Link>
                {currentUser && currentUser.isAdmin && (
                    <Link 
                        to="/admin" 
                        className={`nav-item ${activeItem === "Admin" ? "active" : ""}`}
                        onClick={() => handleItemClick("Admin")}
                    >
                        <img src={adminIcon} alt="Admin Icon" className="nav-icon" />
                        <span>Admin</span>
                    </Link>
                )}
            </nav>
        </header>
    );
}

export default NavigationBar;