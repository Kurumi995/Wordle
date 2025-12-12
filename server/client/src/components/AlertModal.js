import React from 'react';

function AlertModal({ message, onClose }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '400px' }}>
        <h2 style={{ color: '#FF3399', marginBottom: '20px' }}>Notice</h2>
        <p style={{ marginBottom: '30px', fontSize: '1.1em' }}>{message}</p>
        <button className="btn" onClick={onClose} style={{ width: '100%' }}>
          OK
        </button>
      </div>
    </div>
  );
}

export default AlertModal;

