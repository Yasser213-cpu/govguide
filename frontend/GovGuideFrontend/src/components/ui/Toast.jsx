import { useEffect } from "react";
import { FiCheckCircle, FiAlertCircle } from "react-icons/fi";

export default function Toast({ show, message, type = "success", onClose }) {
  useEffect(() => {
    if (!show) return;

    const timer = setTimeout(() => {
      onClose();
    }, 3000);

    return () => clearTimeout(timer);
  }, [show, onClose]);

  if (!show) return null;

  return (
    <div
      className="
        fixed
        top-6
        right-6
        z-50
        animate-in
        slide-in-from-right
        duration-300
      "
    >
      <div
        className={`
          flex
          items-center
          gap-3
          rounded-xl
          border
          px-5
          py-4
          shadow-xl
          backdrop-blur-md
          ${
            type === "success"
              ? "border-green-500 bg-green-600 text-white"
              : "border-red-500 bg-red-600 text-white"
          }
        `}
      >
        {type === "success" ? (
          <FiCheckCircle size={22} />
        ) : (
          <FiAlertCircle size={22} />
        )}

        <span className="font-medium">{message}</span>
      </div>
    </div>
  );
}
