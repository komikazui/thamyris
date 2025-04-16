import { useState } from "react";
import React from "react";

import { Star } from "lucide-react";

import Header from "@/components/common/header";
import Spinner from "@/components/common/spinner";
import TableComponent from "@/components/common/table";
import { useOngekiScores, useOngekiVersion } from "@/hooks/ongeki";
import { getDifficultyFromOngekiChart, getOngekiComboStatus } from "@/utils/helpers";

interface OngekiScore {
	id: number;
	title: string;
	jacketPath?: string;
	techScore: number;
	platinumScoreStar?: number;
	playerRating?: number;
	userPlayDate?: string;
	chartId?: number;
	isFullCombo?: number;
	isAllBreak?: number;
	isFullBell?: number;
}

const OngekiScorePage = () => {
	const [searchQuery, setSearchQuery] = useState("");

	const { data: scores = [], isLoading: isLoadingScores } = useOngekiScores() as {
		data: OngekiScore[];
		isLoading: boolean;
	};

	const version = useOngekiVersion();
	const isRefreshOrAbove = Number(version) >= 8;

	const filteredScores = scores.filter((score) => score.title?.toLowerCase().includes(searchQuery.toLowerCase()));
	const versionFilteredScores = isRefreshOrAbove
		? filteredScores.filter((score) => score.platinumScoreStar !== null)
		: filteredScores.filter((score) => score.platinumScoreStar === null);

	const columns = {
		Song: (row: OngekiScore) => (
			<div className="flex items-center gap-3">
				{/* <img
                    width={40}
                    height={40}
                    src={`assets/${row.jacketPath?.replace(".dds", ".png")}`}
                    alt={row.title}
                    className="flex-shrink-0"
                /> */}
				<span className="text-primary truncate">{row.title}</span>
			</div>
		),
		Score: (row: OngekiScore) => row.techScore?.toLocaleString(),
		"Platinum Stars": (row: OngekiScore) =>
			(row.platinumScoreStar ?? 0) > 0 && (
				<>
					<Star className="inline-block text-yellow-300" size={16} />
					<span className="ml-1">{row.platinumScoreStar?.toLocaleString()}</span>
				</>
			),
		Rating: (row: OngekiScore) => {
			if (row.platinumScoreStar === null) {
				return ((row.playerRating ?? 0) / 100).toFixed(2);
			}
			return ((row.playerRating ?? 0) / 1000).toFixed(3);
		},
		Difficulty: (row: OngekiScore) => getDifficultyFromOngekiChart(row.chartId ?? 0),
		"Combo Lamp": (row: OngekiScore) => {
			const comboStatus = getOngekiComboStatus(row.isFullCombo ?? 0, row.isAllBreak ?? 0, row.isFullBell ?? 0);
			if (comboStatus) {
				let colorClass = "text-gray-200";
				if (comboStatus.includes("AB")) {
					colorClass = "text-purple-400";
				} else if (comboStatus.includes("FC")) {
					colorClass = "text-cyan-400";
				} else if (comboStatus.includes("FB")) {
					colorClass = "text-yellow-400";
				}

				return <span className={colorClass}>{comboStatus}</span>;
			}
			return "-";
		},
		Playdate: (row: OngekiScore) => (row.userPlayDate ? new Date(row.userPlayDate).toLocaleString() : "Unknown"),
	};

	const handleSearch = (search: { value?: string }) => {
		setSearchQuery(search.value || "");
	};

	if (isLoadingScores) {
		return (
			<div className="relative flex-1 overflow-auto">
				<Header title="Overview" />
				<div className="flex h-[calc(100vh-64px)] items-center justify-center">
					<div className="text-lg text-gray-400">
						<Spinner size={24} color="#ffffff" />
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="relative flex-1 overflow-auto">
			<Header title="Scores" />
			{version ? (
				<div className="space-y-6">
					<div className="mb-4 space-y-4 p-4 sm:px-6 sm:py-0">
						<TableComponent data={versionFilteredScores} columns={columns} onSearch={handleSearch} />
					</div>
				</div>
			) : (
				<div className="flex h-[calc(100vh-64px)] items-center justify-center">
					<p className="text-primary">Please set your Ongeki version in settings first</p>
				</div>
			)}
		</div>
	);
};

export default OngekiScorePage;
