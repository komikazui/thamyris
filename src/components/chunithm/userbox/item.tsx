import React, { useCallback, useEffect, useMemo, useState } from "react";

import { InferResponseType } from "hono";
import { CheckCircle, ChevronLeft, ChevronRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { CDN } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { api } from "@/utils";

// Infer types from API response
type AvatarSearchResponse = InferResponseType<typeof api.chunithm.userbox.avatar.search.$post>;
type AvatarItem = AvatarSearchResponse["items"][0];

interface PaginationInfo {
	page: number;
	limit: number;
	total: number;
	totalPages: number;
	hasNext: boolean;
	hasPrev: boolean;
}

enum AvatarSlot {
	BACK = "back",
	FACE = "face",
	HEAD = "head",
	ITEM = "item",
	SKIN = "skin",
	WEAR = "wear",
}

interface AvatarItemGridProps {
	onEquip: (itemId: number, slot: string) => void;
	equippedItems: Array<{ id: number; slot: string }>;
}

const slotLabels: Record<AvatarSlot, string> = {
	[AvatarSlot.BACK]: "Back",
	[AvatarSlot.FACE]: "Face",
	[AvatarSlot.HEAD]: "Head",
	[AvatarSlot.ITEM]: "Item",
	[AvatarSlot.SKIN]: "Skin",
	[AvatarSlot.WEAR]: "Wear",
};

const AvatarItemGrid: React.FC<AvatarItemGridProps> = ({ onEquip, equippedItems }) => {
	const [items, setItems] = useState<AvatarItem[]>([]);
	const [loading, setLoading] = useState(false);
	const [selectedSlots, setSelectedSlots] = useState<AvatarSlot[]>(Object.values(AvatarSlot));
	const [lockedFilter, setLockedFilter] = useState<boolean | null>(null);
	const [searchQuery, setSearchQuery] = useState("");
	const [page, setPage] = useState(1);
	const [pagination, setPagination] = useState<PaginationInfo | null>(null);

	const equippedItemIds = useMemo(() => new Set(equippedItems.map((item) => item.id)), [equippedItems]);

	const fetchItems = useCallback(
		async (resetPage = false) => {
			if (loading) return;

			setLoading(true);
			const currentPage = resetPage ? 1 : page;

			try {
				const response = await api.chunithm.userbox.avatar.search.$post({
					json: {
						filter: {
							slot: selectedSlots,
							locked: lockedFilter,
						},
						pagination: {
							page: currentPage,
							limit: 20,
						},
					},
				});

				if (response.ok) {
					const data = await response.json();

					if (resetPage) {
						setItems(data.items);
						setPage(1);
					} else {
						setItems((prev) => [...prev, ...data.items]);
					}

					setPagination(data.pagination);
					if (!resetPage) setPage((prev) => prev + 1);
				}
			} catch (error) {
				console.error("Error fetching avatar items:", error);
			} finally {
				setLoading(false);
			}
		},
		[loading, page, selectedSlots, lockedFilter]
	);

	const handleSlotToggle = (slot: AvatarSlot) => {
		setSelectedSlots((prev) => {
			const newSlots = prev.includes(slot) ? prev.filter((s) => s !== slot) : [...prev, slot];
			return newSlots.length > 0 ? newSlots : [slot]; // Always keep at least one slot
		});
	};

	const handleLockedFilterToggle = () => {
		setLockedFilter((prev) => {
			if (prev === null) return false; // Show unlocked only
			if (prev === false) return true; // Show locked only
			return null; // Show all
		});
	};

	const handleEquipItem = useCallback(
		async (item: AvatarItem) => {
			if (item.locked) {
				// Unlock the item
				try {
					const response = await api.chunithm.userbox.avatar.unlock[":id"].$patch({
						param: { id: item.id.toString() },
					});
					console.log({ response });
					if (response.ok) {
						setItems((prev) => prev.map((i) => (i.id === item.id ? { ...i, locked: false } : i)));
					}
				} catch (error) {
					console.error("Error unlocking item:", error);
				}
			} else {
				// Equip the item
				onEquip(item.id, item.slot);
			}
		},
		[onEquip]
	);

	// Filter items by search query locally
	const filteredItems = useMemo(() => {
		if (!searchQuery.trim()) return items;
		return items.filter((item) => item.label.toLowerCase().includes(searchQuery.toLowerCase()));
	}, [items, searchQuery]);

	useEffect(() => {
		setPage(1);
		setPagination(null);
		fetchItems(true);
	}, [selectedSlots, lockedFilter]);

	const goToPage = (targetPage: number) => {
		if (loading || !pagination) return;
		setPage(targetPage);

		const fetchPage = async () => {
			setLoading(true);
			try {
				const response = await api.chunithm.userbox.avatar.search.$post({
					json: {
						filter: {
							slot: selectedSlots,
							locked: lockedFilter,
						},
						pagination: {
							page: targetPage,
							limit: 20,
						},
					},
				});

				if (response.ok) {
					const data = await response.json();
					setItems(data.items);
					setPagination(data.pagination);
					setPage(targetPage);
				}
			} catch (error) {
				console.error("Error fetching page:", error);
			} finally {
				setLoading(false);
			}
		};

		fetchPage();
	};

	const getLockedFilterLabel = () => {
		if (lockedFilter === null) return "All Items";
		if (lockedFilter === true) return "Locked Only";
		return "Unlocked Only";
	};

	return (
		<div className="space-y-4">
			{/* Search and Filters */}
			<div className="space-y-3">
				{/* <div className="relative">
					<Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
					<Input
						placeholder="Search avatar items..."
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
						className="pl-9"
					/>
				</div> */}
				{/* Slot Filters */}
				<div className="space-y-2">
					<div className="flex items-center justify-between">
						{Object.values(AvatarSlot).map((slot) => (
							<Button
								className="w-20"
								key={slot}
								variant={selectedSlots.includes(slot) ? "default" : "outline"}
								size="sm"
								onClick={() => handleSlotToggle(slot)}
							>
								{slotLabels[slot]}
							</Button>
						))}
					</div>
				</div>
				{/* Locked Filter
				<div className="flex items-center justify-between">
					<label className="text-primary text-sm font-medium">Filter by Status</label>
					<Button variant="outline" size="sm" onClick={handleLockedFilterToggle} className="gap-1">
						<Filter className="h-3 w-3" />
						{getLockedFilterLabel()}
					</Button>
				</div> */}
			</div>

			{/* Items Grid */}
			<div className="relative transition-all duration-300 ease-in-out">
				{/* Loading Overlay for Page Changes and Filter Changes */}
				{loading && (
					<div className="bg-background/80 absolute inset-0 z-10 flex items-center justify-center rounded-lg backdrop-blur-sm">
						<div className="text-muted-foreground flex items-center gap-2 text-sm">
							<div className="border-primary h-4 w-4 animate-spin rounded-full border-2 border-t-transparent"></div>
							{pagination && pagination.totalPages > 1 ? `Loading page ${page}...` : "Loading items..."}
						</div>
					</div>
				)}

				<div
					className={cn(
						"grid grid-cols-2 gap-3 transition-all duration-300 ease-in-out sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5",
						loading ? "opacity-50" : "opacity-100"
					)}
				>
					{filteredItems.map((item) => (
						<div
							key={item.id}
							className={cn(
								"group bg-card relative flex flex-col overflow-hidden rounded-lg border-2 transition-all duration-200",
								"h-[200px] cursor-pointer hover:shadow-md", // Fixed height
								equippedItemIds.has(item.id)
									? "border-primary ring-primary/20 ring-2"
									: "border-border hover:border-primary/50",
								item.locked && "opacity-60"
							)}
							onClick={() => handleEquipItem(item)}
						>
							{/* Item Image */}
							<div className="bg-muted/30 relative min-h-0 flex-1">
								{!!item.imagePath && (
									<img
										src={`${CDN}/chunithm/avatar/${item.imagePath.replace(".dds", ".png")}`}
										alt={item.label}
										className={cn(
											"h-full w-full object-contain", // Changed to object-contain for consistent sizing
											item.locked && "opacity-70 grayscale"
										)}
										loading="lazy"
									/>
								)}

								{/* Equipped Indicator */}
								{equippedItemIds.has(item.id) && (
									<div className="bg-primary text-primary-foreground absolute top-2 right-2 rounded-full p-1">
										<CheckCircle className="h-3 w-3" />
									</div>
								)}

								{/* Locked Indicator
								{item.locked && (
									<div className="absolute inset-0 flex items-center justify-center bg-black/40">
										<div className="rounded-full bg-red-500 p-2 text-white">
											<Unlock className="h-4 w-4" />
										</div>
									</div>
								)} */}

								{/* Hover Overlay */}
								<div className="absolute inset-0 bg-black/0 transition-colors duration-200 group-hover:bg-black/10" />
							</div>

							{/* Item Info */}
							<div className="flex h-[60px] flex-shrink-0 flex-col justify-center space-y-1 p-2">
								<p className="truncate text-xs leading-tight font-medium" title={item.label}>
									{item.label}
								</p>
								<div className="flex items-center justify-between">
									<span className="text-muted-foreground text-xs capitalize">{slotLabels[item.slot as AvatarSlot]}</span>
									{item.locked ? <span className="text-xs font-medium text-red-500">Locked</span> : null}
								</div>
							</div>
						</div>
					))}
				</div>
			</div>

			{/* Pagination Controls */}
			{pagination && pagination.totalPages > 1 && (
				<div className="space-y-4">
					{/* Page Navigation */}
					<div className="flex items-center justify-center gap-2">
						<Button
							variant="outline"
							size="sm"
							onClick={() => goToPage(pagination.page - 1)}
							disabled={!pagination.hasPrev || loading}
						>
							<ChevronLeft className="h-4 w-4" />
						</Button>

						{/* Page Numbers */}
						<div className="flex gap-1">
							{Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
								let pageNum;
								if (pagination.totalPages <= 5) {
									pageNum = i + 1;
								} else if (pagination.page <= 3) {
									pageNum = i + 1;
								} else if (pagination.page >= pagination.totalPages - 2) {
									pageNum = pagination.totalPages - 4 + i;
								} else {
									pageNum = pagination.page - 2 + i;
								}

								return (
									<Button
										key={pageNum}
										variant={pageNum === pagination.page ? "default" : "outline"}
										size="sm"
										onClick={() => goToPage(pageNum)}
										disabled={loading || pageNum === pagination.page}
										className={cn("w-10", loading && "pointer-events-none")}
									>
										{loading && pageNum === page ? (
											<div className="h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent" />
										) : (
											pageNum
										)}
									</Button>
								);
							})}
						</div>

						<Button
							variant="outline"
							size="sm"
							onClick={() => goToPage(pagination.page + 1)}
							disabled={!pagination.hasNext || loading}
						>
							<ChevronRight className="h-4 w-4" />
						</Button>
					</div>
				</div>
			)}

			{/* Empty State */}
			{filteredItems.length === 0 && !loading && (
				<div className="text-muted-foreground py-8 text-center">
					<div className="space-y-2">
						<p>No avatar items found</p>
						<p className="text-sm">Try adjusting your filters or search query</p>
					</div>
				</div>
			)}
		</div>
	);
};

export default AvatarItemGrid;
