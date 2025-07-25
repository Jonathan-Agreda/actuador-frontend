import { io, Socket } from "socket.io-client";

const socket: Socket = io(process.env.NEXT_PUBLIC_API_WS_URL, {
  transports: ["websocket"], // asegura usar WebSocket
});

export default socket;
