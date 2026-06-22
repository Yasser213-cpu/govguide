const ChatMessage = ({ message }) => {
  const isUser = message.sender === "user";

  return (
    <div
      className={`flex ${
        isUser ? "justify-end" : "justify-start"
      } mb-4`}
    >
      <div
        className={`max-w-[75%] rounded-xl px-4 py-3 whitespace-pre-line
        ${
          isUser
            ? "bg-blue-600 text-white"
            : "bg-gray-100 text-gray-800"
        }`}
      >
        {message.text}
      </div>
    </div>
  );
};

export default ChatMessage;