import React, { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase/firebaseConfig';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

function BurndownChart({ sprintId }) {
    const [tasks, setTasks] = useState([]);
    const [sprintStartDate, setSprintStartDate] = useState(null);
    const [sprintEndDate, setSprintEndDate] = useState(null);
    const currentDate = new Date();

    
    useEffect(() => {
        const fetchSprintData = async () => {
            if (sprintId) {
                const sprintRef = doc(db, 'sprints', sprintId);
                const sprintSnapshot = await getDoc(sprintRef);
                if (sprintSnapshot.exists()) {
                    const sprintData = sprintSnapshot.data();
                    console.log('Fetched sprint data:', sprintData); // Debugging log
                    setTasks(sprintData.tasks || []);
                    setSprintStartDate(new Date(sprintData.startDate));
                    setSprintEndDate(new Date(sprintData.endDate));
                } else {
                    console.error('Sprint document does not exist');
                }
            }
        };

        fetchSprintData();
    }, [sprintId]);

    // Calculate total story points
    const totalStoryPoints = tasks.reduce((acc, task) => acc + parseInt(task.storyPoints), 0);

    // Generate date labels for the sprint duration
    const generateDateLabels = (startDate, endDate) => {
        const dates = [];
        let currentDate = new Date(startDate);
        while (currentDate <= endDate) {
            dates.push(new Date(currentDate));
            currentDate.setDate(currentDate.getDate() + 1);
        }
        return dates;
    };

    const dateLabels = sprintStartDate && sprintEndDate ? generateDateLabels(sprintStartDate, sprintEndDate) : [];

    console.log('Date Labels:', dateLabels); // Debugging log

    // Ensure there are dates to avoid division by zero
    if (dateLabels.length === 0) {
        return <div>Loading...</div>;
    }

    // Create an array for ideal velocity
    const idealVelocity = dateLabels.map((_, i) => {
        return totalStoryPoints - (totalStoryPoints / (dateLabels.length - 1)) * i;
    });

    // Create an array for actual remaining story points over time
    const remainingStoryPoints = dateLabels.map((date, i) => {
        const completedStoryPoints = tasks
            .filter((task) => new Date(task.completedDate) <= date) // Assuming each task has a 'completedDate' field
            .reduce((acc, task) => acc + parseInt(task.storyPoints), 0);

        return totalStoryPoints - completedStoryPoints;
    });

    console.log('Ideal Velocity:', idealVelocity); // Debugging log
    console.log('Remaining Story Points:', remainingStoryPoints); // Debugging log

    // Data for the Line chart
    const data = {
        labels: dateLabels.map(date => date.toDateString()),
        datasets: [
            {
                label: 'Ideal Velocity',
                data: idealVelocity,
                borderColor: 'rgba(75, 192, 192, 1)',
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                borderWidth: 2,
                fill: false,
            },
            {
                label: 'Actual Velocity',
                data: remainingStoryPoints,
                borderColor: 'rgba(153, 102, 255, 1)',
                backgroundColor: 'rgba(153, 102, 255, 0.2)',
                borderWidth: 2,
                fill: false,
            },
        ],
    };

    console.log('Chart Data:', data); // Debugging log

    const options = {
        scales: {
            y: {
                beginAtZero: true,
                title: {
                    display: true,
                    text: 'Story Points',
                    font: {
                        weight: 'bold', // Make the y-axis label bold
                    },
                },
            },
            x: {
                title: {
                    display: true,
                    text: 'Dates',
                    font: {
                        weight: 'bold', // Make the y-axis label bold
                    },
                },
            },
        },
    };

    return (
        <div className="burndown-chart-container">
            <h3>Burndown Chart</h3>
            <Line data={data} options={options} />
        </div>
    );
}

export default BurndownChart;