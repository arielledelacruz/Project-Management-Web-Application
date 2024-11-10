import React, { useState, useEffect } from "react";
import NavigationBar from "../../components/NavigationBar";
import './AccountPage.css';
import changeDetails from './components/accountsDatabaseLogic';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'; // run this: npm install @fortawesome/react-fontawesome @fortawesome/free-solid-svg-icons
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import { getFirestore, doc, getDoc, updateDoc } from "firebase/firestore"; // Import Firestore functions
import { getAuth, onAuthStateChanged, EmailAuthProvider, reauthenticateWithCredential } from "firebase/auth";

function AccountPage() {
    const [email, setEmail] = useState("");
    const [oldPassword, setOldPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState(""); // New state for confirm password
    const [showOldPassword, setShowOldPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false); // New state for confirm password visibility
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [currentUser, setCurrentUser] = useState(null); // State to store current user

    useEffect(() => {
        const auth = getAuth();
        const db = getFirestore();
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                const userDoc = await getDoc(doc(db, "users", user.uid));
                if (userDoc.exists()) {
                    const userData = userDoc.data();
                    setEmail(userData.email);
                    setCurrentUser({ uid: user.uid, ...userData }); // Set the current user
                } else {
                    setEmail("");
                    setCurrentUser(null); // Clear the current user
                }
            } else {
                setEmail("");
                setCurrentUser(null); // Clear the current user
            }
        });

        return () => unsubscribe();
    }, []);

    const validatePassword = (password) => {
        const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#<>]{8,}$/;
        return strongPasswordRegex.test(password);
    };

    const handleChangePassword = async () => {
        if (!validatePassword(newPassword)) {
            setError("Password must be at least 8 characters long and include uppercase, lowercase, number, and special character.");
            setSuccess("");
            return;
        }

        if (newPassword !== confirmPassword) {
            setError("New password and confirm password do not match.");
            setSuccess("");
            return;
        }

        try {
            const auth = getAuth();
            const user = auth.currentUser;
            if (user) {
                const credential = EmailAuthProvider.credential(user.email, oldPassword);
                await reauthenticateWithCredential(user, credential);
                const account = await changeDetails(user.uid);
                await account.changePassword(newPassword);

                const db = getFirestore();
                const userDoc = doc(db, "users", user.uid);
                await updateDoc(userDoc, { password: newPassword });

                setError("");
                setSuccess("Password changed successfully!");
                setOldPassword("");
                setNewPassword("");
                setConfirmPassword(""); // Clear confirm password
            } else {
                setError("No authenticated user found.");
                setSuccess("");
            }
        } catch (err) {
            console.error("Error changing password:", err);
            setError("Failed to change password. Please try again.");
            setSuccess("");
        }
    };

    const toggleOldPasswordVisibility = () => setShowOldPassword((prevState) => !prevState);
    const toggleNewPasswordVisibility = () => setShowNewPassword((prevState) => !prevState);
    const toggleConfirmPasswordVisibility = () => setShowConfirmPassword((prevState) => !prevState); // Toggle confirm password visibility

    return (
        <div className="accountPage-container">
            <NavigationBar currentUser={currentUser} />
            <div className="content">
                <h1 className="title">Account Page</h1>

                <div className="form-group">
                    <label>Email</label>
                    <input type="text" value={email} readOnly />
                </div>

                <div className="form-group password-field">
                    <label>Old Password</label>
                    <div className="password-input-container">
                        <input
                            type={showOldPassword ? "text" : "password"}
                            value={oldPassword}
                            onChange={(e) => setOldPassword(e.target.value)}
                            placeholder="Enter old password"
                        />
                        <span className="toggle-password-icon" onClick={toggleOldPasswordVisibility}>
                            <FontAwesomeIcon icon={showOldPassword ? faEye : faEyeSlash} />
                        </span>
                    </div>
                </div>

                <div className="form-group password-field">
                    <label>New Password</label>
                    <div className="password-input-container">
                        <input
                            type={showNewPassword ? "text" : "password"}
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            placeholder="Enter new password"
                        />
                        <span className="toggle-password-icon" onClick={toggleNewPasswordVisibility}>
                            <FontAwesomeIcon icon={showNewPassword ? faEye : faEyeSlash} />
                        </span>
                    </div>
                </div>

                <div className="form-group password-field">
                    <label>Confirm New Password</label>
                    <div className="password-input-container">
                        <input
                            type={showConfirmPassword ? "text" : "password"}
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="Confirm new password"
                        />
                        <span className="toggle-password-icon" onClick={toggleConfirmPasswordVisibility}>
                            <FontAwesomeIcon icon={showConfirmPassword ? faEye : faEyeSlash} />
                        </span>
                    </div>
                </div>

                {error && <p style={{ color: "red" }}>{error}</p>}
                {success && <p style={{ color: "green" }}>{success}</p>}

                <button className="change-password-button" onClick={handleChangePassword}>Change Password</button>
            </div>
        </div>
    );
}

export default AccountPage;