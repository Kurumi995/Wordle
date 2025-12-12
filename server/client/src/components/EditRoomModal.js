import React, { useState } from 'react';

function EditRoomModal({ room, onClose, onUpdate }) {
  const [isPublic, setIsPublic] = useState(room.isPublic);
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    const updateData = {
      isPublic
    };
    if (!isPublic && password) {
      updateData.password = password;
    }
    onUpdate(room.id, updateData);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h2>Edit Room</h2>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Room Type</label>
            <select 
              value={isPublic} 
              onChange={(e) => setIsPublic(e.target.value === 'true')}
              style={{ 
                width: '100%', 
                padding: '12px 15px', 
                border: '2px solid #FF3399', 
                borderRadius: '15px',
                fontSize: '1em'
              }}
            >
              <option value="true">Public</option>
              <option value="false">Private</option>
            </select>
          </div>

          {!isPublic && (
            <div className="form-group">
              <label>New Password (optional)</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter new password or leave empty"
              />
              <p style={{ fontSize: '0.9em', color: '#666', marginTop: '5px' }}>
                Leave empty to keep current password
              </p>
            </div>
          )}

          <div className="btn-group">
            <button type="submit" className="btn">
              Update
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

export default EditRoomModal;

