// src/components/LoadingSpinner.jsx
import React from "react";
import { motion } from "framer-motion";

const spinTransition = {
  loop: Infinity,
  ease: "linear",
  duration: 1,
};

/**
 * LoadingSpinner component
 * @param {Object} props - Component props
 * @param {string} [props.size='md'] - Size of the spinner (sm, md, lg)
 * @param {string} [props.color='indigo'] - Color of the spinner (indigo, blue, green, red)
 * @param {string} [props.text] - Optional loading text to display
 * @param {boolean} [props.fullPage=false] - Whether to center in the full page
 */
const LoadingSpinner = ({
  size = "md",
  color = "indigo",
  text,
  fullPage = false,
}) => {
  // Determine size in pixels
  const sizes = {
    sm: 24,
    md: 36,
    lg: 48,
  };

  const spinnerSize = sizes[size] || sizes.md;

  // Determine color for the spinner
  const colors = {
    indigo: "border-indigo-500",
    blue: "border-blue-500",
    green: "border-green-500",
    red: "border-red-500",
  };

  const spinnerColor = colors[color] || colors.indigo;

  // Spinner component
  const Spinner = () => (
    <div className="relative">
      <div
        className={`rounded-full border-2 border-gray-700 h-${size} w-${size}`}
        style={{
          width: spinnerSize,
          height: spinnerSize,
        }}
      ></div>
      <motion.div
        className={`absolute top-0 left-0 rounded-full border-t-2 border-r-2 ${spinnerColor} h-${size} w-${size}`}
        style={{
          width: spinnerSize,
          height: spinnerSize,
        }}
        animate={{ rotate: 360 }}
        transition={spinTransition}
      ></motion.div>
    </div>
  );

  // If it's a full page spinner
  if (fullPage) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50 z-50">
        <div className="flex flex-col items-center p-4 rounded-lg bg-gray-800 shadow-lg">
          <Spinner />
          {text && (
            <p className="mt-3 text-gray-300 text-sm font-medium">{text}</p>
          )}
        </div>
      </div>
    );
  }

  // Regular inline spinner
  return (
    <div className="flex items-center justify-center">
      <div className="flex items-center space-x-3">
        <Spinner />
        {text && <p className="text-gray-400">{text}</p>}
      </div>
    </div>
  );
};

export default LoadingSpinner;
