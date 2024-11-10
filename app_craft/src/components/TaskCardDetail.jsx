import React, { useState, useEffect } from "react";
import PropTypes from 'prop-types';
import Box from '@mui/material/Box';
import Collapse from '@mui/material/Collapse';
import IconButton from '@mui/material/IconButton';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import { db } from '../firebase/firebaseConfig.js';
import { getDocs, collection, onSnapshot, doc } from 'firebase/firestore';
import '../cssFiles/TaskCardDetail.css';
import backEndDeleteTask from './backEndDeleteTask'; // Corrected import path
import DeleteTaskButton from "./DeleteTaskButton.jsx";
import EditTaskOverlay from './EditTaskOverLay.jsx';
import TaskFilter from './TaskFilter'; // Import TaskFilter component
import localDB from '../LocalDatabase'; // Import the LocalDatabase module

function createData(name, tags, priority, storyPoints, id, description, type, history, assignee, stage, dateCreated = new Date()) {
    return {
        name,
        tags: tags || [], // Ensure tags is always an array
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
    };
}

function Row({ row, onDelete, onTaskClick }) {
    const [open, setOpen] = useState(false);

    const handleDelete = async (e) => {
        e.stopPropagation(); // Prevent row click when clicking delete
        await backEndDeleteTask(row.id);
        onDelete(row.id);
    };

    return (
        <React.Fragment>
            <TableRow
                className="custom-row"
                sx={{ '& > *': { borderBottom: 'unset' } }}
                onClick={() => onTaskClick(row)} // Make the row clickable
                style={{ cursor: 'pointer' }}  // Change cursor to pointer to indicate it's clickable
            >
                <TableCell component="th" scope="row" className="task-name">
                    {row.name}
                </TableCell>
                <TableCell colSpan={4} className="task-details">
                    <div className="task-details-container">
                        <div className="task-tags">
                            {row.tags.map(tag => (
                                <span key={tag} className={`tag-display ${tag.toLowerCase()}`}>{tag}</span>
                            ))}
                        </div>
                        <span className={`priority-display ${row.priority.toLowerCase()}`}>{row.priority}</span>
                        <span className="task-detail">{row.storyPoints}</span>
                        <DeleteTaskButton className="delete-button" onClick={handleDelete}></DeleteTaskButton>
                    </div>
                </TableCell>
            </TableRow>
            <TableRow>
                <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
                </TableCell>
            </TableRow>
        </React.Fragment>
    );
}

Row.propTypes = {
    row: PropTypes.shape({
        tags: PropTypes.array.isRequired,
        storyPoints: PropTypes.number.isRequired,
        priority: PropTypes.string.isRequired,
        history: PropTypes.array.isRequired,
        name: PropTypes.string.isRequired,
        id: PropTypes.string.isRequired,
    }).isRequired,
    onDelete: PropTypes.func.isRequired,
    onTaskClick: PropTypes.func.isRequired,  // Add prop validation for the new click handler
};

