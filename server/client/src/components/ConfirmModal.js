import React from 'react';

function ConfirmModal({ message, onConfirm, onCancel }) {
  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '400px' }}>
        <h2 style={{ color: '#FF3399', marginBottom: '20px' }}>Confirm</h2>
        <p style={{ marginBottom: '30px', fontSize: '1.1em' }}>{message}</p>
        <div className="btn-group">
          <button className="btn" onClick={onConfirm}>
            Yes
          </button>
          <button className="btn btn-secondary" onClick={onCancel}>
            No
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmModal;

