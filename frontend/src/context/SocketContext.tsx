'use client';
import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

interface SocketContextType {
    socket: Socket | null;
    isConnected: boolean;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export function SocketProvider({ children }: { children: ReactNode }) {
    const { user, token } = useAuth();
    const [socket, setSocket] = useState<Socket | null>(null);
    const [isConnected, setIsConnected] = useState(false);

    useEffect(() => {
        if (!user || !token) {
            if (socket) {
                socket.disconnect();
                setSocket(null);
                setIsConnected(false);
            }
            return;
        }

        const socketUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
        const newSocket = io(socketUrl, {
            auth: { token },
            transports: ['websocket', 'polling']
        });

        newSocket.on('connect', () => {
            setIsConnected(true);
            newSocket.emit('join', user.id);
            console.log('Connected to real-time server');
        });

        newSocket.on('disconnect', () => {
            setIsConnected(false);
            console.log('Disconnected from real-time server');
        });

        // Global Listeners (e.g., instant toast notifications)
        newSocket.on('notification_received', (notification) => {
            toast(notification.message, {
                icon: '🔔',
                duration: 5000,
                id: notification.id // Prevent duplicates if logic triggers twice
            });
            // You can also emit a custom event to update the notification dot globally
            window.dispatchEvent(new CustomEvent('new_notification', { detail: notification }));
        });

        setSocket(newSocket);

        return () => {
            newSocket.disconnect();
        };
    }, [user, token]);

    return (
        <SocketContext.Provider value={{ socket, isConnected }}>
            {children}
        </SocketContext.Provider>
    );
}

export function useSocket() {
    const context = useContext(SocketContext);
    if (!context) throw new Error('useSocket must be used within SocketProvider');
    return context;
}
