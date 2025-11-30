import React, { useState, useEffect } from 'react';
import { userAPI } from '../api';

function UserPage({ currentUser }) {
  const [userDetails, setUserDetails] = useState(null);
  const [allUsers, setAllUsers] = useState([]);

  useEffect(() => {
    loadUserDetails();
    loadAllUsers();
  }, []);

  const loadUserDetails = async () => {
    try {
      const data = await userAPI.getById(currentUser.id);
      setUserDetails(data);
    } catch (err) {
      console.error('Failed to load user details:', err);
    }
  };

  const loadAllUsers = async () => {
    try {
      const data = await userAPI.getAll();
      setAllUsers(data);
    } catch (err) {
      console.error('Failed to load users:', err);
    }
  };

  return (
    <div>
      <div className="card">
        <h2>My Profile</h2>
        {userDetails && (
          <div className="user-info">
            <div className="user-avatar">
              {userDetails.username.charAt(0).toUpperCase()}
            </div>
            <div className="user-details">
              <h3>{userDetails.username}</h3>
              <p>Experience: {userDetails.experience} points</p>
              <p>User ID: {userDetails.id}</p>
            </div>
          </div>
        )}
      </div>

      <div className="card">
        <h2>All Users</h2>
        <div className="room-list">
          {allUsers.map((user) => (
            <div key={user.id} className="room-card">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div className="user-avatar" style={{ width: '40px', height: '40px', fontSize: '1.2em' }}>
                  {user.username.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 style={{ margin: 0, color: '#000' }}>{user.username}</h3>
                  <p style={{ margin: '5px 0', color: '#666' }}>
                    Experience: {user.experience}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default UserPage;

