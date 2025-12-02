import React, { useState, useEffect } from 'react';
import { userAPI } from '../api';
import EditProfileModal from './EditProfileModal';

function UserPage({ currentUser, onUserUpdate }) {
  const [userDetails, setUserDetails] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);

  useEffect(() => {
    loadUserDetails();
  }, []);

  const loadUserDetails = async () => {
    try {
      const data = await userAPI.getById(currentUser.id);
      setUserDetails(data);
    } catch (err) {
      console.error('Failed to load user details:', err);
    }
  };

  const handleUpdateProfile = async (updateData) => {
    try {
      await userAPI.update(currentUser.id, updateData);
      setShowEditModal(false);
      loadUserDetails();
      
      if (updateData.username) {
        localStorage.setItem('username', updateData.username);
        if (onUserUpdate) {
          onUserUpdate({ ...currentUser, username: updateData.username });
        }
      }
    } catch (err) {
      console.error('Failed to update profile:', err);
    }
  };

  return (
    <div>
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ margin: 0 }}>My Profile</h2>
          <button className="btn" onClick={() => setShowEditModal(true)}>
            Edit Profile
          </button>
        </div>
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

      {showEditModal && userDetails && (
        <EditProfileModal
          user={userDetails}
          onClose={() => setShowEditModal(false)}
          onUpdate={handleUpdateProfile}
        />
      )}
    </div>
  );
}

export default UserPage;

