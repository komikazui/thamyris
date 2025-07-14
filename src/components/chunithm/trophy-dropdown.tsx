import React, { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown } from "lucide-react";

interface Trophy {
  id: number;
  version: number;
  trophyId: number;
  name: string;
  explainText: string;
  rareType: number;
  imagePath: string | null;
}

export interface TrophyDropdownProps {
  selectedTrophies: { main: number; sub1: number; sub2: number };
  unlockedTrophies: Trophy[] | undefined;
  onSelect: (id: number) => void;
  slot: "main" | "sub1" | "sub2";
}

const TrophyDropdown: React.FC<TrophyDropdownProps> = ({
  selectedTrophies,
  unlockedTrophies,
  onSelect,
  slot,
}) => {
  const [open, setOpen] = useState(false);

  const handleDropdownToggle = () => {
    setOpen((prev) => !prev);
  };

  const getSelectedLabel = () => {
    const trophyId = selectedTrophies[slot];
    if (trophyId === 0 && unlockedTrophies && unlockedTrophies.length > 0) {
      return unlockedTrophies[0].name;
    }
    const trophy = unlockedTrophies?.find((t) => t.trophyId === trophyId);
    if (trophy) {
      return trophy.name;
    }
    return "Select Trophy";
  };

  const renderTrophyOption = (trophy: Trophy) => {
    const isCurrentSelection = trophy.trophyId === selectedTrophies[slot];
    return (
      <div
        key={trophy.id}
        onClick={() => {
          if (!isCurrentSelection) onSelect(trophy.trophyId);
        }}
        className={`relative cursor-pointer rounded-md p-2 transition-colors ${
          isCurrentSelection
            ? "text-primary bg-dropdownhover hover:cursor-not-allowed"
            : "bg-dropdown hover:bg-dropdownhover cursor-pointer"
        }`}
      >
        <span className="text-primary block w-full truncate">
          {trophy.name}
          {isCurrentSelection && " (Current)"}
        </span>
      </div>
    );
  };

  return (
    <div className="mb-4">
      <button
        onClick={handleDropdownToggle}
        className="bg-dropdown hover:bg-dropdownhover flex w-full items-center justify-between rounded-md p-3"
      >
        <span className="text-primary truncate">{getSelectedLabel()}</span>
        <ChevronDown
          className={`text-primary h-5 w-5 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto", maxHeight: "285px" }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-2 overflow-hidden"
          >
            <div className="max-h-[285px] max-w-[400px] space-y-2 overflow-y-auto pr-2">
              {unlockedTrophies?.map((trophy) => renderTrophyOption(trophy))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TrophyDropdown;
