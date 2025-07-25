import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { CDN } from "@/lib/constants";
import { cn } from "@/lib/utils";

// Types
export interface BaseItem {
	id: number;
	imagePath: string;
	label: string;
	locked: boolean;
}

export interface FilterOption {
	value: string;
	label: string;
}

// Virtual scrolling hook
function useVirtualGrid<T>({
	items,
	containerHeight,
	itemHeight,
	itemWidth,
	columns,
	gap = 12,
	overscan = 5,
}: {
	items: T[];
	containerHeight: number;
	itemHeight: number;
	itemWidth: number;
	columns: number;
	gap?: number;
	overscan?: number;
}) {
	const [scrollTop, setScrollTop] = useState(0);

	// Calculate scaled label height with consistent px-based scaling
	const baseFactor = itemWidth / 120; // Base width is 120
	const scaleFactor = Math.min(1.3, Math.max(0.8, baseFactor)); // Constrain scaling range
	const scaledFontSize = Math.max(10, Math.min(14, 12 * scaleFactor)); // Cap font size at 14px
	const scaledLineHeight = scaledFontSize + 2;
	const scaledPadding = Math.max(4, Math.min(8, 6 * scaleFactor)); // Use px instead of vh
	const scaledLabelHeight = Math.max(24, scaledLineHeight + scaledPadding * 2);
	const totalItemHeight = itemHeight + scaledLabelHeight;
	const rowHeight = totalItemHeight + gap;
	const totalRows = Math.ceil(items.length / columns);
	const totalHeight = Math.max(0, totalRows * rowHeight - gap); // Remove last gap, ensure non-negative

	const startRow = Math.max(0, Math.floor(scrollTop / rowHeight) - overscan);
	const endRow = Math.min(totalRows, Math.ceil((scrollTop + containerHeight) / rowHeight) + overscan);

	const visibleItems = useMemo(() => {
		const startIndex = startRow * columns;
		const endIndex = Math.min(items.length, endRow * columns);
		return items.slice(startIndex, endIndex).map((item, idx) => ({
			item,
			index: startIndex + idx,
			row: Math.floor((startIndex + idx) / columns),
			col: (startIndex + idx) % columns,
		}));
	}, [items, startRow, endRow, columns]);

	return {
		totalHeight,
		visibleItems,
		startRow,
		rowHeight,
		onScroll: (e: React.UIEvent<HTMLDivElement>) => {
			setScrollTop(e.currentTarget.scrollTop);
		},
	};
}

// MarqueeLabel Component
interface MarqueeLabelProps {
	text: string;
	className?: string;
	style?: React.CSSProperties;
}

function MarqueeLabel({ text, className, style }: MarqueeLabelProps) {
	const containerRef = useRef<HTMLDivElement>(null);
	const textRef = useRef<HTMLSpanElement>(null);
	const [isOverflowing, setIsOverflowing] = useState(false);
	const [isHovered, setIsHovered] = useState(false);
	const [scrollDistance, setScrollDistance] = useState(0);

	useEffect(() => {
		const checkOverflow = () => {
			if (containerRef.current && textRef.current) {
				const containerWidth = containerRef.current.offsetWidth;
				const textWidth = textRef.current.scrollWidth;
				const overflowing = textWidth > containerWidth;
				setIsOverflowing(overflowing);

				if (overflowing) {
					// Calculate exact distance needed to reveal all hidden text
					const exactDistance = textWidth - containerWidth + 5; // Small padding for visual comfort
					setScrollDistance(exactDistance);
				}
			}
		};

		// Use a slight delay to ensure DOM is fully rendered
		const timer = setTimeout(checkOverflow, 10);

		window.addEventListener("resize", checkOverflow);
		return () => {
			clearTimeout(timer);
			window.removeEventListener("resize", checkOverflow);
		};
	}, [text]);
	const handleMouseEnter = () => setIsHovered(true);
	const handleMouseLeave = () => setIsHovered(false);

	// Calculate animation duration based on scroll distance for constant speed
	const animationDuration = useMemo(() => {
		if (!isOverflowing) return 0;
		// Faster speed: 40px per second for quicker back-and-forth motion
		return Math.max(2, scrollDistance / 40);
	}, [isOverflowing, scrollDistance]);

	return (
		<div
			ref={containerRef}
			className={cn("relative overflow-hidden", className)}
			onMouseEnter={handleMouseEnter}
			onMouseLeave={handleMouseLeave}
			style={style}
		>
			<span
				ref={textRef}
				className={cn("text-primary block font-medium whitespace-nowrap", !isOverflowing && "truncate")}
				style={{
					...style,
					...(isOverflowing &&
						isHovered &&
						({
							animation: `marquee ${animationDuration}s linear infinite`,
							animationFillMode: "both",
							"--scroll-distance": `-${scrollDistance}px`,
						} as React.CSSProperties & { "--scroll-distance"?: string })),
				}}
			>
				{text}
			</span>
		</div>
	);
}

