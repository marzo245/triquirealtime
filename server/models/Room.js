const mongoose = require('mongoose');

const playerSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  symbol: {
    type: String,
    enum: ['X', 'O'],
    required: true
  }
});

const gameStateSchema = new mongoose.Schema({
  board: {
    type: [String],
    default: Array(9).fill(null)
  },
  currentPlayer: {
    type: String,
    enum: ['X', 'O'],
    default: 'X'
  },
  winner: {
    type: String,
    enum: ['X', 'O', 'draw', null],
    default: null
  },
  gameOver: {
    type: Boolean,
    default: false
  }
});

const historySchema = new mongoose.Schema({
  board: {
    type: [String],
    required: true
  },
  currentPlayer: {
    type: String,
    enum: ['X', 'O'],
    required: true
  },
  move: {
    position: Number,
    player: String,
    playerName: String
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

const roomSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    unique: true,
    uppercase: true
  },
  players: [playerSchema],
  gameState: {
    type: gameStateSchema,
    default: () => ({
      board: Array(9).fill(null),
      currentPlayer: 'X',
      winner: null,
      gameOver: false
    })
  },
  history: [historySchema],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Middleware para actualizar updatedAt en cada save
roomSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Índice para expiración automática (opcional: salas se eliminan después de 24 horas de inactividad)
roomSchema.index({ "updatedAt": 1 }, { expireAfterSeconds: 86400 });

module.exports = mongoose.model('Room', roomSchema);
