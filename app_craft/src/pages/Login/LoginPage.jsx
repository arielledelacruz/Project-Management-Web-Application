import React, { useState } from 'react';
import './LoginPage.css';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '../../firebase/firebaseConfig.js'; // Import Firebase auth and Firestore
import { useNavigate } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore'; // Import Firestore functions

const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [showOverlay, setShowOverlay] = useState(false);
    const [username, setUsername] = useState(''); // State to store username
    const navigate = useNavigate();

    const handleEmailChange = (e) => {
        setEmail(e.target.value);
    };

    const handlePasswordChange = (e) => {
        setPassword(e.target.value);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        console.log('Email:', email);
        console.log('Password:', password);
        console.log('Firebase Auth:', auth);
        try {
            // Use Firebase Authentication to log in with email and password
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            // Fetch user details from Firestore
            const userDoc = await getDoc(doc(db, 'users', user.uid));
            if (userDoc.exists()) {
                const userData = userDoc.data();
                setUsername(userData.username); // Set the username
                setShowOverlay(true); // Show the overlay
            } else {
                console.error('No such document!');
                setError('User details not found');
            }
        } catch (error) {
            console.error('Error logging in:', error);
            setError('Invalid email or password');
        }
    };

    const handleCloseOverlay = () => {
        setShowOverlay(false);
        navigate('/app'); // Navigate to the App page
    };

    return (
        <div className="login-page-container">
            <div className="login-page-box">
                <h1>Welcome to Meow Meow!</h1>
                <p>Please log in to access your account</p>
                <form onSubmit={handleSubmit}>
                    <div className="login-page-form-group">
                        <label htmlFor="email">Email:</label>
                        <input
                            type="email"
                            id="email"
                            value={email}
                            onChange={handleEmailChange}
                            required
                        />
                    </div>
                    <div className="login-page-form-group">
                        <label htmlFor="password">Password:</label>
                        <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={handlePasswordChange}
                            required
                        />
                    </div>
                    {error && <div className="login-page-error">{error}</div>}
                    <button type="submit" className="login-page-button">Login</button>
                </form>
            </div>
            {showOverlay && (
                <div className="login-overlay">
                    <div className="login-overlay-content">
                        <h2>Welcome, {username}!</h2>
                        <p>You have successfully logged in.</p>
                        <button onClick={handleCloseOverlay}>Close</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default LoginPage;