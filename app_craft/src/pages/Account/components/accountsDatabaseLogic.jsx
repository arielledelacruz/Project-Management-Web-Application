import { doc, setDoc } from "firebase/firestore";
import { getAuth, updateEmail, updatePassword } from "firebase/auth";
import { db } from "../../../firebase/firebaseConfig.js";

const changeDetails = async (accountId) => {
    const account = doc(db, 'users', accountId); // Changed 'accounts' to 'users'
    const auth = getAuth();
    const user = auth.currentUser;

    const changeUserName = async (newUserName) => {
        await setDoc(account, { username: newUserName }, { merge: true });
    };

    const changeEmail = async (newEmail) => {
        if (user) {
            await updateEmail(user, newEmail);
            await setDoc(account, { email: newEmail }, { merge: true });
        } else {
            throw new Error("No authenticated user found");
        }
    };

    const changePassword = async (newPassword) => {
        if (user) {
            await updatePassword(user, newPassword);
        } else {
            throw new Error("No authenticated user found");
        }
    };

    const changeRoles = async (newRoles) => {
        await setDoc(account, { roles: newRoles }, { merge: true });
    };

    const changeContributionTime = async (newLogTime) => {
        await setDoc(account, { logTime: newLogTime }, { merge: true });
    };

    const changeContributionTimeHistory = async (newLogTimeHistory) => {
        await setDoc(account, { logTimeHistory: newLogTimeHistory }, { merge: true });
    };

    return { 
        changeUserName, 
        changeEmail, 
        changePassword, 
        changeRoles,
        changeContributionTime,
        changeContributionTimeHistory
    };
}

export default changeDetails;