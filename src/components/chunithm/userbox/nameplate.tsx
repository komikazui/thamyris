import React, { useCallback, useEffect, useMemo, useState } from "react";

import { toast } from "sonner";

import {
	NameplateItem,
	useCurrentNameplate,
	useEquipNameplate,
	useSearchNameplates,
	useUnlockNameplate,
} from "@/hooks/chunithm/userbox/nameplate";

import { Grid } from "./grid";

const NameplateCustomization: React.FC = () => {
	const [selectedNameplateId, setSelectedNameplateId] = useState<number | null>(null);
	const [originalNameplateId, setOriginalNameplateId] = useState<number | null>(null);

	const { data: currentNameplate } = useCurrentNameplate();
	const { data: searchData, isLoading } = useSearchNameplates({ locked: null });
	const { mutate: equipNameplate } = useEquipNameplate();
	const { mutate: unlockNameplate } = useUnlockNameplate();

	// Track the original nameplate when component mounts
	useEffect(() => {
		if (currentNameplate && originalNameplateId === null) {
			setOriginalNameplateId(currentNameplate.id);
			setSelectedNameplateId(currentNameplate.id);
		}
	}, [currentNameplate, originalNameplateId]);

	const handleSelect = useCallback((item: NameplateItem) => {
		setSelectedNameplateId(item.id);
	}, []);

	const handleEquip = useCallback(
		(item: NameplateItem) => {
			equipNameplate(item.id, {
				onSuccess: () => {
					setOriginalNameplateId(item.id);
				},
				onError: (error) => {
					toast.error("Failed to equip nameplate");
					console.error("Error equipping nameplate:", error);
				},
			});
		},
		[equipNameplate]
	);

	const handleUnlock = useCallback(
		(item: NameplateItem) => {
			unlockNameplate(item.id, {
				onError: (error) => {
					toast.error("Failed to unlock nameplate");
					console.error("Error unlocking nameplate:", error);
				},
			});
		},
		[unlockNameplate]
	);

	const hasChanges = useMemo(() => {
		return selectedNameplateId !== originalNameplateId;
	}, [selectedNameplateId, originalNameplateId]);

	const equippedItemIds = originalNameplateId ? new Set([originalNameplateId]) : new Set<number>();

	return (
		<Grid
			items={searchData?.items || []}
			equippedItemIds={equippedItemIds}
			selectedItemId={selectedNameplateId}
			loading={isLoading}
			itemHeight={90}
			itemWidth={240}
			imageBasePath="chunithm/nameplate"
			onItemClick={handleSelect}
			onEquip={handleEquip}
			onUnlock={handleUnlock}
			hasChanges={hasChanges}
			layout="stacked"
			maxColumns={6}
		/>
	);
};

export default NameplateCustomization;
