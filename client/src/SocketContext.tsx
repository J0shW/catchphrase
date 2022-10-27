import { createContext } from "react";
import io from "socket.io-client";

console.log('url', process.env.REACT_APP_SERVER_URL);
export const socket = io(process.env.REACT_APP_SERVER_URL || "");
export const SocketContext = createContext(socket);