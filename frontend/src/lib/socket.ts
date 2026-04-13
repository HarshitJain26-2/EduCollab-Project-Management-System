import { io } from 'socket.io-client';

const socket = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://127.0.0.1:5000', {
    autoConnect: false,
    withCredentials: true,
});

export default socket;
