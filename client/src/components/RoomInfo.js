import React from 'react';
import './RoomInfo.css';

const RoomInfo = ({ room, currentPlayerId, onRestartGame, onLeaveRoom }) => {
  const currentPlayer = room?.players?.find(p => p.id === currentPlayerId);
  const otherPlayer = room?.players?.find(p => p.id !== currentPlayerId);

  const copyRoomCode = () => {
    navigator.clipboard.writeText(room.code);
    // Podrías agregar una notificación aquí
  };

  return (
    <div className="room-info">
      <div className="room-header">
        <h2>Sala: {room.code}</h2>
        <button 
          className="copy-button"
          onClick={copyRoomCode}
          title="Copiar código de sala"
        >
          📋
        </button>
      </div>

      <div className="players-info">
        <h3>Jugadores</h3>
        <div className="players-list">
          {room.players.map((player, index) => (
            <div 
              key={player.id} 
              className={`player-card ${player.id === currentPlayerId ? 'current-player' : ''}`}
            >
              <div className="player-symbol">{player.symbol}</div>
              <div className="player-details">
                <span className="player-name">{player.name}</span>
                {player.id === currentPlayerId && (
                  <span className="player-tag">(Tú)</span>
                )}
              </div>
            </div>
          ))}
        </div>

        {room.players.length < 2 && (
          <div className="waiting-message">
            <p>Esperando al segundo jugador...</p>
            <p>Comparte el código: <strong>{room.code}</strong></p>
          </div>
        )}
      </div>

      <div className="room-actions">
        {room.gameState.gameOver && (
          <button 
            className="restart-button"
            onClick={onRestartGame}
          >
            Nuevo Juego
          </button>
        )}
        
        <button 
          className="leave-button"
          onClick={onLeaveRoom}
        >
          Salir de la Sala
        </button>
      </div>
    </div>
  );
};

export default RoomInfo;
