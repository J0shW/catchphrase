import { createContext } from "react";
import io from "socket.io-client";

// export const socket = io("http://localhost:3001");
export const socket = io("https://catchphrase-app-797gz.ondigitalocean.app");
export const SocketContext = createContext(socket);