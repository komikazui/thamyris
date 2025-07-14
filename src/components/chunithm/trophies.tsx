import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  useChunithmVersion,
  useCurrentTrophy,
  useUnlockedTrophies,
  useUpdateTrophy,
} from "@/hooks/chunithm";
import { useHonorBackground } from "@/hooks/chunithm/use-trophies";
import { honorBackgrounds } from "@/lib/constants";
import { TrophyRareType } from "@/lib/enums";
import { SubmitButton } from "../common/button";
import TrophyDropdown from "./trophy-dropdown";

enum TrophySlot {
  Main = 0,
  Sub1 = 1,
  Sub2 = 2,
}

const isImage = (type: number) =>
  ![
    TrophyRareType.Kop,
    TrophyRareType.Kop2,
    TrophyRareType.Lamp,
    TrophyRareType.Lamp2,
    TrophyRareType.Lamp3,
  ].includes(type);

const TrophyBackgroundDisplay: React.FC<{
  background: string;
  name: string;
  rareType: number;
}> = ({ background, name, rareType }) => (
  <div className="relative flex h-[40px] w-full items-center justify-center">
    {background && (
      <div className="absolute inset-0 h-full w-full">
        <img className="w-full object-cover" src={background} />
        {name && isImage(rareType) && (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="mr-2 mb-2 ml-2 max-w-[300px] truncate text-center text-sm font-bold text-black">
              {name}
            </span>
          </div>
        )}
      </div>
    )}
  </div>
);

export const TrophySelector = () => {
  const version = useChunithmVersion();
  const { data: currentTrophyData } = useCurrentTrophy();
  const currentTrophy = currentTrophyData?.[0];
  const { data: unlockedTrophies } = useUnlockedTrophies();
  const { mutate: updateTrophy, isPending } = useUpdateTrophy();
  const getHonorBackground = useHonorBackground();

  const isVerseOrAbove = (version || 0) >= 17;
  const [selected, setSelected] = useState<{
    main: number;
    sub1: number;
    sub2: number;
  }>({
    main: 0,
    sub1: 0,
    sub2: 0,
  });

  useEffect(() => {
    if (!currentTrophy) return;
    setSelected({
      main: currentTrophy.trophyId || 0,
      sub1: currentTrophy.trophyIdSub1 || 0,
      sub2: currentTrophy.trophyIdSub2 || 0,
    });
  }, [currentTrophy]);

  const handleSelect = (slot: TrophySlot, trophyId: number) => {
    if (!isVerseOrAbove && slot !== TrophySlot.Main) {
      toast.error("Sub trophies are only available in VERSE");
      return;
    }
    setSelected((prev) => {
      if (slot === TrophySlot.Main) return { ...prev, main: trophyId };
      if (slot === TrophySlot.Sub1) return { ...prev, sub1: trophyId };
      if (slot === TrophySlot.Sub2) return { ...prev, sub2: trophyId };
      return prev;
    });
  };

  const hasChanges = () => {
    if (!currentTrophy) return false;
    if (!isVerseOrAbove) return selected.main !== currentTrophy.trophyId;
    return (
      selected.main !== currentTrophy.trophyId ||
      selected.sub1 !== currentTrophy.trophyIdSub1 ||
      selected.sub2 !== currentTrophy.trophyIdSub2
    );
  };

  const handleSubmit = () => {
    const updates: any = { mainTrophyId: selected.main };
    if (isVerseOrAbove) {
      updates.subTrophy1Id = selected.sub1;
      updates.subTrophy2Id = selected.sub2;
    }
    updateTrophy(updates, {
      onSuccess: () => toast.success("Trophy updated!"),
      onError: (e) =>
        toast.error(e instanceof Error ? e.message : "Failed to update trophy"),
    });
  };

  const slots = isVerseOrAbove
    ? [TrophySlot.Main, TrophySlot.Sub1, TrophySlot.Sub2]
    : [TrophySlot.Main];

  return (
    <div className="flex w-full flex-col justify-center gap-4 px-4 pt-4 pb-4 md:flex-row md:gap-8 md:pt-15">
      <div className="relative flex-col items-center justify-center md:w-[300px]">
        {slots.map((slot) => {
          const trophyId =
            slot === TrophySlot.Main
              ? selected.main
              : slot === TrophySlot.Sub1
                ? selected.sub1
                : selected.sub2;
          const trophy = unlockedTrophies?.find((t) => t.trophyId === trophyId);
          return (
            <TrophyBackgroundDisplay
              key={slot}
              background={
                trophy
                  ? getHonorBackground(trophy)
                  : honorBackgrounds[
                      isVerseOrAbove
                        ? TrophyRareType.Staff
                        : TrophyRareType.Normal
                    ]
              }
              name={trophy?.name || ""}
              rareType={trophy?.rareType || 0}
            />
          );
        })}
      </div>
      <div className="bg-card w-full rounded-md p-4 md:w-[400px] md:p-6">
        <h2 className="text-primary mb-4 text-xl font-semibold">
          Trophy Settings
        </h2>
        {slots.map((slot) => (
          <TrophyDropdown
            key={slot}
            slot={
              slot === TrophySlot.Main
                ? "main"
                : slot === TrophySlot.Sub1
                  ? "sub1"
                  : "sub2"
            }
            selectedTrophies={selected}
            unlockedTrophies={unlockedTrophies}
            onSelect={(id: number) => handleSelect(slot, id)}
          />
        ))}
        <SubmitButton
          onClick={handleSubmit}
          defaultLabel="Update trophy"
          updatingLabel="Updating..."
          disabled={isPending || !hasChanges()}
        />
      </div>
    </div>
  );
};

export default TrophySelector;
