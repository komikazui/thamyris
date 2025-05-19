import React, { useRef, useState } from "react";

import * as htmlToImage from "html-to-image";
import { Download, Loader2, Star } from "lucide-react";

import { cdnUrl } from "@/lib/constants";

interface SearchProps {
	value?: string;
}

interface GridProps<T> {
	data: T[];
	onSearch: (search: SearchProps) => void;
	title?: string;
	renderItem: (item: T, index: number) => React.ReactNode;
}

// Generic grid component for displaying card-based layouts
const GridComponent: React.FC<GridProps<any>> = ({ data, onSearch, title, renderItem }) => {
	const gridRef = useRef<HTMLDivElement>(null);
	const [isExporting, setIsExporting] = useState(false);

	const exportAsImage = async () => {
		if (!gridRef.current) return;

		setIsExporting(true);
		try {
			// Use toCanvas method which has better font handling
			const canvas = await htmlToImage.toCanvas(gridRef.current, {
				quality: 1.0,
				pixelRatio: 2,
				// Skip font handling which causes the error
				fontEmbedCSS: "",
				skipFonts: true,
			});

			// Convert canvas to blob/data URL manually to avoid font processing issues
			const dataUrl = canvas.toDataURL("image/png");

			// Create download link
			const link = document.createElement("a");
			link.download = `${title || "grid"}-export-${new Date().toISOString().split("T")[0]}.png`;
			link.href = dataUrl;
			link.click();
		} catch (error) {
			console.error("Error exporting grid as image:", error);
			alert("Failed to export image. Check the console for details.");
		} finally {
			setIsExporting(false);
		}
	};

	return (
		<div className="bg-card w-full rounded-md p-2 sm:p-4">
			<div className="mb-4 flex items-center justify-between">
				{title && <h2 className="text-primary text-xl font-semibold">{title}</h2>}
				<button
					onClick={exportAsImage}
					className="bg-primary text-primary-foreground hover:bg-primary/90 flex items-center gap-1 rounded-md px-3 py-1 text-sm"
				>
					{isExporting ? <Loader2 size={16} /> : <Download size={16} />}
					<span>{isExporting ? "Exporting..." : "Export"}</span>
				</button>
			</div>

			<div className="mb-4">
				<input
					type="text"
					placeholder="Search..."
					onChange={(e) => onSearch({ value: e.target.value })}
					className="text-primary border-border w-full rounded-md border px-3 py-2"
				/>
			</div>

			<div ref={gridRef} className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
				{data.length > 0 ? (
					data.map((item, index) => renderItem(item, index))
				) : (
					<div className="text-primary col-span-full py-8 text-center">No data available</div>
				)}
			</div>
		</div>
	);
};

