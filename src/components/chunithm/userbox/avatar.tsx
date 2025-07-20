import React, { useCallback, useState } from "react";

import { useAvatar } from "@/hooks/chunithm/userbox/avatar";
import { api } from "@/utils";

import { Grid } from "./grid";

enum AvatarSlot {
	ALL = "all",
	BACK = "back",
	FACE = "face",
	HEAD = "head",
	ITEM = "item",
	SKIN = "skin",
	WEAR = "wear",
}

const slotLabels: Record<AvatarSlot, string> = {
	[AvatarSlot.ALL]: "All",
	[AvatarSlot.BACK]: "Back",
	[AvatarSlot.FACE]: "Face",
	[AvatarSlot.HEAD]: "Head",
	[AvatarSlot.ITEM]: "Item",
	[AvatarSlot.SKIN]: "Skin",
	[AvatarSlot.WEAR]: "Wear",
};

const Avatar = () => {
	const { render, items, equip } = useAvatar();
	const [avatarItems, setAvatarItems] = useState<any[]>([]);
	const [loading, setLoading] = useState(false);
	const [selectedSlot, setSelectedSlot] = useState<AvatarSlot>(AvatarSlot.ALL);
	const [pagination, setPagination] = useState<any>(null);
	const [pageSize, setPageSize] = useState(18);

	const equippedItems = items.map((item) => ({
		id: item.id,
		slot: item.slot,
	}));

	const fetchItems = useCallback(
		async (targetPage = 1) => {
			if (loading) return;

			setLoading(true);
			try {
				// Determine which slots to filter by - exclude "all" from API call
				const slotFilter =
					selectedSlot === AvatarSlot.ALL
						? Object.values(AvatarSlot).filter((slot) => slot !== AvatarSlot.ALL)
						: [selectedSlot];

				const response = await api.chunithm.userbox.avatar.search.$post({
					json: {
						filter: {
							slot: slotFilter as any,
							locked: null,
						},
						pagination: {
							page: targetPage,
							limit: pageSize,
						},
					},
				});
				if (response.ok) {
					const data = await response.json();
					setAvatarItems(data.items);
					setPagination(data.pagination);
				}
			} catch (error) {
				console.error("Error fetching avatar items:", error);
			} finally {
				setLoading(false);
			}
		},
		[loading, selectedSlot, pageSize]
	);

	const handleEquipItem = useCallback(
		async (item: any) => {
			if (item.locked) {
				// Unlock the item, then auto-equip it
				try {
					const response = await api.chunithm.userbox.avatar.unlock[":id"].$patch({
						param: { id: item.id.toString() },
					});
					if (response.ok) {
						setAvatarItems((prev) => prev.map((i) => (i.id === item.id ? { ...i, locked: false } : i)));
						// Auto-equip after successful unlock
						equip(item.id, item.slot);
					}
				} catch (error) {
					console.error("Error unlocking item:", error);
				}
			} else {
				// Equip the item
				equip(item.id, item.slot);
			}
		},
		[equip]
	);

	const handlePageChange = useCallback(
		(targetPage: number) => {
			fetchItems(targetPage);
		},
		[fetchItems]
	);

	const handleFilterChange = useCallback((filter: string) => {
		setSelectedSlot(filter as AvatarSlot);
	}, []);

	const handlePageSizeChange = useCallback(
		(newPageSize: number) => {
			setPageSize(newPageSize);
			// Reset to page 1 when changing page size
			fetchItems(1);
		},
		[fetchItems]
	);

	// Fetch items when slot changes
	React.useEffect(() => {
		fetchItems(1);
	}, [selectedSlot]);

	const filters = Object.values(AvatarSlot).map((slot) => ({
		value: slot,
		label: slotLabels[slot],
	}));

	const equippedItemIds = new Set(equippedItems.map((item) => item.id));

	return (
		<Grid
			items={avatarItems}
			equippedItemIds={equippedItemIds}
			loading={loading}
			preview={render}
			itemWidth={150}
			itemHeight={200}
			minColumns={6}
			filters={filters}
			selectedFilter={selectedSlot}
			onFilterChange={handleFilterChange}
			pagination={pagination}
			onPageChange={handlePageChange}
			onPageSizeChange={handlePageSizeChange}
			pageSizeOptions={[18, 24, 48, 96]}
			imageBasePath="chunithm/avatar"
			onItemClick={handleEquipItem}
			containerClassName="avatar-grid-container"
		/>
	);
};

export default Avatar;
