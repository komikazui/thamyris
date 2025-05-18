import React from "react";

import { cdnUrl } from "@/lib/constants";
import { ChunitmRating, getChunithmComboStatus, getDifficultyFromChunithmChart } from "@/utils/helpers";

export interface ChunithmRatingData {
	title: string;
	score?: number;
	noteCount?: number;
	level?: number;
	difficulty?: string;
	playerRating?: number;
	highestRating?: number;
	chartId?: number;
	jacketPath: string;
	source?: string;
	hasScore?: boolean;
	hasRating?: boolean;
	hasType?: boolean;
	hasLamp?: boolean;
	isFullCombo?: number;
	isClear?: number;
	isAllJustice?: number;
}

export const ratingTable = {
	Song: (row: ChunithmRatingData) => (
		<div className="flex items-center gap-3">
			<img
				width={40}
				height={40}
				src={`${cdnUrl}/chunithm/jacket/${row.jacketPath?.replace(".dds", ".png")}`}
				alt={row.title}
				className="flex-shrink-0"
			/>
			<span className="text-primary truncate">{row.title}</span>
		</div>
	),
	Difficulty: (row: ChunithmRatingData) => getDifficultyFromChunithmChart(row.chartId ?? 0),
	Level: (row: ChunithmRatingData) => row.level,

	"Combo Lamp": (row: ChunithmRatingData) => {
		const comboStatus = getChunithmComboStatus(row.isFullCombo ?? 0, row.isAllJustice ?? 0);
		if (comboStatus) {
			let colorClass = "text-gray-200";
			if (comboStatus.includes("FC")) {
				colorClass = "text-cyan-400";
			} else if (comboStatus.includes("AJ")) {
				colorClass = "text-yellow-400";
			}
			return <span className={colorClass}>{comboStatus}</span>;
		}
		return "-";
	},
	Score: (row: ChunithmRatingData) => row.score?.toLocaleString(),
	Rating: (row: ChunithmRatingData) => ((ChunitmRating(row.level!, row.score!) ?? 0) / 100).toFixed(2),
};

export const recommendedTable = {
	Song: (row: ChunithmRatingData) => (
		<div className="flex items-center gap-3">
			<img
				width={40}
				height={40}
				src={`${cdnUrl}/chunithm/jacket/${row.jacketPath?.replace(".dds", ".png")}`}
				alt={row.title}
				className="flex-shrink-0"
			/>
			<span className="text-primary truncate">{row.title}</span>
		</div>
	),
	Difficulty: (row: ChunithmRatingData) => getDifficultyFromChunithmChart(row.chartId ?? 0),
	Level: (row: ChunithmRatingData) => row.level,
};
