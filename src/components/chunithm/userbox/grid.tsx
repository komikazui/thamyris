import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { ChevronLeft, ChevronRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CDN } from "@/lib/constants";
import { cn } from "@/lib/utils";

// Types
export interface BaseItem {
	id: number;
	imagePath: string;
	label: string;
	locked: boolean;
}

export interface PaginationInfo {
	page: number;
	limit: number;
	total: number;
	totalPages: number;
	hasNext: boolean;
	hasPrev: boolean;
}

export interface FilterOption {
	value: string;
	label: string;
}

// MarqueeLabel Component
interface MarqueeLabelProps {
	text: string;
	className?: string;
}

function MarqueeLabel({ text, className }: MarqueeLabelProps) {
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
		>
			<span
				ref={textRef}
				className={cn("text-primary block text-xs leading-4 font-medium whitespace-nowrap", !isOverflowing && "truncate")}
				style={{
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
	columns = 6,
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
					className="border-muted bg-muted/20 flex-shrink-0 animate-pulse rounded-lg border-2"
					style={{ width: itemWidth, height: itemHeight + 32 }}
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
		<div className="flex flex-wrap gap-2 pb-4">
			{filters.map((filter) => (
				<Button
					key={filter.value}
					variant={selectedFilter === filter.value ? "default" : "ghost"}
					size="sm"
					className="bg-button text-primary hover:bg-buttonhover cursor-pointer"
					onClick={() => onFilterChange(filter.value)}
				>
					{filter.label}
				</Button>
			))}
		</div>
	);
}

interface GridPaginationProps {
	pagination: PaginationInfo;
	onPageChange: (page: number) => void;
	onPageSizeChange?: (pageSize: number) => void;
	pageSizeOptions?: number[];
	loading?: boolean;
}

function GridPagination({
	pagination,
	onPageChange,
	onPageSizeChange,
	pageSizeOptions = [12, 24, 48, 96],
	loading,
}: GridPaginationProps) {
	if (pagination.totalPages <= 1 && !onPageSizeChange) return null;

	const { page, totalPages, hasNext, hasPrev, limit, total } = pagination;

	const getVisiblePages = useMemo(() => {
		if (totalPages <= 5) {
			return Array.from({ length: totalPages }, (_, i) => i + 1);
		}

		if (page <= 3) return [1, 2, 3, 4, 5];
		if (page >= totalPages - 2) return Array.from({ length: 5 }, (_, i) => totalPages - 4 + i);
		return Array.from({ length: 5 }, (_, i) => page - 2 + i);
	}, [page, totalPages]);

	return (
		<div className="flex items-center justify-between gap-4 pt-4">
			{/* Page Size Selector */}
			{onPageSizeChange && (
				<div className="flex items-center gap-2">
					<span className="text-primary text-sm">Show:</span>
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button
								size="sm"
								disabled={loading}
								className="bg-button text-primary hover:bg-buttonhover cursor-pointer hover:cursor-pointer"
							>
								{limit} per page
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent className="bg-dropdown">
							{pageSizeOptions.map((size) => (
								<DropdownMenuItem
									key={size}
									onClick={() => onPageSizeChange(size)}
									className="bg-dropdown focus:bg-dropdownhover cursor-pointer"
								>
									{size} per page
								</DropdownMenuItem>
							))}
						</DropdownMenuContent>
					</DropdownMenu>
				</div>
			)}

			{/* Page Navigation */}
			{totalPages > 1 && (
				<div className="text-primary flex items-center gap-2">
					<Button
						className="bg-button text-primary hover:bg-buttonhover cursor-pointer"
						size="sm"
						onClick={() => onPageChange(page - 1)}
						disabled={!hasPrev || loading}
					>
						<ChevronLeft className="h-4 w-4" />
					</Button>

					<div className="flex gap-1">
						{getVisiblePages.map((pageNum) => (
							<Button
								key={pageNum}
								size="sm"
								onClick={() => onPageChange(pageNum)}
								disabled={pageNum === page || loading}
								className="bg-button text-primary hover:bg-buttonhover min-w-[2.5rem] cursor-pointer"
							>
								{pageNum}
							</Button>
						))}
					</div>

					<Button
						className="bg-button text-primary hover:bg-buttonhover cursor-pointer"
						size="sm"
						onClick={() => onPageChange(page + 1)}
						disabled={!hasNext || loading}
					>
						<ChevronRight className="h-4 w-4" />
					</Button>
				</div>
			)}

			{/* Total Count */}
			{total > 0 && <div className="text-primary text-sm">{total} total items</div>}
		</div>
	);
}

export interface GridItemProps<T extends BaseItem> {
	item: T;
	isEquipped?: boolean;
	onClick?: (item: T) => void;
	imageBasePath: string;
	className?: string;
	itemWidth?: number;
	itemHeight?: number;
}

export interface GridItemProps<T extends BaseItem> {
	item: T;
	isEquipped?: boolean;
	onClick?: (item: T) => void;
	imageBasePath: string;
	className?: string;
	itemWidth?: number;
	itemHeight?: number;
}

export function GridItem<T extends BaseItem>({
	item,
	isEquipped = false,
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

	return (
		<div
			className={cn(
				"group bg-card relative flex-shrink-0 cursor-pointer overflow-hidden rounded-lg border-2 transition-all duration-200",
				"hover:border-primary/50 hover:shadow-md",
				isEquipped && "border-yellow-500 shadow-yellow-500/20",
				item.locked && "opacity-60",
				className
			)}
			style={{ width: itemWidth, height: itemHeight + 32 }}
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
				{item.locked ? <div className="absolute top-1 right-1 rounded-full bg-black/60 p-1 text-xs">🔒</div> : null}
				{isEquipped && (
					<div className="absolute top-1 left-1 rounded-full bg-yellow-500 px-2 py-0.5 text-xs font-medium text-white">
						✓
					</div>
				)}
			</div>

			{/* Label */}
			<div className="p-2 text-center">
				<MarqueeLabel text={item.label} />
			</div>
		</div>
	);
}

export interface GridProps<T extends BaseItem> {
	// Core data
	items: T[];
	equippedItemIds?: Set<number>;
	loading?: boolean;
	imageBasePath: string;
	onItemClick?: (item: T) => void;

	// Layout options
	layout?: "split" | "stacked";
	preview?: React.ReactNode;

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

	// Pagination
	pagination?: PaginationInfo;
	onPageChange?: (page: number) => void;
	onPageSizeChange?: (pageSize: number) => void;
	pageSizeOptions?: number[];

	// Styling
	className?: string;
	containerClassName?: string;
	gridClassName?: string;
}

function useContainerAwareColumns(
	containerRef: React.RefObject<HTMLDivElement | null>,
	itemWidth: number,
	gap: number,
	maxColumns: number,
	minColumns: number
) {
	const [columns, setColumns] = useState(minColumns);

	useEffect(() => {
		if (!containerRef.current) return;

		const resizeObserver = new ResizeObserver((entries) => {
			for (const entry of entries) {
				const containerWidth = entry.contentRect.width;
				// Calculate columns based on container width, accounting for gaps
				const calculatedColumns = Math.floor((containerWidth + gap) / (itemWidth + gap));
				const finalColumns = Math.max(minColumns, Math.min(maxColumns, calculatedColumns));
				setColumns(finalColumns);
			}
		});

		resizeObserver.observe(containerRef.current);

		return () => {
			resizeObserver.disconnect();
		};
	}, [containerRef, itemWidth, gap, maxColumns, minColumns]);

	return columns;
}

export function Grid<T extends BaseItem>({
	items,
	equippedItemIds,
	loading = false,
	layout = "stacked",
	preview,
	itemWidth = 120,
	itemHeight = 120,
	maxColumns = 12,
	minColumns = 2,
	gap = 12,
	filters,
	selectedFilter,
	onFilterChange,
	pagination,
	onPageChange,
	onPageSizeChange,
	pageSizeOptions,
	imageBasePath,
	onItemClick,
	className,
	containerClassName,
	gridClassName,
}: GridProps<T>) {
	const gridContainerRef = useRef<HTMLDivElement>(null);
	const columns = useContainerAwareColumns(gridContainerRef, itemWidth, gap, maxColumns, minColumns);

	const gridContent = (
		<div className={cn("bg-card flex h-fit flex-col rounded-md p-4 md:p-6", containerClassName)}>
			{/* Filters */}
			{filters && onFilterChange && (
				<GridFilters filters={filters} selectedFilter={selectedFilter} onFilterChange={onFilterChange} />
			)}

			{/* Grid Container */}
			<div ref={gridContainerRef} className="min-h-0 flex-1 overflow-auto">
				{loading ? (
					<GridSkeleton
						columns={columns}
						count={columns * 3}
						itemWidth={itemWidth}
						itemHeight={itemHeight}
						className={gridClassName}
					/>
				) : (
					<div
						className={cn("grid justify-center", gridClassName)}
						style={{
							gridTemplateColumns: `repeat(${columns}, ${itemWidth}px)`,
							gap: `${gap}px`,
							maxWidth: `${columns * itemWidth + (columns - 1) * gap}px`,
							margin: "0 auto",
						}}
					>
						{items.map((item) => (
							<GridItem
								key={item.id}
								item={item}
								isEquipped={equippedItemIds?.has(item.id)}
								onClick={onItemClick}
								imageBasePath={imageBasePath}
								itemWidth={itemWidth}
								itemHeight={itemHeight}
							/>
						))}
					</div>
				)}
			</div>

			{/* Pagination */}
			{pagination && onPageChange && (
				<GridPagination
					pagination={pagination}
					onPageChange={onPageChange}
					onPageSizeChange={onPageSizeChange}
					pageSizeOptions={pageSizeOptions}
					loading={loading}
				/>
			)}
		</div>
	);

	if (layout === "split" && preview) {
		return (
			<div className={cn("h-full w-full", className)}>
				<div className="flex h-full flex-col gap-4 lg:flex-row">
					{preview}
					{gridContent}
				</div>
			</div>
		);
	}

	return (
		<div className={cn("h-full w-full", className)}>
			{preview && <div className="mb-4 flex h-80 items-center justify-center">{preview}</div>}
			{gridContent}
		</div>
	);
}
