import React, { useCallback, useEffect, useMemo, useState } from "react";

import { toast } from "sonner";

import {
	TrophyItem,
	useCurrentTrophy,
	useEquipTrophy,
	useSearchTrophies,
	useUnlockTrophy,
} from "../../../hooks/chunithm/userbox/trophy";
import { Grid } from "./grid";

const TrophyCustomization: React.FC = () => {
	const [selectedTrophyId, setSelectedTrophyId] = useState<number | null>(null);
	const [originalTrophyId, setOriginalTrophyId] = useState<number | null>(null);

	const { data: currentTrophy } = useCurrentTrophy();
	const { data: searchData, isLoading } = useSearchTrophies({ locked: null });
	const { mutate: equipTrophy } = useEquipTrophy();
	const { mutate: unlockTrophy } = useUnlockTrophy();

	// Track the original trophy when component mounts
	useEffect(() => {
		if (currentTrophy && originalTrophyId === null) {
			setOriginalTrophyId(currentTrophy.id);
			setSelectedTrophyId(currentTrophy.id);
		}
	}, [currentTrophy, originalTrophyId]);

	const handleSelectItem = useCallback((item: TrophyItem) => {
		setSelectedTrophyId(item.id);
	}, []);

	const handleEquipItem = useCallback(
		(item: TrophyItem) => {
			equipTrophy(item.id, {
				onSuccess: () => {
					setOriginalTrophyId(item.id);
				},
				onError: (error) => {
					toast.error("Failed to equip trophy");
					console.error("Error equipping trophy:", error);
				},
			});
		},
		[equipTrophy]
	);

	const handleUnlockItem = useCallback(
		(item: TrophyItem) => {
			unlockTrophy(item.id, {
				onError: (error) => {
					toast.error("Failed to unlock trophy");
					console.error("Error unlocking trophy:", error);
				},
			});
		},
		[unlockTrophy, equipTrophy]
	);

	const hasChanges = useMemo(() => {
		return selectedTrophyId !== originalTrophyId;
	}, [selectedTrophyId, originalTrophyId]);

	const equippedItemIds = originalTrophyId ? new Set([originalTrophyId]) : new Set<number>();

	return (
		<div className="space-y-4">
			<Grid
				items={searchData?.items || []}
				equippedItemIds={equippedItemIds}
				selectedItemId={selectedTrophyId}
				loading={isLoading}
				layout="stacked"
				itemWidth={120}
				itemHeight={120}
				imageBasePath="chunithm/trophy"
				onItemClick={handleSelectItem}
				onEquip={handleEquipItem}
				onUnlock={handleUnlockItem}
				hasChanges={hasChanges}
			/>
		</div>
	);
};

export default TrophyCustomization;
