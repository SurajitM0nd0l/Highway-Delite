import React from "react";

const Button = ({ text, onClick, type = "button" }) => {
  return (
    <button
      type={type}
      onClick={onClick}
      className="w-full p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
    >
      {text}
    </button>
  );
};

export default Button;
