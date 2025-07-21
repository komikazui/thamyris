import React, { useCallback, useState } from "react";

import { toast } from "sonner";

import { CDN } from "@/lib/constants";

import {
	TrophyItem,
	useCurrentTrophy,
	useEquipTrophy,
	useSearchTrophies,
	useUnlockTrophy,
} from "../../../hooks/chunithm/userbox/trophy";
import { Grid } from "./grid";

const TrophyCustomization: React.FC = () => {
	const [currentPage, setCurrentPage] = useState(1);

	const { data: currentTrophy } = useCurrentTrophy();
	const { data: searchData, isLoading } = useSearchTrophies({ locked: null }, currentPage);
	const { mutate: equipTrophy } = useEquipTrophy();
	const { mutate: unlockTrophy } = useUnlockTrophy();

	const handleEquipItem = useCallback(
		(item: TrophyItem) => {
			if (item.locked) {
				// Unlock the item, then auto-equip it
				unlockTrophy(item.id, {
					onSuccess: () => {
						toast.success("Trophy unlocked successfully!");
						// Auto-equip after successful unlock
						equipTrophy(item.id, {
							onSuccess: () => {
								toast.success("Trophy equipped successfully!");
							},
							onError: (error) => {
								toast.error("Failed to equip trophy");
								console.error("Error equipping trophy:", error);
							},
						});
					},
					onError: (error) => {
						toast.error("Failed to unlock trophy");
						console.error("Error unlocking trophy:", error);
					},
				});
			} else {
				// Equip the item
				equipTrophy(item.id, {
					onSuccess: () => {
						toast.success("Trophy equipped successfully!");
					},
					onError: (error) => {
						toast.error("Failed to equip trophy");
						console.error("Error equipping trophy:", error);
					},
				});
			}
		},
		[equipTrophy, unlockTrophy]
	);

	const handlePageChange = useCallback((page: number) => {
		setCurrentPage(page);
	}, []);

	const equippedItemIds = currentTrophy ? new Set([currentTrophy.id]) : new Set<number>();

	const preview = currentTrophy && (
		<img
			src={`${CDN}/chunithm/trophy/${currentTrophy.imagePath.replace(".dds", ".png")}`}
			className="h-auto max-w-[400px] object-contain"
			alt="Current Trophy"
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
			imageBasePath="chunithm/trophy"
			onItemClick={handleEquipItem}
		/>
	);
};

export default TrophyCustomization;