interface GridSkeletonProps {
	count?: number;
	columns?: number;
	itemWidth?: number;
	itemHeight?: number;
	className?: string;
	style?: React.CSSProperties;
}

function GridSkeleton({
	count = 20,
	columns = 12,
	itemWidth = 120,
	itemHeight = 120,
	className,
	style,
}: GridSkeletonProps) {
	return (
		<div
			className={cn("grid justify-center gap-3", className)}
			style={{
				gridTemplateColumns: `repeat(${columns}, ${itemWidth}px)`,
				...style,
			}}
		>
			{Array.from({ length: count }).map((_, i) => (
				<div
					key={i}
					className="border-muted bg-muted/20 flex-shrink-0 rounded-lg border-2"
					style={{ width: itemWidth, height: itemHeight }}
				>
					<div className="bg-muted/40" style={{ width: itemWidth, height: itemHeight }} />
					<div className="p-2">
						<div className="bg-muted/60 h-3 rounded" />
					</div>
				</div>
			))}
		</div>
	);
}

interface GridFiltersProps {
	filters: FilterOption[];
	selectedFilter?: string;
	onFilterChange: (filter: string) => void;
}

function GridFilters({ filters, selectedFilter, onFilterChange }: GridFiltersProps) {
	if (filters.length === 0) return null;

	return (
		<div className="grid grid-cols-[repeat(auto-fit,minmax(100px,1fr))] gap-2 pb-4">
			{filters.map((filter) => (
				<Button
					key={filter.value}
					variant={selectedFilter === filter.value ? "default" : "ghost"}
					size="sm"
					className={`min-h-[32px] w-full cursor-pointer px-3 py-2 text-sm ${
						selectedFilter === filter.value
							? "bg-primary text-primary-foreground hover:bg-primary/90"
							: "bg-button text-primary hover:bg-buttonhover"
					}`}
					onClick={() => onFilterChange(filter.value)}
				>
					{filter.label}
				</Button>
			))}
		</div>
	);
}

export interface GridItemProps<T extends BaseItem> {
	item: T;
	isEquipped?: boolean;
	isSelected?: boolean;
	onClick?: (item: T) => void;
	imageBasePath: string;
	className?: string;
	itemWidth?: number;
	itemHeight?: number;
}

