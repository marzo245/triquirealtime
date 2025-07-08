import React from 'react';
import './Board.css';

const Board = ({ board, onCellClick, currentPlayer, gameOver, winner, isMyTurn }) => {
  const renderCell = (index) => {
    const cellValue = board[index];
    const isEmpty = cellValue === null;
    
    return (
      <button
        key={index}
        className={`cell ${cellValue ? cellValue.toLowerCase() : ''} ${
          isEmpty && isMyTurn && !gameOver ? 'clickable' : ''
        }`}
        onClick={() => isEmpty && isMyTurn && !gameOver && onCellClick(index)}
        disabled={!isEmpty || !isMyTurn || gameOver}
      >
        {cellValue}
      </button>
    );
  };

  const getGameStatus = () => {
    if (gameOver) {
      if (winner === 'draw') {
        return '¡Empate!';
      }
      return `¡Jugador ${winner} gana!`;
    }
    
    if (isMyTurn) {
      return 'Tu turno';
    }
    
    return `Turno del jugador ${currentPlayer}`;
  };

  return (
    <div className="board-container">
      <div className="game-status">
        <h2>{getGameStatus()}</h2>
      </div>
      
      <div className="board">
        {board.map((_, index) => renderCell(index))}
      </div>
      
      <div className="turn-indicator">
        <span className={`player-indicator ${currentPlayer === 'X' ? 'active' : ''}`}>
          Jugador X
        </span>
        <span className={`player-indicator ${currentPlayer === 'O' ? 'active' : ''}`}>
          Jugador O
        </span>
      </div>
    </div>
  );
};

export default Board;
