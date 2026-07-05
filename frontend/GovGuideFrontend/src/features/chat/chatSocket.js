let socket = null;

/**
 * Connect to chat websocket
 */
export const connectChat = (conversationId, onMessage) => {
  const token = sessionStorage.getItem("access");

  socket = new WebSocket(
    `ws://localhost:8000/ws/chat/${conversationId}/?token=${token}`,
  );

  socket.onopen = () => {
    console.log("✅ Chat Connected");
  };

  socket.onmessage = (event) => {
    const data = JSON.parse(event.data);

    if (onMessage) {
      onMessage(data);
    }
  };

  socket.onerror = (error) => {
    console.error("❌ WebSocket Error:", error);
  };

  socket.onclose = () => {
    console.log("🔌 Chat Disconnected");
  };

  return socket;
};

/**
 * Send message
 */
export const sendMessage = (message) => {
  if (!socket || socket.readyState !== WebSocket.OPEN) {
    console.error("Socket is not connected");
    return;
  }

  socket.send(
    JSON.stringify({
      message,
    }),
  );
};

/**
 * Disconnect
 */
export const disconnectChat = () => {
  if (socket) {
    socket.close();
    socket = null;
  }
};
