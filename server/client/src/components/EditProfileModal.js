import React, { useState } from 'react';

function EditProfileModal({ user, onClose, onUpdate }) {
  const [username, setUsername] = useState(user.username);
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();

    const updateData = {};
    if (username !== user.username) {
      updateData.username = username;
    }
    if (password) {
      updateData.password = password;
    }

    if (Object.keys(updateData).length === 0) {
      onClose();
      return;
    }

    onUpdate(updateData);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h2>Edit Profile</h2>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              placeholder="Enter new username"
            />
          </div>

          <div className="form-group">
            <label>New Password (optional)</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Leave empty to keep current password"
            />
          </div>

          <div className="btn-group">
            <button type="submit" className="btn">
              Save Changes
            </button>
            <button 
              type="button" 
              className="btn btn-secondary" 
              onClick={onClose}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditProfileModal;