export function GridItem<T extends BaseItem>({
	item,
	isEquipped = false,
	isSelected = false,
	onClick,
	imageBasePath,
	className,
	itemWidth = 120,
	itemHeight = 120,
}: GridItemProps<T>) {
	const [imageLoaded, setImageLoaded] = useState(false);
	const [imageError, setImageError] = useState(false);

	const imageUrl = useMemo(() => {
		return item.imagePath ? `${CDN}/${imageBasePath}/${item.imagePath.replace(".dds", ".png")}` : null;
	}, [item.imagePath, imageBasePath]);

	const handleClick = useCallback(
		(e: React.MouseEvent) => {
			e.preventDefault();
			onClick?.(item);
		},
		[onClick, item]
	);

	// Calculate scaled label height with consistent px-based scaling
	const baseFactor = itemWidth / 120; // Base width is 120
	const scaleFactor = Math.min(1.3, Math.max(0.8, baseFactor)); // Constrain scaling range
	const scaledFontSize = Math.max(10, Math.min(14, 12 * scaleFactor)); // Cap font size at 14px
	const scaledLineHeight = scaledFontSize + 2;
	const scaledPadding = Math.max(4, Math.min(8, 6 * scaleFactor)); // Use px instead of vh
	const scaledLabelHeight = Math.max(24, scaledLineHeight + scaledPadding * 2);

	return (
		<div
			className={cn(
				"group bg-card relative flex-shrink-0 cursor-pointer overflow-hidden rounded-lg border-2",
				"hover:border-primary/50 hover:shadow-md",
				isSelected && "border-yellow-500 shadow-yellow-500/30",
				!isSelected && isEquipped && "border-yellow-400 shadow-lg shadow-yellow-400/20",
				!isSelected && !isEquipped && "border-muted",
				item.locked && "opacity-60",
				className
			)}
			style={{ width: itemWidth, height: itemHeight + scaledLabelHeight }}
			onClick={handleClick}
		>
			{/* Image container */}
			<div className="bg-muted/20 relative overflow-hidden" style={{ width: itemWidth, height: itemHeight }}>
				{/* Placeholder */}
				<div
					className={cn("bg-muted/30 absolute inset-0", !imageLoaded && "animate-pulse")}
					style={{ width: itemWidth, height: itemHeight }}
				/>

				{/* Actual image */}
				{imageUrl && !imageError && (
					<img
						src={imageUrl}
						alt={item.label}
						className={cn(
							"absolute inset-0 object-contain p-2 transition-opacity duration-300",
							imageLoaded ? "opacity-100" : "opacity-0",
							item.locked && "grayscale group-hover:grayscale-[50%]"
						)}
						style={{ width: itemWidth, height: itemHeight }}
						loading="lazy"
						onLoad={() => setImageLoaded(true)}
						onError={() => setImageError(true)}
					/>
				)}

				{/* Status badges */}
				{item.locked ? (
					<div
						className="absolute flex items-center justify-center rounded-full bg-black/60 text-white"
						style={{
							top: Math.max(4, itemHeight * 0.05),
							right: Math.max(4, itemWidth * 0.05),
							width: Math.max(16, Math.min(24, itemWidth * 0.15)),
							height: Math.max(16, Math.min(24, itemWidth * 0.15)),
							padding: `0 ${Math.max(2, itemWidth * 0.1)}px`,
							fontSize: Math.max(10, Math.min(14, itemWidth * 0.08)),
						}}
					>
						🔒
					</div>
				) : null}
				{isEquipped && (
					<div
						className="absolute flex items-center justify-center rounded-full bg-yellow-500 font-medium text-white"
						style={{
							top: Math.max(4, itemHeight * 0.05),
							right: Math.max(4, itemWidth * 0.05),
							minWidth: Math.max(16, Math.min(24, itemWidth * 0.15)),
							height: Math.max(16, Math.min(24, itemWidth * 0.15)),
							padding: `0 ${Math.max(2, itemWidth * 0.1)}px`,
							fontSize: Math.max(10, Math.min(14, itemWidth * 0.08)),
						}}
					>
						✓
					</div>
				)}
			</div>

			{/* Label */}
			<div
				className="flex items-center justify-center text-center"
				style={{
					height: scaledLabelHeight,
					padding: `${scaledPadding}px`,
				}}
			>
				<MarqueeLabel
					text={item.label}
					className="w-full"
					style={{
						fontSize: `${scaledFontSize}px`,
						lineHeight: `${scaledLineHeight}px`,
					}}
				/>
			</div>
		</div>
	);
}

export interface GridProps<T extends BaseItem> {
	// Core data
	items: T[];
	equippedItemIds?: Set<number>;
	selectedItemId?: number | null;
	loading?: boolean;
	imageBasePath: string;
	onItemClick?: (item: T) => void;

	// Preview and action handlers
	onEquip?: (item: T) => void;
	onUnlock?: (item: T) => void;
	hasChanges?: boolean;
	customPreview?: (item: T) => React.ReactNode;

	// Layout options
	layout?: "split" | "stacked";
	hidePreview?: boolean;

	// Grid configuration
	itemWidth?: number;
	itemHeight?: number;
	maxColumns?: number;
	minColumns?: number;
	gap?: number;

	// Filtering
	filters?: FilterOption[];
	selectedFilter?: string;
	onFilterChange?: (filter: string) => void;

	// Styling
	className?: string;
	containerClassName?: string;
	gridClassName?: string;
}