export const ScoreGrid = (props: {
	item: any;
	gameType: "ongeki" | "chunithm";
	// Common props
	getDifficulty: (chartId: number) => string;
	// Ongeki specific props
	getComboStatus?: (isFullCombo: number, isAllBreake: number, isFullBell: number, techScoreMax: number) => string | null;
	getOngekiRating?: (level: number, techScoreMax: number) => number;
	getOngekiGekForceRating?: (
		level: number,
		techScoreMax: number,
		isFullCombo: number,
		isAllBreake: number,
		isFullBell: number
	) => number;
	isRefreshOrAbove?: boolean;
	getChunithmComboStatus?: (isFullCombo: number, isAllJustice: number) => string | null;
	// Chunithm specific props
	getChunithmRating?: (level: number, score: number) => number;
	isVerseOrAbove?: boolean;
}) => {
	const {
		item,
		gameType,
		getDifficulty,
		getComboStatus,
		getOngekiRating,
		getOngekiGekForceRating,
		isRefreshOrAbove,
		getChunithmRating,
		getChunithmComboStatus,
	} = props;

	const getImagePath = () => {
		if (gameType === "ongeki") {
			return `${cdnUrl}/ongeki/jacket/${item.jacketPath}`;
		} else if (gameType === "chunithm") {
			return `${cdnUrl}/chunithm/jacket/${item.jacketPath?.replace(".dds", ".png")}`;
		}
		return "";
	};

	const getLevelDisplay = () => {
		if (gameType === "ongeki") {
			return `Lv.${item.level}`;
		} else if (gameType === "chunithm") {
			return `Lv.${item.level?.toFixed(1)}`;
		}
		return "";
	};

	return (
		<div className="bg-cardforeground rounded-md p-4 shadow-md transition-shadow hover:shadow-lg">
			<div className="mb-2 flex items-center gap-3">
				<img width={60} height={60} src={getImagePath()} className="flex-shrink-0 rounded-md" alt={item.title} />
				<div className="flex flex-col overflow-hidden">
					<span className="text-primary truncate font-semibold">{item.title}</span>
				</div>
			</div>

			{/* Display Difficulty and Level more prominently */}
			<div className="mb-3 flex justify-between border-b border-gray-700 pb-2">
				<span className="text-primary font-medium">{getDifficulty(item.chartId ?? 0)}</span>
				<span className="text-primary-foreground bg-primary rounded-sm px-2 py-0.5 text-sm font-medium">
					{getLevelDisplay()}
				</span>
			</div>

			<div className="mt-2 grid grid-cols-2 gap-2 text-sm">
				{/* Ongeki specific data */}
				{gameType === "ongeki" && (
					<>
						{item.hasTechScore && (
							<div className="flex flex-col">
								<span className="text-gray-400">Technical Score</span>
								<span className="text-primary">{item.techScoreMax?.toLocaleString() ?? "-"}</span>
							</div>
						)}

						{item.hasLamp && getComboStatus && (
							<div className="flex flex-col">
								<span className="text-gray-400">Lamp</span>
								<span
									className={
										getComboStatus(item.isFullCombo ?? 0, item.isAllBreake ?? 0, item.isFullBell ?? 0, item.techScoreMax ?? 0) ===
										"AB/FB"
											? "text-yellow-400"
											: getComboStatus(
														item.isFullCombo ?? 0,
														item.isAllBreake ?? 0,
														item.isFullBell ?? 0,
														item.techScoreMax ?? 0
												  ) === "FC/FB"
												? "text-orange-400"
												: getComboStatus(
															item.isFullCombo ?? 0,
															item.isAllBreake ?? 0,
															item.isFullBell ?? 0,
															item.techScoreMax ?? 0
													  ) === "AB+"
													? "text-pink-400"
													: getComboStatus(
																item.isFullCombo ?? 0,
																item.isAllBreake ?? 0,
																item.isFullBell ?? 0,
																item.techScoreMax ?? 0
														  ) === "AB"
														? "text-purple-400"
														: getComboStatus(
																	item.isFullCombo ?? 0,
																	item.isAllBreake ?? 0,
																	item.isFullBell ?? 0,
																	item.techScoreMax ?? 0
															  ) === "FC"
															? "text-cyan-400"
															: getComboStatus(
																		item.isFullCombo ?? 0,
																		item.isAllBreake ?? 0,
																		item.isFullBell ?? 0,
																		item.techScoreMax ?? 0
																  ) === "FB"
																? "text-orange-400"
																: "text-gray-200"
									}
								>
									{getComboStatus(item.isFullCombo ?? 0, item.isAllBreake ?? 0, item.isFullBell ?? 0, item.techScoreMax ?? 0) ||
										"-"}
								</span>
							</div>
						)}

						{item.hasRate && getOngekiRating && getOngekiGekForceRating && (
							<div className="flex flex-col">
								<span className="text-gray-400">Rate</span>
								<span className="text-primary">
									{item.techScoreMax
										? isRefreshOrAbove
											? (
													getOngekiGekForceRating(
														item.level ?? 0,
														item.techScoreMax ?? 0,
														item.isFullCombo ?? 0,
														item.isAllBreake ?? 0,
														item.isFullBell ?? 0
													) / 1000
												).toFixed(3)
											: (getOngekiRating(item.level ?? 0, item.techScoreMax ?? 0) / 100).toFixed(2)
										: "-"}
								</span>
							</div>
						)}

						{item.hasPscore && (
							<div className="flex flex-col">
								<span className="text-gray-400">P-Score</span>
								<span className="text-primary">
									{item.platinumScoreMax && item.noteCount
										? `${(item.platinumScoreMax ?? 0).toLocaleString()} / ${(item.noteCount * 2).toLocaleString()}`
										: "-"}
								</span>
							</div>
						)}

						{item.hasRating && (
							<div className="flex flex-col">
								<span className="text-gray-400">Rating</span>
								<span className="text-primary">
									{item.platinumScoreStar && item.level
										? (((item.level ?? 0) * (item.level ?? 0) * (item.platinumScoreStar ?? 0)) / 1000).toFixed(3)
										: "-"}
								</span>
							</div>
						)}

						{item.hasStars && item.platinumScoreStar > 0 && (
							<div className="flex flex-col">
								<span className="text-primary">Stars</span>
								<div className="flex flex-wrap items-center">
									{Array.from({ length: Math.min(item.platinumScoreStar, 5) }, (_, i) => (
										<Star key={i} className="text-yellow-300" size={16} />
									))}
									{item.platinumScoreStar > 5 && (
										<span className="ml-1 text-sm text-yellow-300">+{item.platinumScoreStar - 5}</span>
									)}
								</div>
							</div>
						)}
					</>
				)}

				{/* Chunithm specific data */}
				{gameType === "chunithm" && (
					<>
						{item.hasScore && (
							<div className="flex flex-col">
								<span className="text-gray-400">Score</span>
								<span className="text-primary">{item.score?.toLocaleString() ?? "-"}</span>
							</div>
						)}

						{item.hasLamp && getChunithmComboStatus && (
							<div className="flex flex-col">
								<span className="text-primary">Combo Lamp</span>
								{(() => {
									const comboStatus = getChunithmComboStatus(item.isFullCombo ?? 0, item.isAllJustice ?? 0);
									if (!comboStatus) return <span className="text-primary">-</span>;

									let colorClass = "text-gray-200";
									if (comboStatus.includes("FC")) {
										colorClass = "text-cyan-400";
									} else if (comboStatus.includes("AJ")) {
										colorClass = "text-yellow-400";
									}
									return <span className={colorClass}>{comboStatus}</span>;
								})()}
							</div>
						)}

						{item.hasRating && getChunithmRating && (
							<div className="flex flex-col">
								<span className="text-primary">Rating</span>
								<span className="text-primary">{((getChunithmRating(item.level!, item.score!) ?? 0) / 100).toFixed(2)}</span>
							</div>
						)}
					</>
				)}
			</div>
		</div>
	);
};

export default GridComponent;
