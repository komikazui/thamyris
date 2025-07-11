import React, { useCallback, useEffect, useState } from "react";
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

type TrophyType = "main" | "sub1" | "sub2";
type TrophyState = Record<TrophyType, number>;

const TROPHY_TYPES: TrophyType[] = ["main", "sub1", "sub2"];

const isImage = (type: number) =>
    ![TrophyRareType.Kop, TrophyRareType.Kop2, TrophyRareType.Lamp, TrophyRareType.Lamp2, TrophyRareType.Lamp3].includes(type);

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

    const [selectedTrophies, setSelectedTrophies] = useState<TrophyState>({
        main: 0,
        sub1: 0,
        sub2: 0,
    });

    useEffect(() => {
        if (!currentTrophy || !unlockedTrophies) return;
        setSelectedTrophies({
            main: currentTrophy.trophyId || 0,
            sub1: currentTrophy.trophyIdSub1 || 0,
            sub2: currentTrophy.trophyIdSub2 || 0,
        });
    }, [currentTrophy, unlockedTrophies]);

    const trophyDisplayInfo = TROPHY_TYPES.map((type, idx) => {
        if (!isVerseOrAbove && type !== "main") return null;
        const trophy = unlockedTrophies?.find((t) => t.trophyId === selectedTrophies[type]);
        return {
            background:
                trophy
                    ? getHonorBackground(trophy)
                    : honorBackgrounds[isVerseOrAbove ? TrophyRareType.Staff : TrophyRareType.Normal],
            name: trophy?.name || "",
            rareType: trophy?.rareType || 0,
        };
    }).filter(Boolean);

    const handleTrophySelect = useCallback(
        (type: TrophyType, trophyId: number) => {
            if (!isVerseOrAbove && type !== "main") {
                toast.error("Sub trophies are only available in VERSE");
                return;
            }
            setSelectedTrophies((prev) => ({ ...prev, [type]: trophyId }));
        },
        [isVerseOrAbove]
    );

    const hasChanges = useCallback(() => {
        if (!isVerseOrAbove) {
            return selectedTrophies.main !== currentTrophy?.trophyId;
        }
        return (
            selectedTrophies.main !== currentTrophy?.trophyId ||
            selectedTrophies.sub1 !== currentTrophy?.trophyIdSub1 ||
            selectedTrophies.sub2 !== currentTrophy?.trophyIdSub2
        );
    }, [isVerseOrAbove, selectedTrophies, currentTrophy]);

    const handleSubmit = useCallback(() => {
        const updates: {
            mainTrophyId?: number;
            subTrophy1Id?: number;
            subTrophy2Id?: number;
        } = {
            mainTrophyId: selectedTrophies.main,
        };
        if (isVerseOrAbove) {
            if (selectedTrophies.sub1 !== currentTrophy?.trophyIdSub1) {
                updates.subTrophy1Id = selectedTrophies.sub1 || undefined;
            }
            if (selectedTrophies.sub2 !== currentTrophy?.trophyIdSub2) {
                updates.subTrophy2Id = selectedTrophies.sub2 || undefined;
            }
        }
        updateTrophy(updates, {
            onSuccess: () => toast.success("Trophy updated successfully!"),
            onError: (error) =>
                toast.error(error instanceof Error ? error.message : "Failed to update trophy"),
        });
    }, [selectedTrophies, isVerseOrAbove, currentTrophy, updateTrophy]);

    return (
        <div className="flex w-full flex-col justify-center gap-4 px-4 pt-4 pb-4 md:flex-row md:gap-8 md:pt-15">
            <div className="relative flex-col items-center justify-center md:w-[300px]">
                {trophyDisplayInfo.map((info, idx) =>
                    info ? (
                        <TrophyBackgroundDisplay
                            key={idx}
                            background={info.background}
                            name={info.name}
                            rareType={info.rareType}
                        />
                    ) : null
                )}
            </div>
            <div className="bg-card w-full rounded-md p-4 md:w-[400px] md:p-6">
                <h2 className="text-primary mb-4 text-xl font-semibold">Trophy Settings</h2>
                <TrophyDropdown
                    type="main"
                    selectedTrophies={selectedTrophies}
                    unlockedTrophies={unlockedTrophies}
                    handleTrophySelect={handleTrophySelect}
                />
                {isVerseOrAbove && (
                    <>
                        <TrophyDropdown
                            type="sub1"
                            selectedTrophies={selectedTrophies}
                            unlockedTrophies={unlockedTrophies}
                            handleTrophySelect={handleTrophySelect}
                        />
                        <TrophyDropdown
                            type="sub2"
                            selectedTrophies={selectedTrophies}
                            unlockedTrophies={unlockedTrophies}
                            handleTrophySelect={handleTrophySelect}
                        />
                    </>
                )}
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