function useContainerAwareColumns(
	containerRef: React.RefObject<HTMLDivElement | null>,
	baseItemWidth: number,
	baseItemHeight: number,
	gap: number,
	maxColumns: number,
	minColumns: number
) {
	// Calculate initial columns based on window width for better initial render
	const getInitialColumns = () => {
		if (typeof window === "undefined") return minColumns;
		const estimatedContainerWidth = window.innerWidth * 0.8; // Estimate 80% of viewport
		const calculatedColumns = Math.floor((estimatedContainerWidth + gap) / (baseItemWidth + gap));
		return Math.max(minColumns, Math.min(maxColumns, calculatedColumns));
	};

	const [columns, setColumns] = useState(getInitialColumns());
	const [scaledItemWidth, setScaledItemWidth] = useState(baseItemWidth);
	const [scaledItemHeight, setScaledItemHeight] = useState(baseItemHeight);

	useEffect(() => {
		if (!containerRef.current) return;

		const resizeObserver = new ResizeObserver((entries) => {
			for (const entry of entries) {
				const containerWidth = entry.contentRect.width;
				// Calculate columns based on container width, accounting for gaps
				const calculatedColumns = Math.floor((containerWidth + gap) / (baseItemWidth + gap));

				// Calculate scaled item dimensions to maintain aspect ratio
				let newItemWidth = baseItemWidth;
				let newItemHeight = baseItemHeight;
				let finalColumns = calculatedColumns;

				if (calculatedColumns < minColumns) {
					// Scale up items when we have fewer columns than minimum
					const availableWidth = containerWidth - (minColumns - 1) * gap;
					newItemWidth = Math.max(baseItemWidth, availableWidth / minColumns);
					// Maintain aspect ratio
					const scaleFactor = newItemWidth / baseItemWidth;
					newItemHeight = baseItemHeight * scaleFactor;
					finalColumns = minColumns;
				} else if (calculatedColumns > maxColumns) {
					// Scale up items when we would exceed maximum columns
					const availableWidth = containerWidth - (maxColumns - 1) * gap;
					newItemWidth = Math.max(baseItemWidth, Math.min(availableWidth / maxColumns, baseItemWidth * 1.1));
					// Maintain aspect ratio
					const scaleFactor = newItemWidth / baseItemWidth;
					newItemHeight = baseItemHeight * scaleFactor;
					finalColumns = maxColumns;
				} else {
					// Within min/max range - minimal scaling to prevent zoom issues
					const availableWidth = containerWidth - (calculatedColumns - 1) * gap;
					const maxPossibleWidth = availableWidth / calculatedColumns;
					// Very conservative scaling
					newItemWidth = Math.min(maxPossibleWidth, baseItemWidth * 1.05);
					// Maintain aspect ratio
					const scaleFactor = newItemWidth / baseItemWidth;
					newItemHeight = baseItemHeight * scaleFactor;
					finalColumns = calculatedColumns;
				}

				setColumns(finalColumns);
				// More restrictive scaling to prevent zoom issues
				setScaledItemWidth(Math.max(baseItemWidth * 0.8, Math.min(baseItemWidth * 1.3, newItemWidth)));
				setScaledItemHeight(Math.max(baseItemHeight * 0.8, Math.min(baseItemHeight * 1.3, newItemHeight)));
			}
		});

		resizeObserver.observe(containerRef.current);

		return () => {
			resizeObserver.disconnect();
		};
	}, [containerRef, baseItemWidth, baseItemHeight, gap, maxColumns, minColumns]);

	return { columns, scaledItemWidth, scaledItemHeight };
}

