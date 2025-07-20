import React, { useCallback, useState } from "react";

import { toast } from "sonner";

import { CDN } from "@/lib/constants";

import {
	NameplateItem,
	useCurrentNameplate,
	useEquipNameplate,
	useSearchNameplates,
	useUnlockNameplate,
} from "../../../hooks/chunithm/userbox/nameplate";
import { Grid } from "./grid";

const NameplateCustomization: React.FC = () => {
	const [currentPage, setCurrentPage] = useState(1);
	const [pageSize, setPageSize] = useState(36);

	const { data: currentNameplate } = useCurrentNameplate();
	const { data: searchData, isLoading } = useSearchNameplates({ locked: null }, currentPage, pageSize);
	const { mutate: equipNameplate } = useEquipNameplate();
	const { mutate: unlockNameplate } = useUnlockNameplate();

	const handleEquipItem = useCallback(
		(item: NameplateItem) => {
			if (item.locked) {
				// Unlock the item, then auto-equip it
				unlockNameplate(item.id, {
					onSuccess: () => {
						// Auto-equip after successful unlock
						equipNameplate(item.id, {
							onError: (error) => {
								toast.error("Failed to equip nameplate");
								console.error("Error equipping nameplate:", error);
							},
						});
					},
					onError: (error) => {
						toast.error("Failed to unlock nameplate");
						console.error("Error unlocking nameplate:", error);
					},
				});
			} else {
				// Equip the item
				equipNameplate(item.id, {
					onError: (error) => {
						toast.error("Failed to equip nameplate");
						console.error("Error equipping nameplate:", error);
					},
				});
			}
		},
		[equipNameplate, unlockNameplate]
	);

	const handlePageChange = useCallback((page: number) => {
		setCurrentPage(page);
	}, []);

	const handlePageSizeChange = useCallback((newPageSize: number) => {
		// Update both page size and reset page to 1 in the same update
		setPageSize(newPageSize);
		setCurrentPage(1);
	}, []);

	const equippedItemIds = currentNameplate ? new Set([currentNameplate.id]) : new Set<number>();

	const preview = currentNameplate && (
		<img
			src={`${CDN}/chunithm/nameplate/${currentNameplate.imagePath.replace(".dds", ".png")}`}
			className="object-contain"
		/>
	);

	return (
		<Grid
			items={searchData?.items || []}
			equippedItemIds={equippedItemIds}
			loading={isLoading}
			preview={preview}
			itemWidth={250}
			itemHeight={80}
			minColumns={6}
			pagination={searchData?.pagination}
			onPageChange={handlePageChange}
			onPageSizeChange={handlePageSizeChange}
			pageSizeOptions={[18, 36, 72]}
			imageBasePath="chunithm/nameplate"
			onItemClick={handleEquipItem}
			containerClassName="nameplate-grid-container"
		/>
	);
};

export default NameplateCustomization;
