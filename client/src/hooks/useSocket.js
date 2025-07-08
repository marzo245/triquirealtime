import { useEffect, useState } from 'react';
import io from 'socket.io-client';

const useSocket = () => {
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const socketIO = io(
      process.env.NODE_ENV === 'production' 
        ? window.location.origin 
        : 'http://localhost:5000'
    );

    socketIO.on('connect', () => {
      console.log('Conectado al servidor');
      setConnected(true);
    });

    socketIO.on('disconnect', () => {
      console.log('Desconectado del servidor');
      setConnected(false);
    });

    setSocket(socketIO);

    return () => {
      socketIO.disconnect();
    };
  }, []);

  return { socket, connected };
};

export default useSocket;
