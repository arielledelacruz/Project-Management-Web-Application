import React, { useState } from "react";
import PropTypes from "prop-types";
import '../css/PasswordChangeOverlay.css'; // Create and import a CSS file for styling if needed

const PasswordChangeOverlay = ({ onClose, onChangePassword }) => {
    const [oldPassword, setOldPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const handleSubmit = () => {
        if (newPassword !== confirmPassword) {
            alert("New passwords do not match!");
            return;
        }
        onChangePassword(oldPassword, newPassword);
    };

    return (
        <div className="overlay-password">
            <div className="overlay-password-content">
                <h2>Change Password</h2>
                <label>
                    Old Password:
                    <input 
                        type="password" 
                        value={oldPassword} 
                        onChange={(e) => setOldPassword(e.target.value)} 
                    />
                </label>
                <label>
                    New Password:
                    <input 
                        type="password" 
                        value={newPassword} 
                        onChange={(e) => setNewPassword(e.target.value)} 
                    />
                </label>
                <label>
                    Confirm New Password:
                    <input 
                        type="password" 
                        value={confirmPassword} 
                        onChange={(e) => setConfirmPassword(e.target.value)} 
                    />
                </label>
                <button onClick={handleSubmit}>Submit</button>
                <button onClick={onClose}>Cancel</button>
            </div>
        </div>
    );
};

PasswordChangeOverlay.propTypes = {
    onClose: PropTypes.func.isRequired,
    onChangePassword: PropTypes.func.isRequired,
};

export default PasswordChangeOverlay;