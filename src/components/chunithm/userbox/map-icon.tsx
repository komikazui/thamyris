import React, { useCallback, useState } from "react";

import { toast } from "sonner";

import { CDN } from "@/lib/constants";

import {
	MapiconItem,
	useCurrentMapicon,
	useEquipMapicon,
	useSearchMapicons,
	useUnlockMapicon,
} from "../../../hooks/chunithm/userbox/mapicon";
import { Grid } from "./grid";

const MapiconCustomization: React.FC = () => {
	const [currentPage, setCurrentPage] = useState(1);

	const { data: currentMapicon } = useCurrentMapicon();
	const { data: searchData, isLoading } = useSearchMapicons({ locked: null }, currentPage);
	const { mutate: equipMapicon } = useEquipMapicon();
	const { mutate: unlockMapicon } = useUnlockMapicon();

	const handleEquipItem = useCallback(
		(item: MapiconItem) => {
			if (item.locked) {
				// Unlock the item, then auto-equip it
				unlockMapicon(item.id, {
					onSuccess: () => {
						toast.success("Mapicon unlocked successfully!");
						// Auto-equip after successful unlock
						equipMapicon(item.id, {
							onSuccess: () => {
								toast.success("Mapicon equipped successfully!");
							},
							onError: (error) => {
								toast.error("Failed to equip mapicon");
								console.error("Error equipping mapicon:", error);
							},
						});
					},
					onError: (error) => {
						toast.error("Failed to unlock mapicon");
						console.error("Error unlocking mapicon:", error);
					},
				});
			} else {
				// Equip the item
				equipMapicon(item.id, {
					onSuccess: () => {
						toast.success("Mapicon equipped successfully!");
					},
					onError: (error) => {
						toast.error("Failed to equip mapicon");
						console.error("Error equipping mapicon:", error);
					},
				});
			}
		},
		[equipMapicon, unlockMapicon]
	);

	const handlePageChange = useCallback((page: number) => {
		setCurrentPage(page);
	}, []);

	const equippedItemIds = currentMapicon ? new Set([currentMapicon.id]) : new Set<number>();

	const preview = currentMapicon && (
		<img
			src={`${CDN}/chunithm/mapIcon/${currentMapicon.imagePath.replace(".dds", ".png")}`}
			className="h-auto max-w-[400px] object-contain"
			alt="Current Map Icon"
		/>
	);

	return (
		<Grid
			items={searchData?.items || []}
			equippedItemIds={equippedItemIds}
			loading={isLoading}
			layout="stacked"
			preview={preview}
			itemWidth={120}
			itemHeight={120}
			maxColumns={8}
			minColumns={4}
			pagination={searchData?.pagination}
			onPageChange={handlePageChange}
			imageBasePath="chunithm/mapIcon"
			onItemClick={handleEquipItem}
		/>
	);
};

export default MapiconCustomization;
