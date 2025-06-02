import React from "react";

import { Star } from "lucide-react";

import { CDN } from "@/lib/constants";
import {
	OngekiGekForceRating,
	OngekiRating,
	getDifficultyFromOngekiChart,
	getOngekiComboStatus,
} from "@/utils/helpers";

export interface OngekiRatingData {
	title: string;
	techScoreMax?: number;
	platinumScoreMax?: number;
	platinumScoreStar?: number;
	noteCount: number;
	level?: number;
	chartId?: number;
	isFullCombo?: number;
	isAllBreake?: number;
	isFullBell?: number;
	jacketPath?: string;
	source?: string;
	hasLamp?: boolean;
	hasTechScore?: boolean;
	hasRate?: boolean;
	hasPscore?: boolean;
	hasRating?: boolean;
	hasStars?: boolean;
}

export const ratingTableColumns = {
	Song: (row: OngekiRatingData) => (
		<div className="flex items-center gap-3">
			<img width={40} height={40} src={`${CDN}/ongeki/jacket/${row.jacketPath}`} className="flex-shrink-0" />
			<span className="text-primary truncate">{row.title}</span>
		</div>
	),
	Difficulty: (row: OngekiRatingData) => getDifficultyFromOngekiChart(row.chartId ?? 0),
	Level: (row: OngekiRatingData) => row.level,
	"Technical Score": (row: OngekiRatingData) => row.techScoreMax?.toLocaleString(),

	Lamp: (row: OngekiRatingData) => {
		const comboStatus = getOngekiComboStatus(
			row.isFullCombo ?? 0,
			row.isAllBreake ?? 0,
			row.isFullBell ?? 0,
			row.techScoreMax ?? 0
		);
		if (comboStatus) {
			let colorClass = "text-gray-200";

			// Check for the combined status first
			if (comboStatus === "AB/FB") {
				colorClass = "text-yellow-400";
			} else if (comboStatus === "FC/FB") {
				colorClass = "text-orange-400";
			} else if (comboStatus === "AB+") {
				colorClass = "text-pink-400";
			} else if (comboStatus === "AB") {
				colorClass = "text-purple-400";
			} else if (comboStatus === "FC") {
				colorClass = "text-cyan-400";
			} else if (comboStatus === "FB") {
				colorClass = "text-orange-400";
			}

			return <span className={colorClass}>{comboStatus}</span>;
		}
		return "-";
	},
	Rate: (row: OngekiRatingData, isRefreshOrAbove: boolean) => {
		return isRefreshOrAbove
			? (
					OngekiGekForceRating(
						row.level ?? 0,
						row.techScoreMax ?? 0,
						row.isFullCombo ?? 0,
						row.isAllBreake ?? 0,
						row.isFullBell ?? 0
					) / 1000
				).toFixed(3)
			: (OngekiRating(row.level ?? 0, row.techScoreMax ?? 0) / 100).toFixed(2);
	},
};

export const recommendedTable = {
	Song: (row: OngekiRatingData) => (
		<div className="flex items-center gap-3">
			<img width={40} height={40} src={`${CDN}/ongeki/jacket/${row.jacketPath}`} className="flex-shrink-0" />
			<span className="text-primary truncate">{row.title}</span>
		</div>
	),
	Difficulty: (row: OngekiRatingData) => getDifficultyFromOngekiChart(row.chartId ?? 0),
	Level: (row: OngekiRatingData) => row.level,
};

export const pScoreTableColumns = {
	Song: (row: OngekiRatingData) => (
		<div className="flex items-center gap-3">
			<img width={40} height={40} src={`${CDN}/ongeki/jacket/${row.jacketPath}`} className="flex-shrink-0" />
			<span className="text-primary truncate">{row.title}</span>
		</div>
	),
	Difficulty: (row: OngekiRatingData) => getDifficultyFromOngekiChart(row.chartId ?? 0),
	Level: (row: OngekiRatingData) => row.level,
	"P-Score": (row: OngekiRatingData) => {
		const maxPossibleScore = row.noteCount * 2;
		return `${(row.platinumScoreMax ?? 0).toLocaleString()} / ${maxPossibleScore.toLocaleString()}`;
	},
	Rating: (row: OngekiRatingData) => {
		const pscoreRating = ((row.level ?? 0) * (row.level ?? 0) * (row.platinumScoreStar ?? 0)) / 1000;
		return pscoreRating.toFixed(3);
	},

	Stars: (row: OngekiRatingData) =>
		(row.platinumScoreStar ?? 0) > 0 && (
			<div className="flex items-center">
				<Star className="text-yellow-300" size={16} />
				<span className="ml-1">{row.platinumScoreStar?.toLocaleString()}</span>
			</div>
		),
};
