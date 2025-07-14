import React from "react";

interface ViewToggleProps {
  viewMode: "table" | "grid";
  onToggle: () => void;
}

const ViewToggle: React.FC<ViewToggleProps> = ({ viewMode, onToggle }) => {
  return (
    <div className="mb-2 flex justify-end px-6">
      <div className="flex items-center space-x-2">
        <span className="text-sm text-gray-300">Table View</span>
        <button
          className={`bg-button relative inline-flex h-6 w-11 items-center rounded-full transition-colors hover:cursor-pointer focus:outline-none`}
          onClick={onToggle}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              viewMode === "table" ? "translate-x-1" : "translate-x-6"
            }`}
          />
        </button>
        <span className="text-sm text-gray-300">Grid View</span>
      </div>
    </div>
  );
};

export default ViewToggle;