export function Grid<T extends BaseItem>({
	items,
	equippedItemIds,
	selectedItemId,
	loading = false,
	layout = "stacked",
	hidePreview = false,
	itemWidth = 120,
	itemHeight = 120,
	maxColumns = 12,
	minColumns = 1,
	gap = 12,
	filters,
	selectedFilter,
	onFilterChange,
	imageBasePath,
	onItemClick,
	onEquip,
	onUnlock,
	hasChanges = false,
	customPreview,
	className,
	containerClassName,
	gridClassName,
}: GridProps<T>) {
	const gridContainerRef = useRef<HTMLDivElement>(null);
	const [actualContainerHeight, setActualContainerHeight] = useState(400);
	const { columns, scaledItemWidth, scaledItemHeight } = useContainerAwareColumns(
		gridContainerRef,
		itemWidth,
		itemHeight,
		gap,
		maxColumns,
		minColumns
	);

	// Generate preview from selected item
	const selectedItem = useMemo(() => {
		return items.find((item) => item.id === selectedItemId);
	}, [items, selectedItemId]);

	const handleEquipClick = useCallback(() => {
		if (!selectedItem) return;

		if (selectedItem.locked) {
			if (onUnlock) {
				onUnlock(selectedItem);
			}
		} else {
			if (onEquip) {
				onEquip(selectedItem);
			}
		}
	}, [selectedItem, onEquip, onUnlock]);

	const preview =
		!hidePreview &&
		selectedItem &&
		(() => {
			// Use custom preview if provided
			if (customPreview) {
				return customPreview(selectedItem);
			}

			// Default preview
			return (
				<div className="mb-4 flex h-fit flex-col items-center justify-center">
					<h3 className={`text-primary py-2 text-center text-xl font-semibold ${className || ""}`}>{selectedItem.label}</h3>
					<div style={{ maxWidth: "100%" }}>
						<img
							src={`${CDN}/${imageBasePath}/${selectedItem.imagePath?.replace(".dds", ".png") || ""}`}
							alt={selectedItem.label}
							className="mx-auto mb-2"
							style={{
								width: scaledItemWidth * 1.5,
								height: scaledItemHeight * 1.5,
								objectFit: "contain",
								borderRadius: "0.5rem",
								boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
							}}
						/>
					</div>

					{(onEquip || onUnlock) && (
						<Button onClick={handleEquipClick} disabled={!hasChanges} variant="default" className="text-sm">
							{selectedItem.locked ? "Unlock" : "Equip"}
						</Button>
					)}
				</div>
			);
		})();

	// Monitor container height for virtual scrolling
	useEffect(() => {
		if (!gridContainerRef.current) return;

		const resizeObserver = new ResizeObserver((entries) => {
			for (const entry of entries) {
				setActualContainerHeight(entry.contentRect.height);
			}
		});

		resizeObserver.observe(gridContainerRef.current);
		return () => resizeObserver.disconnect();
	}, []);

	const { totalHeight, visibleItems, startRow, rowHeight, onScroll } = useVirtualGrid({
		items,
		containerHeight: actualContainerHeight,
		itemHeight: scaledItemHeight,
		itemWidth: scaledItemWidth,
		columns,
		gap,
	});

	const gridContent = (
		<div className={cn("bg-card flex flex-1 flex-col rounded-xl p-4", containerClassName)} style={{ minHeight: 0 }}>
			{/* Filters */}
			{filters && onFilterChange && (
				<div className="mb-4 flex-shrink-0">
					<GridFilters filters={filters} selectedFilter={selectedFilter} onFilterChange={onFilterChange} />
				</div>
			)}

			{/* Virtual Scrolling Grid Container */}
			<div
				ref={gridContainerRef}
				className="m-4 flex-1 overflow-hidden"
				onScroll={onScroll}
				style={{
					scrollbarWidth: "thin",
					scrollbarColor: "#cbd5e1 #f1f5f9",
					overflowY: "auto",
					minHeight: 0, // Important: allows flex child to shrink below content size
				}}
			>
				{loading ? (
					<GridSkeleton
						columns={columns}
						count={columns * 3}
						itemWidth={scaledItemWidth}
						itemHeight={scaledItemHeight}
						className={gridClassName}
					/>
				) : (
					<div
						style={{
							height: totalHeight,
							position: "relative",
						}}
					>
						<div
							className={cn("grid justify-center", gridClassName)}
							style={{
								gridTemplateColumns: `repeat(${columns}, ${scaledItemWidth}px)`,
								gap: `${gap}px`,
								maxWidth: `${columns * scaledItemWidth + (columns - 1) * gap}px`,
								margin: "0 auto",
								position: "absolute",
								top: startRow * rowHeight,
								left: "50%",
								transform: "translateX(-50%)",
							}}
						>
							{visibleItems.map(({ item }) => (
								<GridItem
									key={item.id}
									item={item}
									isEquipped={equippedItemIds?.has(item.id)}
									isSelected={selectedItemId === item.id}
									onClick={onItemClick}
									imageBasePath={imageBasePath}
									itemWidth={scaledItemWidth}
									itemHeight={scaledItemHeight}
								/>
							))}
						</div>
					</div>
				)}
			</div>
		</div>
	);

	if (layout === "split" && preview) {
		return (
			<div className={cn("flex h-full w-full flex-row", className)}>
				{preview}
				{gridContent}
			</div>
		);
	}

	return (
		<div className={cn("flex h-full w-full flex-col", className)}>
			{preview || null}
			{gridContent}
		</div>
	);
}
