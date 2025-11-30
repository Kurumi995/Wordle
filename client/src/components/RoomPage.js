import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { roomAPI } from '../api';
import CreateRoomModal from './CreateRoomModal';
import JoinRoomModal from './JoinRoomModal';
import AlertModal from './AlertModal';
import ConfirmModal from './ConfirmModal';

function RoomPage({ currentUser }) {
  const navigate = useNavigate();
  const [rooms, setRooms] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [alertMessage, setAlertMessage] = useState('');
  const [confirmData, setConfirmData] = useState(null);

  useEffect(() => {
    loadRooms();
  }, []);

  const loadRooms = async () => {
    try {
      const data = await roomAPI.getAll();
      setRooms(data);
    } catch (err) {
      console.error('Failed to load rooms:', err);
    }
  };

  const handleCreateRoom = async (roomData) => {
    try {
      await roomAPI.create(roomData);
      setShowCreateModal(false);
      loadRooms();
      setAlertMessage('Room created successfully!');
    } catch (err) {
      setAlertMessage('Failed to create room: ' + err.message);
    }
  };

  const handleDeleteRoom = async (roomId) => {
    setConfirmData({
      message: 'Are you sure you want to delete this room?',
      onConfirm: async () => {
        try {
          await roomAPI.delete(roomId);
          loadRooms();
          setAlertMessage('Room deleted successfully!');
        } catch (err) {
          setAlertMessage('Failed to delete room: ' + err.message);
        }
        setConfirmData(null);
      }
    });
  };

  const handleJoinRoom = (room) => {
    if (room.isPublic) {
      navigate('/game', { state: { room } });
    } else {
      setSelectedRoom(room);
    }
  };

  return (
    <div>
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2>Game Rooms</h2>
          <button className="btn" onClick={() => setShowCreateModal(true)}>
            + Create Room
          </button>
        </div>
      </div>

      <div className="room-list">
        {rooms.map((room) => (
          <div key={room.id} className="room-card" style={{ position: 'relative' }}>
            {!room.isPublic && (
              <div className="room-lock">
                🔒
              </div>
            )}
            <h3>Room {room.id.substring(0, 8)}</h3>
            <p style={{ color: '#666', marginBottom: '10px' }}>
              Creator: {room.creatorId.substring(0, 8)}
            </p>
            
            <div className="btn-group">
              <button 
                className="btn btn-secondary" 
                onClick={() => handleJoinRoom(room)}
              >
                Join
              </button>
              
              {room.creatorId === currentUser.id && (
                <button 
                  className="btn"
                  onClick={() => handleDeleteRoom(room.id)}
                >
                  Delete
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {rooms.length === 0 && (
        <div className="card" style={{ textAlign: 'center', color: '#666' }}>
          <p>No rooms available. Create one to get started!</p>
        </div>
      )}

      {showCreateModal && (
        <CreateRoomModal
          onClose={() => setShowCreateModal(false)}
          onCreate={handleCreateRoom}
        />
      )}

      {selectedRoom && (
        <JoinRoomModal
          room={selectedRoom}
          onClose={() => setSelectedRoom(null)}
          onJoin={() => {
            navigate('/game', { state: { room: selectedRoom } });
          }}
        />
      )}

      {alertMessage && (
        <AlertModal
          message={alertMessage}
          onClose={() => setAlertMessage('')}
        />
      )}

      {confirmData && (
        <ConfirmModal
          message={confirmData.message}
          onConfirm={confirmData.onConfirm}
          onCancel={() => setConfirmData(null)}
        />
      )}
    </div>
  );
}

export default RoomPage;

