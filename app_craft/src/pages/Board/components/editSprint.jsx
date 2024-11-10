import React, { useState, useEffect } from 'react';
import '../css/editSprint.css';
import MemberDropdown from './memberDropdown.jsx';
import { fetchUsers } from './sprintDatabaseLogic.jsx';

const EditSprint = ({ sprintDetails, onEdit, onClose }) => {
    const [sprintName, setSprintName] = useState(sprintDetails.name || '');
    const [startDate, setStartDate] = useState(sprintDetails.startDate || '');
    const [endDate, setEndDate] = useState(sprintDetails.endDate || '');
    const [productOwner, setProductOwner] = useState(
        sprintDetails.productOwner ? { label: sprintDetails.productOwner, value: sprintDetails.productOwner } : null
    );
    const [scrumMaster, setScrumMaster] = useState(
        sprintDetails.scrumMaster ? { label: sprintDetails.scrumMaster, value: sprintDetails.scrumMaster } : null
    );
    const [members, setMembers] = useState(
        Array.isArray(sprintDetails.members)
            ? sprintDetails.members.map((member) => ({ label: member, value: member }))
            : []
    );
    const [error, setError] = useState('');
    const [memberOptions, setMemberOptions] = useState([]);
    const [prevProductOwner, setPrevProductOwner] = useState(productOwner);
    const [prevScrumMaster, setPrevScrumMaster] = useState(scrumMaster);
    
    useEffect(() => {
        const loadUsers = async () => {
            try {
                const users = await fetchUsers();
                const options = users.map(user => ({ label: user.username, value: user.username }));
                setMemberOptions(options);
    
                // Check if the selected Product Owner or Scrum Master are still valid
                if (productOwner && !options.some(option => option.value === productOwner.value)) {
                    setProductOwner(null); // Clear Product Owner if no longer in the options
                }
                if (scrumMaster && !options.some(option => option.value === scrumMaster.value)) {
                    setScrumMaster(null); // Clear Scrum Master if no longer in the options
                }
    
                // Filter out members that are no longer valid
                const validMembers = members.filter(member => options.some(option => option.value === member.value));
                setMembers(validMembers);
    
            } catch (error) {
                console.error("Error fetching users:", error);
            }
        };
        
        loadUsers();
    }, []);
    
    useEffect(() => {
        let updatedMembers = [...members];

        if (productOwner && scrumMaster && productOwner.value === scrumMaster.value) {
            setError('Product Owner and Scrum Master cannot be the same person.');
            return; // Exit the effect early, don't update members
        } else {
            setError(''); // Clear any previous error if it's valid
        }
        // Remove the previous po if they were added automatically
        if (prevProductOwner && prevProductOwner.value !== productOwner?.value) {
            updatedMembers = updatedMembers.filter(member => member.value !== prevProductOwner.value);
        }

        // Remove the previous sm if they were added automatically
        if (prevScrumMaster && prevScrumMaster.value !== scrumMaster?.value) {
            updatedMembers = updatedMembers.filter(member => member.value !== prevScrumMaster.value);
        }

        // Add the current po if not already in the members list
        if (productOwner && !updatedMembers.some(member => member.value === productOwner.value)) {
            updatedMembers.push(productOwner);
        }

        // Add the current sm if not already in the members list
        if (scrumMaster && !updatedMembers.some(member => member.value === scrumMaster.value)) {
            updatedMembers.push(scrumMaster);
        }

        setPrevProductOwner(productOwner); // Update the previous po
        setPrevScrumMaster(scrumMaster); // Update the previous sm
        setMembers(updatedMembers);
    }, []); 

    const handleEditSprint = () => {
        const today = new Date().setHours(0, 0, 0, 0); // Get today's date without time

        if (productOwner && scrumMaster && productOwner.value === scrumMaster.value) {
            setError('Product Owner and Scrum Master cannot be the same person.');
            return; // Prevent submission
        }

        if (!sprintName.trim() || !startDate || !endDate || !productOwner || !members.length) {
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

        onEdit({
            name: sprintName,
            startDate,
            endDate,
            productOwner: productOwner.value,
            scrumMaster: scrumMaster.value,
            members: members.map((member) => member.value),
        });
        onClose(); // Close overlay after editing the sprint
    };

    const handleMemberSelect = (option) => {
        setMembers(option);
    }

    return (
        <div className="edit-sprint-overlay">
            <div className="overlay">
                <div className="overlay-content">
                    <h2 className="overlay-title">Edit Sprint</h2>
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
                            inputValue={productOwner} // Pre-filled value
                            handleSelect={(selected) => setProductOwner(selected)} // Update value
                            isMulti={false}
                            placeholder="Select Product Owner"
                        />
                    </div>

                    {/* Single select for Scrum Master */}
                    <div className="form-group">
                        <label>Scrum Master</label>
                        <MemberDropdown
                            options={memberOptions}
                            inputValue={scrumMaster} // Pre-filled value
                            handleSelect={(selected) => setScrumMaster(selected)} // Update value
                            isMulti={false}
                            placeholder="Select Scrum Master"
                        />
                    </div>

                    {/* Multi select for Members */}
                    <div className="form-group">
                        <label>Members</label>
                        <MemberDropdown
                            options={memberOptions}
                            inputValue={members || []} // Pre-filled values
                            handleSelect={handleMemberSelect} // Update members list
                            isMulti={true}
                            placeholder="Select Members"
                        />
                    </div>

                    <div className="button-group">
                        <button className="cancel-button" onClick={onClose}>Cancel</button>
                        <button className="edit-button" onClick={handleEditSprint}>Save Changes</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EditSprint;
