import React, { useState } from 'react';

function CreateRoomModal({ onClose, onCreate }) {
  const [isPublic, setIsPublic] = useState(true);
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onCreate({
      isPublic,
      password: isPublic ? '' : password
    });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h2>Create New Room</h2>
        
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
              <label>Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Enter room password"
              />
            </div>
          )}

          <div className="btn-group">
            <button type="submit" className="btn">
              Create
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

export default CreateRoomModal;

