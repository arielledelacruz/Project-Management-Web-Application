import React, { useState, useEffect } from 'react';
import '../css/createSprint.css'; 
import MemberDropdown from './memberDropdown.jsx';
import { fetchUsers } from './sprintDatabaseLogic.jsx';

const CreateSprint = ({ onCreate, onClose }) => {
    const [sprintName, setSprintName] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [productOwner, setProductOwner] = useState(null); // Initialize with null
    const [scrumMaster, setScrumMaster] = useState(null); // Initialize with null
    const [members, setMembers] = useState([]);
    const [error, setError] = useState('');
    const [memberOptions, setMemberOptions] = useState([]);
    const [prevProductOwner, setPrevProductOwner] = useState(null);
    const [prevScrumMaster, setPrevScrumMaster] = useState(null);

    // Only fetch users once when the component mounts
    useEffect(() => {
        const loadUsers = async () => {
            try {
                const users = await fetchUsers();
                const options = users.map(user => ({ label: user.username, value: user.username }));
                setMemberOptions(options);
            } catch (error) {
                console.error("Error fetching users:", error);
            }
        };
    
        loadUsers();
    }, []); // Empty dependency array ensures this runs once on mount

    // Sync productOwner, scrumMaster, and members with member options when options are loaded
    useEffect(() => {
        if (!memberOptions.length) return;

        // Clear productOwner or scrumMaster if they are no longer valid
        if (productOwner && !memberOptions.some(option => option.value === productOwner.value)) {
            setProductOwner(null);
        }
        if (scrumMaster && !memberOptions.some(option => option.value === scrumMaster.value)) {
            setScrumMaster(null);
        }

        // Filter out invalid members
        const validMembers = members.filter(member => memberOptions.some(option => option.value === member.value));
        setMembers(validMembers);

    }, []); // Only runs when memberOptions changes

    // Automatically add Product Owner and Scrum Master to the members list
    useEffect(() => {
        let updatedMembers = [...members];

        if (productOwner && scrumMaster && productOwner.value === scrumMaster.value) {
            setError('Product Owner and Scrum Master cannot be the same person.');
            return; // Exit the effect early, don't update members
        } else {
            setError(''); 
        }

        // Remove the previous Product Owner from the members list if they weren't manually added before
        if (prevProductOwner && prevProductOwner.value !== productOwner?.value) {
            updatedMembers = updatedMembers.filter(member => member.value !== prevProductOwner.value);
        }

        // Remove the previous Scrum Master from the members list if they weren't manually added before
        if (prevScrumMaster && prevScrumMaster.value !== scrumMaster?.value) {
            updatedMembers = updatedMembers.filter(member => member.value !== prevScrumMaster.value);
        }
        // Add Product Owner if not already in the members list
        if (productOwner && !updatedMembers.some(member => member.value === productOwner.value)) {
            updatedMembers = [...updatedMembers, productOwner];
        }

        // Add Scrum Master if not already in the members list
        if (scrumMaster && !updatedMembers.some(member => member.value === scrumMaster.value)) {
            updatedMembers = [...updatedMembers, scrumMaster];
        }
        setPrevProductOwner(productOwner);
        setPrevScrumMaster(scrumMaster);
        setMembers(updatedMembers);
    }, []); // Only runs when productOwner or scrumMaster changes

    const handleCreateSprint = () => {
        const today = new Date().setHours(0, 0, 0, 0); // Get today's date without time

        //po and sm cannot be the same person
        if (productOwner && scrumMaster && productOwner.value === scrumMaster.value) {
            setError('Product Owner and Scrum Master cannot be the same person.');
            return;
        }

        if (!sprintName.trim() || !startDate || !endDate || !productOwner || !scrumMaster || members.length === 0) {
            setError('All fields are required.');
            return;
        }

        if (new Date(startDate) < today || new Date(endDate) < today) {
            setError('Dates cannot be before today.');
            return;
        }

        if (new Date(endDate) < new Date(startDate)) {
            setError('End date cannot be earlier than start date.');
            return;
        }

        onCreate({
            name: sprintName,
            startDate,
            endDate,
            productOwner: productOwner.value,
            scrumMaster: scrumMaster.value,
            members: members.map((member) => member.value),
            tasks: [],
            status: 'Not Started'
        });
        onClose(); // Close overlay after creating the sprint
    };

    return (
        <div className="create-sprint-overlay">
            <div className="overlay">
                <div className="overlay-content">
                    <h2 className="overlay-title">Create Sprint</h2>
                    {error && <p className="error-message">{error}</p>}
                    <div className="form-group">
                        <label>Sprint Name</label>
                        <input
                            type="text"
                            value={sprintName}
                            onChange={(e) => setSprintName(e.target.value)}
                            placeholder="Enter Sprint Name"
                        />
                    </div>
                    <div className="form-group">
                        <label>Start Date</label>
                        <input
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                        />
                    </div>
                    <div className="form-group">
                        <label>End Date</label>
                        <input
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                        />
                    </div>

                    {/* Single select for Product Owner */}
                    <div className="form-group">
                        <label>Product Owner</label>
                        <MemberDropdown
                            options={memberOptions}
                            inputValue={productOwner}
                            handleSelect={setProductOwner}
                            isMulti={false}
                            placeholder="Select Product Owner"
                        />
                    </div>

                    {/* Single select for Scrum Master */}
                    <div className="form-group">
                        <label>Scrum Master</label>
                        <MemberDropdown
                            options={memberOptions}
                            inputValue={scrumMaster}
                            handleSelect={setScrumMaster}
                            isMulti={false}
                            placeholder="Select Scrum Master"
                        />
                    </div>

                    {/* Multi select for Members */}
                    <div className="form-group">
                        <label>Members</label>
                        <MemberDropdown
                            options={memberOptions}
                            inputValue={members}
                            handleSelect={setMembers}
                            isMulti={true}
                            placeholder="Select Members"
                        />
                    </div>

                    <div className="button-group">
                        <button className="cancel-button" onClick={onClose}>Cancel</button>
                        <button className="create-button" onClick={handleCreateSprint}>Create Sprint</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CreateSprint;
