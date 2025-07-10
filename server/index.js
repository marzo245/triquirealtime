const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });

const app = express();
const server = http.createServer(app);

// Configuración de CORS para Socket.IO
const io = socketIo(server, {
  cors: {
    origin: process.env.NODE_ENV === 'production' 
      ? false 
      : ["http://localhost:3000"],
    methods: ["GET", "POST"]
  }
});

// Middlewares
app.use(cors());
app.use(express.json());

// Conectar a MongoDB
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/triqui-realtime';
console.log('MONGODB_URI usado:', MONGODB_URI); // <-- Línea de depuración
mongoose.connect(MONGODB_URI)
  .then(() => console.log('Conectado a MongoDB'))
  .catch(err => console.error('Error conectando a MongoDB:', err));

// Importar modelos
const Room = require('./models/Room');

// Almacenar las salas activas en memoria
const activeRooms = new Map();

// Manejar conexiones de Socket.IO
io.on('connection', (socket) => {
  console.log('Usuario conectado:', socket.id);

  // Crear una nueva sala
  socket.on('create-room', async (playerName) => {
    try {
      const roomCode = Math.random().toString(36).substring(2, 8).toUpperCase();
      
      // Crear sala en la base de datos
      const newRoom = new Room({
        code: roomCode,
        players: [{
          id: socket.id,
          name: playerName,
          symbol: 'X'
        }],
        gameState: {
          board: Array(9).fill(null),
          currentPlayer: 'X',
          winner: null,
          gameOver: false
        },
        history: [{
          board: Array(9).fill(null),
          currentPlayer: 'X',
          move: null,
          timestamp: new Date()
        }]
      });

      await newRoom.save();

      // Almacenar en memoria para acceso rápido
      activeRooms.set(roomCode, {
        ...newRoom.toObject(),
        sockets: [socket.id]
      });

      socket.join(roomCode);
      socket.emit('room-created', { roomCode, room: newRoom });
      
      console.log(`Sala creada: ${roomCode} por ${playerName}`);
    } catch (error) {
      console.error('Error creando sala:', error);
      socket.emit('error', 'Error creando la sala');
    }
  });

  // Unirse a una sala existente
  socket.on('join-room', async (data) => {
    try {
      const { roomCode, playerName } = data;
      
      // Buscar sala en base de datos
      let room = await Room.findOne({ code: roomCode });
      
      if (!room) {
        socket.emit('error', 'Sala no encontrada');
        return;
      }

      if (room.players.length >= 2) {
        socket.emit('error', 'La sala está llena');
        return;
      }

      // Agregar jugador a la sala
      const playerSymbol = room.players.length === 1 ? 'O' : 'X';
      room.players.push({
        id: socket.id,
        name: playerName,
        symbol: playerSymbol
      });

      await room.save();

      // Actualizar sala activa
      if (activeRooms.has(roomCode)) {
        const activeRoom = activeRooms.get(roomCode);
        activeRoom.players = room.players;
        activeRoom.sockets.push(socket.id);
      } else {
        activeRooms.set(roomCode, {
          ...room.toObject(),
          sockets: [socket.id]
        });
      }

      socket.join(roomCode);
      
      // Notificar a todos en la sala
      io.to(roomCode).emit('player-joined', { room });
      
      if (room.players.length === 2) {
        io.to(roomCode).emit('game-ready');
      }

      console.log(`${playerName} se unió a la sala: ${roomCode}`);
    } catch (error) {
      console.error('Error uniéndose a sala:', error);
      socket.emit('error', 'Error uniéndose a la sala');
    }
  });

  // Realizar movimiento
  socket.on('make-move', async (data) => {
    try {
      const { roomCode, position } = data;
      
      const room = await Room.findOne({ code: roomCode });
      if (!room) {
        socket.emit('error', 'Sala no encontrada');
        return;
      }

      // Verificar si es el turno del jugador
      const player = room.players.find(p => p.id === socket.id);
      if (!player || player.symbol !== room.gameState.currentPlayer) {
        socket.emit('error', 'No es tu turno');
        return;
      }

      // Verificar si la posición está vacía
      if (room.gameState.board[position] !== null) {
        socket.emit('error', 'Posición ocupada');
        return;
      }

      // Realizar el movimiento
      room.gameState.board[position] = player.symbol;
      
      // Verificar si hay ganador
      const winner = checkWinner(room.gameState.board);
      if (winner) {
        room.gameState.winner = winner;
        room.gameState.gameOver = true;
      } else if (room.gameState.board.every(cell => cell !== null)) {
        room.gameState.gameOver = true;
        room.gameState.winner = 'draw';
      } else {
        // Cambiar turno
        room.gameState.currentPlayer = player.symbol === 'X' ? 'O' : 'X';
      }

      // Agregar al historial
      room.history.push({
        board: [...room.gameState.board],
        currentPlayer: room.gameState.currentPlayer,
        move: {
          position,
          player: player.symbol,
          playerName: player.name
        },
        timestamp: new Date()
      });

      await room.save();

      // Actualizar sala activa
      if (activeRooms.has(roomCode)) {
        const activeRoom = activeRooms.get(roomCode);
        activeRoom.gameState = room.gameState;
        activeRoom.history = room.history;
      }

      // Notificar a todos en la sala
      io.to(roomCode).emit('game-updated', { room });

    } catch (error) {
      console.error('Error realizando movimiento:', error);
      socket.emit('error', 'Error realizando movimiento');
    }
  });

  // Retroceder en el historial
  socket.on('go-to-history', async (data) => {
    try {
      const { roomCode, historyIndex } = data;
      
      const room = await Room.findOne({ code: roomCode });
      if (!room) {
        socket.emit('error', 'Sala no encontrada');
        return;
      }

      if (historyIndex < 0 || historyIndex >= room.history.length) {
        socket.emit('error', 'Índice de historial inválido');
        return;
      }

      const historyState = room.history[historyIndex];
      
      // Restaurar estado del juego
      room.gameState = {
        board: [...historyState.board],
        currentPlayer: historyState.currentPlayer,
        winner: null,
        gameOver: false
      };

      // Truncar historial hasta el punto seleccionado
      room.history = room.history.slice(0, historyIndex + 1);

      await room.save();

      // Actualizar sala activa
      if (activeRooms.has(roomCode)) {
        const activeRoom = activeRooms.get(roomCode);
        activeRoom.gameState = room.gameState;
        activeRoom.history = room.history;
      }

      // Notificar a todos en la sala
      io.to(roomCode).emit('game-updated', { room });

    } catch (error) {
      console.error('Error retrocediendo en historial:', error);
      socket.emit('error', 'Error retrocediendo en historial');
    }
  });

  // Reiniciar juego
  socket.on('restart-game', async (roomCode) => {
    try {
      const room = await Room.findOne({ code: roomCode });
      if (!room) {
        socket.emit('error', 'Sala no encontrada');
        return;
      }

      // Reiniciar estado del juego
      room.gameState = {
        board: Array(9).fill(null),
        currentPlayer: 'X',
        winner: null,
        gameOver: false
      };

      // Agregar estado inicial al historial
      room.history.push({
        board: Array(9).fill(null),
        currentPlayer: 'X',
        move: null,
        timestamp: new Date()
      });

      await room.save();

      // Actualizar sala activa
      if (activeRooms.has(roomCode)) {
        const activeRoom = activeRooms.get(roomCode);
        activeRoom.gameState = room.gameState;
        activeRoom.history = room.history;
      }

      // Notificar a todos en la sala
      io.to(roomCode).emit('game-updated', { room });

    } catch (error) {
      console.error('Error reiniciando juego:', error);
      socket.emit('error', 'Error reiniciando juego');
    }
  });

  // Manejar desconexión
  socket.on('disconnect', () => {
    console.log('Usuario desconectado:', socket.id);
    
    // Remover de salas activas
    for (const [roomCode, room] of activeRooms.entries()) {
      const socketIndex = room.sockets.indexOf(socket.id);
      if (socketIndex !== -1) {
        room.sockets.splice(socketIndex, 1);
        
        // Si no quedan sockets, remover la sala de memoria
        if (room.sockets.length === 0) {
          activeRooms.delete(roomCode);
        }
        
        // Notificar a otros jugadores
        socket.to(roomCode).emit('player-disconnected');
        break;
      }
    }
  });
});

// Función para verificar ganador
function checkWinner(board) {
  const winningCombinations = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // Filas
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columnas
    [0, 4, 8], [2, 4, 6] // Diagonales
  ];

  for (const combination of winningCombinations) {
    const [a, b, c] = combination;
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return board[a];
    }
  }

  return null;
}

// Servir archivos estáticos en producción
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/build')));
  
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/build', 'index.html'));
  });
}

// Ruta de salud para Heroku
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});
