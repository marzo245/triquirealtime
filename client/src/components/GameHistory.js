import React from 'react';
import './GameHistory.css';

const GameHistory = ({ history, onGoToHistory, currentHistoryIndex }) => {
  const formatMove = (historyItem, index) => {
    if (index === 0) {
      return 'Inicio del juego';
    }
    
    const { move } = historyItem;
    if (!move) return `Movimiento ${index}`;
    
    const row = Math.floor(move.position / 3) + 1;
    const col = (move.position % 3) + 1;
    
    return `${move.playerName} (${move.player}) → Fila ${row}, Col ${col}`;
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('es-ES', { 
      hour: '2-digit', 
      minute: '2-digit',
      second: '2-digit'
    });
  };

  return (
    <div className="game-history">
      <h3>Historial del Juego</h3>
      <div className="history-list">
        {history.map((historyItem, index) => (
          <div
            key={index}
            className={`history-item ${index === currentHistoryIndex ? 'current' : ''}`}
            onClick={() => onGoToHistory(index)}
          >
            <div className="move-info">
              <span className="move-description">
                {formatMove(historyItem, index)}
              </span>
              <span className="move-time">
                {formatTime(historyItem.timestamp)}
              </span>
            </div>
            
            {index === currentHistoryIndex && (
              <div className="current-indicator">●</div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default GameHistory;
