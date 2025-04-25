import { useState } from "react";
import React from "react";

import Header from "@/components/common/header";
import Spinner from "@/components/common/spinner";
import TableComponent from "@/components/common/table";
import { useAdmin } from "@/hooks/admin";
import { useChunithmScores, useChunithmVersion } from "@/hooks/chunithm";
import { cdnUrl } from "@/lib/constants";
import {
	getAllowedChunithmOptions,
	getChunithmComboStatus,
	getChunithmGrade,
	getDifficultyFromChunithmChart,
} from "@/utils/helpers";

interface ChunithmScore {
	id: number;
	title: string;
	jacketPath?: string;
	score: number;
	playerRating?: number;
	chartId?: number;
	userPlayDate?: string;
	option?: string;
	isFullCombo?: number;
	isAllJustice?: number;
}

const ChunithmScorePage = () => {
	const [searchQuery, setSearchQuery] = useState("");
	const { data: systemAdmin } = useAdmin();
	const hasAdminPerms = systemAdmin?.isAdmin ?? false;

	const { data: scores = [], isLoading: isLoadingScores } = useChunithmScores() as {
		data: ChunithmScore[];
		isLoading: boolean;
	};

	const version = useChunithmVersion();
	const allowedOptions = getAllowedChunithmOptions(hasAdminPerms);

	const filteredScores = scores.filter((score) => {
		const isAllowed = allowedOptions.includes(score.option || "");
		return score.title?.toLowerCase().includes(searchQuery.toLowerCase()) && isAllowed;
	});
	const columns = {
		Song: (row: ChunithmScore) => (
			<div className="flex items-center gap-3">
				<img
					width={40}
					height={40}
					src={`${cdnUrl}/jacket/${row.jacketPath?.replace(".dds", ".png")}`}
					alt={row.title}
					className="flex-shrink-0"
				/>
				<span className="text-primary truncate">{row.title}</span>
			</div>
		),
		Score: (row: ChunithmScore) => row.score?.toLocaleString(),
		Grade: (row: ChunithmScore) => getChunithmGrade(row.score),
		Rating: (row: ChunithmScore) => ((row.playerRating ?? 0) / 100).toFixed(2),
		Difficulty: (row: ChunithmScore) => getDifficultyFromChunithmChart(row.chartId ?? 0),
		"Combo Lamp": (row: ChunithmScore) => {
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
		Playdate: (row: ChunithmScore) => (row.userPlayDate ? new Date(row.userPlayDate).toLocaleString() : "Unknown"),
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
						<TableComponent data={filteredScores} columns={columns} onSearch={handleSearch} />
					</div>
				</div>
			) : (
				<div className="flex h-[calc(100vh-64px)] items-center justify-center">
					<p className="text-primary">Please set your Chunithm version in settings first</p>
				</div>
			)}
		</div>
	);
};

export default ChunithmScorePage;
