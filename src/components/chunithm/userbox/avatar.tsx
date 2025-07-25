import React, { useCallback, useMemo, useState } from "react";

import { toast } from "sonner";

import { Grid } from "@/components/chunithm/userbox/grid";
import { useAvatar } from "@/hooks/chunithm/userbox/avatar";
import { AvatarSlot, useSearchAvatarItems, useUnlockAvatarItem } from "@/hooks/chunithm/userbox/avatar-search";
import { CDN } from "@/lib/constants";

const slotLabels: Record<AvatarSlot, string> = {
	[AvatarSlot.ALL]: "All",
	[AvatarSlot.BACK]: "Back",
	[AvatarSlot.FACE]: "Face",
	[AvatarSlot.HEAD]: "Head",
	[AvatarSlot.ITEM]: "Item",
	[AvatarSlot.SKIN]: "Skin",
	[AvatarSlot.WEAR]: "Wear",
};

// Available slots including ALL
const availableSlots = Object.values(AvatarSlot);

const Avatar = () => {
	const { items: equippedItems, render, equip } = useAvatar();
	const unlockMutation = useUnlockAvatarItem();

	// Current filter states
	const [selectedSlot, setSelectedSlot] = useState<AvatarSlot>(AvatarSlot.ALL);
	const [selectedItem, setSelectedItem] = useState<number | null>(null);

	// Pending changes - track what items are "equipped" but not saved yet
	const [pendingItems, setPendingItems] = useState<Record<string, number | null>>({});
	const [hasChanges, setHasChanges] = useState(false);

	// Search query based on current filters
	const searchQuery = useSearchAvatarItems({
		slot: selectedSlot === AvatarSlot.ALL ? availableSlots.filter((s) => s !== AvatarSlot.ALL) : [selectedSlot],
		locked: null,
	});

	// Search query for all items (used for avatar rendering and equipped item management)
	const allItemsQuery = useSearchAvatarItems({
		slot: availableSlots.filter((s) => s !== AvatarSlot.ALL),
		locked: null,
	});

	// Get equipped item IDs for highlighting
	const equippedItemIds = useMemo(() => {
		return new Set(equippedItems.map((item) => item.id));
	}, [equippedItems]);

	// Filter options for slots
	const slotFilters = useMemo(() => {
		return availableSlots.map((slot) => ({
			value: slot,
			label: slotLabels[slot],
		}));
	}, []);

	// Filtered items based on selected slot
	const filteredItems = useMemo(() => {
		if (!searchQuery.data?.items) return [];
		return searchQuery.data.items;
	}, [searchQuery.data?.items]); // Get current item for each slot (pending changes take priority)
	const getCurrentItem = useCallback(
		(slot: string) => {
			if (pendingItems[slot] !== undefined) {
				if (pendingItems[slot] === null) return null;
				return allItemsQuery.data?.items?.find((item) => item.id === pendingItems[slot]) || null;
			}
			return equippedItems.find((item) => item.slot === slot) || null;
		},
		[pendingItems, equippedItems, allItemsQuery.data?.items]
	);

	// Create preview avatar items by merging equipped items with pending changes
	const previewAvatarItems = useMemo(() => {
		const baseItems = [...equippedItems];
		const slotsWithPending = Object.keys(pendingItems);

		// Remove items from slots that have pending changes
		const filteredItems = baseItems.filter((item) => !slotsWithPending.includes(item.slot));

		// Add pending items
		Object.entries(pendingItems).forEach(([, itemId]) => {
			if (itemId !== null && itemId !== undefined) {
				const item = allItemsQuery.data?.items?.find((i) => i.id === itemId);
				if (item) {
					filteredItems.push(item);
				}
			}
		});

		return filteredItems;
	}, [equippedItems, pendingItems, allItemsQuery.data?.items]);

	// Create a preview render using the preview items
	const previewRender = useMemo(() => {
		if (!hasChanges) return render;

		// Use the same logic as the useAvatar hook but with preview items
		const initialImages = {
			back: "",
			wear: "",
			skin: `${CDN}/chunithm/avatarStatic/CHU_UI_Avatar_Tex_01400001.png`,
			handL: `${CDN}/chunithm/avatarStatic/CHU_UI_Avatar_Tex_LeftHand.png`,
			handR: `${CDN}/chunithm/avatarStatic/CHU_UI_Avatar_Tex_RightHand.png`,
			head: "",
			item: "",
			face: "",
			faceStatic: `${CDN}/chunithm/avatarStatic/CHU_UI_Avatar_Tex_Face.png`,
			skinfootL: `${CDN}/chunithm/avatarStatic/CHU_UI_Avatar_Tex_01400001.png`,
			skinfootR: `${CDN}/chunithm/avatarStatic/CHU_UI_Avatar_Tex_01400001.png`,
		};

		const avatarImages = {
			...initialImages,
			back: previewAvatarItems.find((item) => item.slot === "back")?.imagePath
				? `${CDN}/chunithm/avatar/${previewAvatarItems.find((item) => item.slot === "back")?.imagePath}`
				: initialImages.back,
			wear: previewAvatarItems.find((item) => item.slot === "wear")?.imagePath
				? `${CDN}/chunithm/avatar/${previewAvatarItems.find((item) => item.slot === "wear")?.imagePath}`
				: initialImages.wear,
			head: previewAvatarItems.find((item) => item.slot === "head")?.imagePath
				? `${CDN}/chunithm/avatar/${previewAvatarItems.find((item) => item.slot === "head")?.imagePath}`
				: initialImages.head,
			item: previewAvatarItems.find((item) => item.slot === "item")?.imagePath
				? `${CDN}/chunithm/avatar/${previewAvatarItems.find((item) => item.slot === "item")?.imagePath}`
				: initialImages.item,
			face: previewAvatarItems.find((item) => item.slot === "face")?.imagePath
				? `${CDN}/chunithm/avatar/${previewAvatarItems.find((item) => item.slot === "face")?.imagePath}`
				: initialImages.face,
		};

		const maybeImg = (path?: string) =>
			path && path.trim() && !path.endsWith("/") ? <img src={path.replace(".dds", ".png")} /> : null;

		return (
			<div className="relative flex items-center justify-center">
				<div className="avatar_base relative">
					<div className="avatar_back">{maybeImg(avatarImages.back)}</div>
					<div className="avatar_wear">{maybeImg(avatarImages.wear)}</div>
					<div className="avatar_skin">{maybeImg(avatarImages.skin)}</div>
					<div className="avatar_hand_l">{maybeImg(avatarImages.handL)}</div>
					<div className="avatar_hand_r">{maybeImg(avatarImages.handR)}</div>
					<div className="avatar_head">{maybeImg(avatarImages.head)}</div>
					<div className="avatar_face_static">{maybeImg(avatarImages.faceStatic)}</div>
					<div className="avatar_face">{maybeImg(avatarImages.face)}</div>
					<div className="avatar_item_l">{maybeImg(avatarImages.item)}</div>
					<div className="avatar_item_r">{maybeImg(avatarImages.item)}</div>
					<div className="avatar_skinfoot_l">{maybeImg(avatarImages.skinfootL)}</div>
					<div className="avatar_skinfoot_r">{maybeImg(avatarImages.skinfootR)}</div>
				</div>
			</div>
		);
	}, [hasChanges, render, previewAvatarItems]);

	// Check if there are any locked items in pending changes
	const hasLockedPendingItems = useMemo(() => {
		return Object.values(pendingItems).some((itemId) => {
			if (itemId === null || itemId === undefined) return false;
			const item = allItemsQuery.data?.items?.find((i) => i.id === itemId);
			return item?.locked;
		});
	}, [pendingItems, allItemsQuery.data?.items]);

	const handleEquipToSlot = useCallback(
		(slot: string, itemId: number | null) => {
			const originalItem = equippedItems.find((item) => item.slot === slot);
			const originalItemId = originalItem?.id || null;

			if (itemId === originalItemId) {
				// If we're setting it back to the original, remove from pending changes
				setPendingItems((prev) => {
					const newPending = { ...prev };
					delete newPending[slot];
					return newPending;
				});
			} else {
				// Otherwise, add to pending changes
				setPendingItems((prev) => ({
					...prev,
					[slot]: itemId,
				}));
			}

			// Update hasChanges based on whether there are any pending changes
			setPendingItems((prev) => {
				const newPending =
					itemId === originalItemId
						? (() => {
								const { [slot]: _, ...rest } = prev;
								return rest;
							})()
						: { ...prev, [slot]: itemId };
				setHasChanges(Object.keys(newPending).length > 0);
				return newPending;
			});
		},
		[equippedItems]
	);

	const handleItemClick = useCallback(
		(item: any) => {
			// Directly equip the item to its slot when clicked
			handleEquipToSlot(item.slot, item.id);
			setSelectedItem(item.id);
		},
		[handleEquipToSlot]
	);

	const handleSaveChanges = useCallback(async () => {
		try {
			// Only save non-locked items
			const validChanges = Object.entries(pendingItems).filter(([_, itemId]) => {
				if (itemId === null || itemId === undefined) return true; // Allow unequipping
				const item = allItemsQuery.data?.items?.find((i) => i.id === itemId);
				return !item?.locked;
			});

			for (const [slot, itemId] of validChanges) {
				if (itemId !== undefined) {
					await equip(itemId || 0, slot); // Use 0 for unequipping
				}
			}

			setPendingItems({});
			setHasChanges(false);
		} catch (error) {
			toast.error("Failed to save changes");
			console.error("Failed to save changes:", error);
		}
	}, [pendingItems, allItemsQuery.data?.items, equip]);

	const handleRevertChanges = useCallback(() => {
		setPendingItems({});
		setHasChanges(false);
	}, []);

	const handleUnlockItem = useCallback(
		async (itemId: number, itemLabel: string) => {
			try {
				await unlockMutation.mutateAsync(itemId);
			} catch (error) {
				toast.error(`Failed to unlock ${itemLabel}`);
				console.error("Failed to unlock item:", error);
			}
		},
		[unlockMutation]
	);

	const handleFilterChange = useCallback((filter: string) => {
		setSelectedSlot(filter as AvatarSlot);
		setSelectedItem(null); // Clear selection when changing slots
	}, []);

	return (
		<div className="flex h-full w-full flex-col">
			{/* Top Section: Avatar and Equipped Items - Fixed height at 1/4 of viewport */}
			<div className="flex p-4">
				{/* Avatar Preview */}
				<div className="flex w-1/4 items-center justify-center">{hasChanges ? previewRender : render}</div>

				{/* Equipped Items */}
				<div className="flex w-3/4 flex-col items-end overflow-hidden">
					<div className="mb-4">
						<button
							onClick={handleRevertChanges}
							disabled={!hasChanges}
							className="bg-secondary text-secondary-foreground hover:bg-secondary/80 rounded px-3 py-1.5 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50"
						>
							Revert All
						</button>
						<button
							onClick={handleSaveChanges}
							disabled={!hasChanges || hasLockedPendingItems}
							className="bg-primary text-primary-foreground hover:bg-primary/80 rounded px-3 py-1.5 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50"
						>
							Save Changes
						</button>
					</div>
					<div className="grid w-full flex-1 grid-cols-6 gap-2 overflow-hidden">
						{availableSlots
							.filter((slot) => slot !== AvatarSlot.ALL)
							.map((slot) => {
								const currentItem = getCurrentItem(slot);
								const originalItem = equippedItems.find((item) => item.slot === slot);
								const isPending = pendingItems[slot] !== undefined && pendingItems[slot] !== originalItem?.id;
								const hasSlotChange = currentItem?.id !== originalItem?.id;
								return (
									<div
										key={slot}
										className={`bg-card flex w-full flex-col rounded-lg border ${isPending ? "border-2 border-yellow-500" : "border-muted"}`}
									>
										{/* Header with slot title */}
										<div className="bg-muted/30 border-b p-2">
											<div className="text-primary text-center text-sm font-medium">{slotLabels[slot]}</div>
										</div>

										{/* Content area */}
										<div className="flex min-h-0 flex-1 text-center">
											{currentItem ? (
												<div className="flex flex-1 flex-col">
													<div className="flex flex-1 items-center justify-center">
														<img
															src={`${CDN}/chunithm/avatar/${currentItem.imagePath?.replace(".dds", ".png")}`}
															alt={currentItem.label || "Equipped item"}
															className="w-40 object-cover object-center"
														/>
														{currentItem.locked ? (
															<div className="absolute top-3 right-3 rounded-full bg-red-500 px-1 text-xs text-white">🔒</div>
														) : null}
													</div>
													<div className="bg-muted/20 p-2">
														<div className="text-primary mb-1 truncate text-sm font-medium">
															{currentItem.label || "Unknown Item"}
														</div>
														<div className="flex flex-wrap justify-center gap-1">
															{hasSlotChange ? (
																<button
																	onClick={() => handleEquipToSlot(slot, originalItem?.id || null)}
																	className="bg-secondary text-secondary-foreground hover:bg-secondary/80 rounded px-2 py-0.5 text-xs transition-colors"
																>
																	Revert
																</button>
															) : null}
															{/* <button
																onClick={() => handleEquipToSlot(slot, null)}
																className="text-primary hover:text-primary/80 text-xs"
															>
																Remove
															</button> */}
														</div>
														{currentItem.locked ? (
															<button
																onClick={() => handleUnlockItem(currentItem.id, currentItem.label)}
																className="mt-1 w-full rounded bg-red-500/20 px-2 py-0.5 text-xs text-red-600 hover:bg-red-500/30"
															>
																Unlock
															</button>
														) : null}
													</div>
												</div>
											) : (
												<div className="flex flex-1 flex-col">
													<div className="text-primary flex flex-1 items-center justify-center p-4 text-center text-xs">
														No item equipped
													</div>
													{originalItem ? (
														<div className="bg-muted/20 p-2 text-center">
															<button
																onClick={() => handleEquipToSlot(slot, originalItem.id)}
																className="bg-secondary text-secondary-foreground hover:bg-secondary/80 rounded px-2 py-0.5 text-xs transition-colors"
															>
																Revert
															</button>
														</div>
													) : null}
												</div>
											)}
										</div>
									</div>
								);
							})}
					</div>
				</div>
			</div>

			{/* Items Grid - Takes remaining page */}
			<div className="min-h-0 flex-1 p-4">
				<Grid
					items={filteredItems}
					equippedItemIds={equippedItemIds}
					selectedItemId={selectedItem}
					onItemClick={handleItemClick}
					imageBasePath="chunithm/avatar"
					filters={slotFilters}
					selectedFilter={selectedSlot}
					onFilterChange={handleFilterChange}
					itemWidth={120}
					itemHeight={120}
					hidePreview={true}
					layout="stacked"
				/>
			</div>
		</div>
	);
};

export default Avatar;