export default function CollapsibleTable({ updateFlag, currentUser }) {
    const [rows, setRows] = useState([]);
    const [filteredRows, setFilteredRows] = useState([]);
    const [filters, setFilters] = useState({
        tags: [],         // Filter for tags (empty array means no filter)
        priority: '',     // Filter for priority (empty string means no filter)
        storyPoints: null // Filter for story points (null means no filter)
    });
    const [isEditOverlayVisible, setEditOverlayVisible] = useState(false);
    const [selectedTask, setSelectedTask] = useState(null);
    const [sortCriteria, setSortCriteria] = useState('');
    const [sortOrder, setSortOrder] = useState('asc');
    const [updateFlag2, setUpdateFlag2] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            const fetchedRows = [];
            const querySnapshot = await getDocs(collection(db, "tasks"));
            querySnapshot.forEach((doc) => {
                const data = createData(doc.data().name, doc.data().tags, doc.data().priority, doc.data().storyPoints, doc.id, doc.data().description, doc.data().type, doc.data().history, doc.data().assignee, doc.data().stage, doc.date().dateCreated);
                fetchedRows.push(data);
            });
            setRows(fetchedRows);
        };

        async function fetchDataFromDB() {
            await localDB.updateData();
            let data = localDB.getData();
            let filteredData = localDB.getFilteredData();
            setRows(data);
            setFilteredRows(filteredData);
        }

        console.log('Fetching data...');
        if (rows.length === 0) {
            console.log('Fetching data from DB...');
            fetchDataFromDB();
        } else {
            console.log('Updating Data...')
            setRows([])
            fetchDataFromDB();
        }
        // fetchData(); // this one is using the old Firebase module
        // fetchDataFromDB(); // this one is using the new LocalDatabase module
    }, [updateFlag, updateFlag2]);

    const handleDelete = (id) => {
        setRows((prevRows) => prevRows.filter((row) => row.id !== id));
        setFilteredRows((prevRows) => prevRows.filter((row) => row.id !== id));
        localDB.deleteData(id);
    };

    const handleTaskClick = (task) => {
        setSelectedTask(task);
        setEditOverlayVisible(true);
    };

    const handleFilterChange = (newFilters) => {
        setFilters(newFilters);
    };

    const applySort = (tasks) => {
        let sorted = [...tasks];
        sorted.sort((a, b) => {
            if (sortCriteria === 'priority') {
                if (sortOrder === 'asc') {
                    return a.priorityNum - b.priorityNum;
                } else {
                    return b.priorityNum - a.priorityNum;
                }
            } else if (sortCriteria === 'date') {
                const dateA = a.dateCreated instanceof Date ? a.dateCreated : new Date(a.dateCreated.seconds * 1000 + a.dateCreated.nanoseconds / 1000000);
                const dateB = b.dateCreated instanceof Date ? b.dateCreated : new Date(b.dateCreated.seconds * 1000 + b.dateCreated.nanoseconds / 1000000);
                if (sortOrder === 'asc') {
                    return dateA - dateB;
                } else {
                    return dateB - dateA;
                }
            }
            return 0;
        });
        console.log(sorted);
        return sorted;
    };

    const applyFilters = () => {
        let filtered = rows;

        if (filters.tags.length > 0) {
            filtered = filtered.filter(task => 
                filters.tags.every(tag => task.tags && task.tags.includes(tag)) // Ensure task.tags is defined
            );
        }

        if (filters.priority) {
            filtered = filtered.filter(task => task.priority === filters.priority);
        }

        if (filters.storyPoints !== null) {
            filtered = filtered.filter(task => task.storyPoints === filters.storyPoints);
        }

        filtered = filtered.filter(task => task.status === null);

        //added this so that u still can sort the filtered ones :D
        const sorted = applySort(filtered)
        setFilteredRows(sorted);
    };

    useEffect(() => {
        applyFilters();
    }, [filters, rows, sortOrder, sortCriteria]);

    const handleSortByPriority = () => {
        setSortCriteria('priority');
        setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    };

    const handleSortByDate = () => {
        setSortCriteria('date');
        setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    };

    const handleUpdate = () => {
        setUpdateFlag2(!updateFlag2);
    }

    return (
        <div className="TableContainer">
            <div className="filter-sort-container">
                <TaskFilter onFilterChange={handleFilterChange} />
                <div className="sort-buttons">
                    <button onClick={handleSortByPriority}>
                        Sort by Priority {sortCriteria === 'priority' && (sortOrder === 'asc' ? '▲' : '▼')}
                    </button>
                    <button onClick={handleSortByDate}>
                        Sort by Date {sortCriteria === 'date' && (sortOrder === 'asc' ? '▲' : '▼')}
                    </button>
                </div>
            </div>
            <TableContainer component={Paper}>
                <Table aria-label="collapsible table">
                    <TableHead className="table-head">
                        <TableRow>
                            <TableCell>Task Name</TableCell>
                            <TableCell colSpan={4} className="task-details">
                                <div className="task-details-container">
                                    <span className="task-detail">Tag</span>
                                    <span className="task-detail">Priority</span>
                                    <span className="task-detail">Story Point</span>
                                    <span className="task-detail">Delete</span> {/* Empty span for alignment */}
                                </div>
                            </TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {filteredRows.map((row) => (
                            <Row key={row.id} row={row} onDelete={handleDelete} onTaskClick={handleTaskClick} />
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* Conditionally render the EditTaskOverlay */}
            {isEditOverlayVisible && selectedTask && (
                <EditTaskOverlay
                    task={selectedTask}
                    onClose={() => setEditOverlayVisible(false)}
                    onSave={(updatedTask) => { /* Handle save logic here */ }}
                    onUpdate={handleUpdate}
                    currentUser={currentUser} // Pass the current user data here
                />
            )}
        </div>
    );
}