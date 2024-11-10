import React, { useState, useEffect } from 'react';
import { removeMemberFromActiveSprint } from '../components/sprintDatabaseLogic.jsx'; // Import backend logic to remove member
import '../css/viewMembers.css';

const ViewMembers = ({ sprintDetails, members, onRemoveMember }) => {

    console.log(members, 'members');



    return (
        <div className="view-members">
            <ul>
                {members.map((member) => (
                    <li key={member.id || member}> 
                        <span>{member.username}</span> 
                        <button 
                            className={`remove-member-btn ${sprintDetails.status === 'Active' ? "" : "disabled"}`} 
                            onClick={() => onRemoveMember(member)}
                            disabled={sprintDetails.status !== 'Active'}
                        >
                            Remove Member
                        </button>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default ViewMembers;
