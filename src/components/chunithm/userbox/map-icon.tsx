import React, { useCallback, useEffect, useMemo, useState } from "react";

import { toast } from "sonner";

import {
	MapiconItem,
	useCurrentMapicon,
	useEquipMapicon,
	useSearchMapicons,
	useUnlockMapicon,
} from "@/hooks/chunithm/userbox/mapicon";
import { Grid } from "./grid";

const MapiconCustomization: React.FC = () => {
	const [selectedMapiconId, setSelectedMapiconId] = useState<number | null>(null);
	const [originalMapiconId, setOriginalMapiconId] = useState<number | null>(null);

	const { data: currentMapicon } = useCurrentMapicon();
	const { data: searchData, isLoading } = useSearchMapicons({ locked: null });
	const { mutate: equipMapicon } = useEquipMapicon();
	const { mutate: unlockMapicon } = useUnlockMapicon();

	// Track the original mapicon when component mounts
	useEffect(() => {
		if (currentMapicon && originalMapiconId === null) {
			setOriginalMapiconId(currentMapicon.id);
			setSelectedMapiconId(currentMapicon.id);
		}
	}, [currentMapicon, originalMapiconId]);

	const handleSelect = useCallback((item: MapiconItem) => {
		setSelectedMapiconId(item.id);
	}, []);

	const handleEquip = useCallback(
		(item: MapiconItem) => {
			equipMapicon(item.id, {
				onSuccess: () => {
					setOriginalMapiconId(item.id);
				},
				onError: (error) => {
					toast.error("Failed to equip mapicon");
					console.error("Error equipping mapicon:", error);
				},
			});
		},
		[equipMapicon]
	);

	const handleUnlock = useCallback(
		(item: MapiconItem) => {
			unlockMapicon(item.id, {
				onError: (error) => {
					toast.error("Failed to unlock mapicon");
					console.error("Error unlocking mapicon:", error);
				},
			});
		},
		[unlockMapicon, equipMapicon]
	);

	const hasChanges = useMemo(() => {
		return selectedMapiconId !== originalMapiconId;
	}, [selectedMapiconId, originalMapiconId]);

	const equippedItemIds = originalMapiconId ? new Set([originalMapiconId]) : new Set<number>();

	return (
		<Grid
			items={searchData?.items || []}
			equippedItemIds={equippedItemIds}
			selectedItemId={selectedMapiconId}
			loading={isLoading}
			itemHeight={120}
			itemWidth={120}
			imageBasePath="chunithm/map_icon"
			onItemClick={handleSelect}
			onEquip={handleEquip}
			onUnlock={handleUnlock}
			hasChanges={hasChanges}
		/>
	);
};

export default MapiconCustomization;
