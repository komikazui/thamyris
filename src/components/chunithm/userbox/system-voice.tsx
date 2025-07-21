import React, { useCallback, useState } from "react";

import { toast } from "sonner";

import { CDN } from "@/lib/constants";

import {
	SystemvoiceItem,
	useCurrentSystemvoice,
	useEquipSystemvoice,
	useSearchSystemvoices,
	useUnlockSystemvoice,
} from "../../../hooks/chunithm/userbox/systemvoice";
import { Grid } from "./grid";

const SystemvoiceCustomization: React.FC = () => {
	const [currentPage, setCurrentPage] = useState(1);

	const { data: currentSystemvoice } = useCurrentSystemvoice();
	const { data: searchData, isLoading } = useSearchSystemvoices({ locked: null }, currentPage);
	const { mutate: equipSystemvoice } = useEquipSystemvoice();
	const { mutate: unlockSystemvoice } = useUnlockSystemvoice();

	const handleEquipItem = useCallback(
		(item: SystemvoiceItem) => {
			if (item.locked) {
				// Unlock the item, then auto-equip it
				unlockSystemvoice(item.id, {
					onSuccess: () => {
						toast.success("Systemvoice unlocked successfully!");
						// Auto-equip after successful unlock
						equipSystemvoice(item.id, {
							onSuccess: () => {
								toast.success("Systemvoice equipped successfully!");
							},
							onError: (error) => {
								toast.error("Failed to equip systemvoice");
								console.error("Error equipping systemvoice:", error);
							},
						});
					},
					onError: (error) => {
						toast.error("Failed to unlock systemvoice");
						console.error("Error unlocking systemvoice:", error);
					},
				});
			} else {
				// Equip the item
				equipSystemvoice(item.id, {
					onSuccess: () => {
						toast.success("Systemvoice equipped successfully!");
					},
					onError: (error) => {
						toast.error("Failed to equip systemvoice");
						console.error("Error equipping systemvoice:", error);
					},
				});
			}
		},
		[equipSystemvoice, unlockSystemvoice]
	);

	const handlePageChange = useCallback((page: number) => {
		setCurrentPage(page);
	}, []);

	const equippedItemIds = currentSystemvoice ? new Set([currentSystemvoice.id]) : new Set<number>();

	const preview = currentSystemvoice && (
		<img
			src={`${CDN}/chunithm/systemVoice/${currentSystemvoice.imagePath.replace(".dds", ".png")}`}
			className="h-auto max-w-[400px] object-contain"
			alt="Current System Voice"
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
			imageBasePath="chunithm/systemVoice"
			onItemClick={handleEquipItem}
		/>
	);
};

export default SystemvoiceCustomization;
