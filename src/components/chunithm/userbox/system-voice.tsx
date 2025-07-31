import React, { useCallback, useEffect, useMemo, useState } from "react";

import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
	SystemvoiceItem,
	useCurrentSystemvoice,
	useEquipSystemvoice,
	useSearchSystemvoices,
	useUnlockSystemvoice,
} from "@/hooks/chunithm/userbox/systemvoice";
import { CDN } from "@/lib/constants";

import { Grid } from "./grid";
import { VoiceSampleDropdown } from "./voice-sample-dropdown";

const SystemvoiceCustomization: React.FC = () => {
	const [selectedSystemvoiceId, setSelectedSystemvoiceId] = useState<number | null>(null);
	const [originalSystemvoiceId, setOriginalSystemvoiceId] = useState<number | null>(null);

	const { data: currentSystemvoice } = useCurrentSystemvoice();
	const { data: searchData, isLoading } = useSearchSystemvoices({ locked: null });
	const { mutate: equipSystemvoice } = useEquipSystemvoice();
	const { mutate: unlockSystemvoice } = useUnlockSystemvoice();

	// Track the original systemvoice when component mounts
	useEffect(() => {
		if (currentSystemvoice && originalSystemvoiceId === null) {
			setOriginalSystemvoiceId(currentSystemvoice.id);
			setSelectedSystemvoiceId(currentSystemvoice.id);
		}
	}, [currentSystemvoice, originalSystemvoiceId]);

	const handleSelect = useCallback((item: SystemvoiceItem) => {
		setSelectedSystemvoiceId(item.id);
	}, []);

	const handleEquip = useCallback(
		(item: SystemvoiceItem) => {
			equipSystemvoice(item.id, {
				onSuccess: () => {
					setOriginalSystemvoiceId(item.id);
				},
				onError: (error) => {
					toast.error("Failed to equip systemvoice");
					console.error("Error equipping systemvoice:", error);
				},
			});
		},
		[equipSystemvoice]
	);

	const handleUnlock = useCallback(
		(item: SystemvoiceItem) => {
			unlockSystemvoice(item.id, {
				onError: (error) => {
					toast.error("Failed to unlock systemvoice");
					console.error("Error unlocking systemvoice:", error);
				},
			});
		},
		[unlockSystemvoice]
	);

	const hasChanges = useMemo(() => {
		return selectedSystemvoiceId !== originalSystemvoiceId;
	}, [selectedSystemvoiceId, originalSystemvoiceId]);

	const equippedItemIds = originalSystemvoiceId ? new Set([originalSystemvoiceId]) : new Set<number>();

	// Custom preview component with voice samples dropdown
	const customPreview = useCallback(
		(item: SystemvoiceItem) => {
			return (
				<div className="mb-4 flex h-fit flex-col items-center justify-center">
					{/* Title and Voice Samples side by side */}
					<div className="mb-2 flex items-center gap-4">
						<div className="text-center">
							<h3 className="text-primary text-xl font-semibold">{item.label}</h3>
						</div>
					</div>

					{/* Preview Image */}
					<div style={{ maxWidth: "100%" }}>
						<img
							src={`${CDN}/chunithm/system_voice_thumbnails/${item.imagePath?.replace(".dds", ".png") || ""}`}
							alt={item.label}
							className="mx-auto mb-2"
							style={{
								width: 240 * 1.5,
								height: 90 * 1.5,
								objectFit: "contain",
								borderRadius: "0.5rem",
								boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
							}}
						/>
					</div>
					<VoiceSampleDropdown systemVoiceId={item.id} />

					{/* Equip/Unlock Button */}
					<Button
						onClick={() => (item.locked ? handleUnlock(item) : handleEquip(item))}
						disabled={!hasChanges && !item.locked}
						variant="default"
						className="mt-2 text-sm"
					>
						{item.locked ? "Unlock" : "Equip"}
					</Button>
				</div>
			);
		},
		[hasChanges, handleEquip, handleUnlock]
	);

	return (
		<div className="flex h-full flex-col">
			<Grid
				items={searchData?.items || []}
				equippedItemIds={equippedItemIds}
				selectedItemId={selectedSystemvoiceId}
				loading={isLoading}
				layout="stacked"
				itemHeight={90}
				itemWidth={240}
				imageBasePath="chunithm/systemvoicethumbnails"
				onItemClick={handleSelect}
				onEquip={handleEquip}
				onUnlock={handleUnlock}
				hasChanges={hasChanges}
				customPreview={customPreview}
				maxColumns={6}
			/>
		</div>
	);
};

export default SystemvoiceCustomization;
