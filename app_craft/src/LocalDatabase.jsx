import { db } from './firebase/firebaseConfig.js';
import { collection, getDocs } from 'firebase/firestore';
import { getAuth, onAuthStateChanged } from 'firebase/auth'; // Import Firebase Auth

function dynamicSort(key, sortOrder = 'asc') {
    return function (a, b) {
        if (a[key] < b[key]) 
            return sortOrder === 'asc' ? -1 : 1;
        if (a[key] > b[key])
            return sortOrder === 'asc' ? 1 : -1;
        return 0;
    }
}

function createData(name, tags, priority, storyPoints, id, description, type, history, assignee, stage, dateCreated = new Date(), status, logtimeSpent = 0, logTimeHistory ,completedDate = null, sprintId = null) {

    return {
        name,
        tags,
        priority,
        storyPoints,
        priorityNum: priority === 'Low' ? 1 : priority === 'Medium' ? 2 : priority === 'Important' ? 3 : 4,
        history,
        id,
        description,
        type,
        assignee,
        stage,
        dateCreated,
        status, // Force fallback here,
        logtimeSpent,
        logTimeHistory,
        completedDate,
        sprintId
    };
}

class LocalDatabase {
    constructor() {
        this.data = [];
        this.modifiedData = [];
        this.updateCounter = 0; // Counter to track updates
        this.currentUser = null; // Store the current user
    }

    async init() {
        await this.fetchData();
        await this.fetchCurrentUser(); // Fetch the current user
    }

    async fetchData() {
        this.data = [];
        const querySnapshot = await getDocs(collection(db, 'tasks'));
        querySnapshot.forEach((doc) => {
            this.data.push(createData(
                doc.data().name, 
                doc.data().tags, 
                doc.data().priority, 
                doc.data().storyPoints, 
                doc.id, 
                doc.data().description, 
                doc.data().type, 
                doc.data().history, 
                doc.data().assignee, 
                doc.data().stage, 
                doc.data().dateCreated,
                doc.data().status,
                doc.data().logtimeSpent,
                doc.data().logTimeHistory,
                doc.data().completedDate,
                doc.data().sprintId
            ));
        });
        this.updateCounter++;
    }

    async fetchCurrentUser() {
        const auth = getAuth();
        return new Promise((resolve, reject) => {
            onAuthStateChanged(auth, (user) => {
                if (user) {
                    this.currentUser = user;
                    resolve(user);
                } else {
                    this.currentUser = null;
                    reject('No user is signed in');
                }
            });
        });
    }

    getCurrentUser() {
        return this.currentUser;
    }

    getData() {
        return this.data;
    }

    setData(data) {
        this.data = data;
        this.updateCounter++;
    }

    editData(dataID, data) {
        const dataToChangeIndex = this.data.findIndex(task => task.id === dataID);
        if (dataToChangeIndex !== -1) {
            const dataToChange = this.data[dataToChangeIndex];
            const updatedData = {
                ...dataToChange,
                name: data.name,
                type: data.type,
                stage: data.stage,
                storyPoints: data.storyPoints,
                priority: data.priority,
                tags: data.tags,
                assignee: data.assignee,
                description: data.description,
                history: data.history,
                priorityNum: data.priority === 'Low' ? 1 : data.priority === 'Medium' ? 2 : data.priority === 'Important' ? 3 : 4,
                status: data.status,
                logtimeSpent: data.logtimeSpent,
                logTimeHistory: data.logTimeHistory,
                completedDate: data.completedDate,
            };
            this.data[dataToChangeIndex] = updatedData;
            this.updateCounter++;
        }
    }

    async updateData() {
        this.data = [];
        await this.fetchData();
        this.updateCounter++;
    }

    addData(newData) {
        this.data.push(newData);
        this.updateCounter++;
    }

    deleteData(id) {
        this.data = this.data.filter(task => task.id !== id);
        this.updateCounter++;
    }

    getUpdateCounter() {
        return this.updateCounter;
    }

    getDataByID(id) {
        return this.data.find(task => task.id === id);
    }

    filterTasks(tags, priority, storyPoints) {
        let filtered = this.data;

        if (tags.length > 0) {
            filtered = filtered.filter(task => tags.some(tag => task.tags.includes(tag)));
        }

        if (priority) {
            filtered = filtered.filter(task => task.priority === priority);
        }

        if (storyPoints !== null) {
            filtered = filtered.filter(task => task.storyPoints === storyPoints);
        }

        this.modifiedData = filtered;
    }

    getFilteredData() {
        return this.modifiedData;
    }

    sortData(key, sortOrder) {
        if (!key) return this.modifiedData;
        if (sortOrder === 'desc') 
            this.modifiedData.sort(dynamicSort(key, sortOrder)).reverse();
        else
            this.modifiedData.sort(dynamicSort(key, sortOrder));
    }
}

const localDB = new LocalDatabase();
export default localDB;