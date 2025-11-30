import React, { useState } from 'react';
import { roomAPI } from '../api';

function JoinRoomModal({ room, onClose, onJoin }) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const result = await roomAPI.verifyPassword(room.id, password);
      if (result.valid) {
        onJoin();
      } else {
        setError('Invalid password');
      }
    } catch (err) {
      setError('Failed to verify password');
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h2>Join Private Room</h2>
        
        {error && <div className="error">{error}</div>}
        
        <p style={{ marginBottom: '20px', color: '#666' }}>
          This is a private room. Please enter the password to join.
        </p>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Enter room password"
              autoFocus
            />
          </div>

          <div className="btn-group">
            <button type="submit" className="btn">
              Join
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

export default JoinRoomModal;

