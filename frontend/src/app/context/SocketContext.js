"use client";
import { createContext, useEffect, useState, useContext, useRef } from "react";
import { AuthContext } from "./AuthContext";
import { connectSocket, disconnectSocket } from "../utils/Socket";

export const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const { UserAuthData } = useContext(AuthContext);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const socketRef = useRef(null);

  useEffect(() => {
    if (!UserAuthData?.userId) return;

    const socket = connectSocket(UserAuthData.userId);
    socketRef.current = socket;

    socket.on("getOnlineUsers", (users) => {
      setOnlineUsers(users);
    });

    return () => {
      socket.off("getOnlineUsers");
      disconnectSocket();
    };
  }, [UserAuthData?.userId]);

  return (
    <SocketContext.Provider value={{ onlineUsers, socket: socketRef.current }}>
      {children}
    </SocketContext.Provider>
  );
};
