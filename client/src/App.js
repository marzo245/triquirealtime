import React, { useState, useEffect } from 'react';
import useSocket from './hooks/useSocket';
import Board from './components/Board';
import GameHistory from './components/GameHistory';
import RoomInfo from './components/RoomInfo';
import './App.css';

function App() {
  const { socket, connected } = useSocket();
  const [gameState, setGameState] = useState('menu'); // 'menu', 'waiting', 'playing'
  const [playerName, setPlayerName] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [room, setRoom] = useState(null);
  const [error, setError] = useState('');
  const [currentHistoryIndex, setCurrentHistoryIndex] = useState(0);

  useEffect(() => {
    if (!socket) return;

    // Manejar eventos del socket
    socket.on('room-created', (data) => {
      setRoom(data.room);
      setGameState('waiting');
      setError('');
      setCurrentHistoryIndex(data.room.history.length - 1);
    });

    socket.on('player-joined', (data) => {
      setRoom(data.room);
      setError('');
      setCurrentHistoryIndex(data.room.history.length - 1);
    });

    socket.on('game-ready', () => {
      setGameState('playing');
    });

    socket.on('game-updated', (data) => {
      setRoom(data.room);
      setCurrentHistoryIndex(data.room.history.length - 1);
    });

    socket.on('player-disconnected', () => {
      setError('El otro jugador se desconectó');
    });

    socket.on('error', (message) => {
      setError(message);
    });

    return () => {
      socket.off('room-created');
      socket.off('player-joined');
      socket.off('game-ready');
      socket.off('game-updated');
      socket.off('player-disconnected');
      socket.off('error');
    };
  }, [socket]);

  const createRoom = () => {
    if (!playerName.trim()) {
      setError('Por favor ingresa tu nombre');
      return;
    }
    
    socket.emit('create-room', playerName.trim());
  };

  const joinRoom = () => {
    if (!playerName.trim()) {
      setError('Por favor ingresa tu nombre');
      return;
    }
    
    if (!roomCode.trim()) {
      setError('Por favor ingresa el código de la sala');
      return;
    }

    socket.emit('join-room', {
      roomCode: roomCode.trim().toUpperCase(),
      playerName: playerName.trim()
    });
  };

  const makeMove = (position) => {
    if (!room || gameState !== 'playing') return;
    
    socket.emit('make-move', {
      roomCode: room.code,
      position
    });
  };

  const goToHistory = (historyIndex) => {
    if (!room) return;
    
    socket.emit('go-to-history', {
      roomCode: room.code,
      historyIndex
    });
    setCurrentHistoryIndex(historyIndex);
  };

  const restartGame = () => {
    if (!room) return;
    
    socket.emit('restart-game', room.code);
  };

  const leaveRoom = () => {
    setGameState('menu');
    setRoom(null);
    setRoomCode('');
    setError('');
    setCurrentHistoryIndex(0);
  };

  const getCurrentPlayer = () => {
    if (!room || !socket) return null;
    return room.players.find(p => p.id === socket.id);
  };

  const isMyTurn = () => {
    const currentPlayer = getCurrentPlayer();
    if (!currentPlayer || !room) return false;
    return currentPlayer.symbol === room.gameState.currentPlayer;
  };

  if (!connected) {
    return (
      <div className="app">
        <div className="loading-screen">
          <div className="loader"></div>
          <p>Conectando al servidor...</p>
        </div>
      </div>
    );
  }

  if (gameState === 'menu') {
    return (
      <div className="app">
        <div className="menu-screen">
          <div className="menu-container">
            <h1>🎮 Triqui Realtime</h1>
            <p>Tic Tac Toe multijugador en tiempo real</p>
            
            {error && <div className="error-message">{error}</div>}
            
            <div className="input-group">
              <input
                type="text"
                placeholder="Tu nombre"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (roomCode ? joinRoom() : createRoom())}
              />
            </div>

            <div className="menu-actions">
              <button 
                className="primary-button"
                onClick={createRoom}
                disabled={!playerName.trim()}
              >
                Crear Nueva Sala
              </button>

              <div className="join-section">
                <input
                  type="text"
                  placeholder="Código de sala"
                  value={roomCode}
                  onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                  onKeyPress={(e) => e.key === 'Enter' && joinRoom()}
                />
                <button 
                  className="secondary-button"
                  onClick={joinRoom}
                  disabled={!playerName.trim() || !roomCode.trim()}
                >
                  Unirse a Sala
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (gameState === 'waiting' || gameState === 'playing') {
    return (
      <div className="app">
        <div className="game-screen">
          <div className="game-container">
            <div className="game-left">
              <RoomInfo
                room={room}
                currentPlayerId={socket?.id}
                onRestartGame={restartGame}
                onLeaveRoom={leaveRoom}
              />
            </div>

            <div className="game-center">
              <Board
                board={room.gameState.board}
                onCellClick={makeMove}
                currentPlayer={room.gameState.currentPlayer}
                gameOver={room.gameState.gameOver}
                winner={room.gameState.winner}
                isMyTurn={isMyTurn()}
              />
            </div>

            <div className="game-right">
              <GameHistory
                history={room.history}
                onGoToHistory={goToHistory}
                currentHistoryIndex={currentHistoryIndex}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
}

export default App;
