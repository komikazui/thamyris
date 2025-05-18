import React, { useState } from "react";

import GridComponent, { ScoreGrid } from "@/components/common/grid";
import Header from "@/components/common/header";
import QouteCard from "@/components/common/qoutecard";
import TableComponent from "@/components/common/table";
import ViewToggle from "@/components/common/view-toggle";
// Import the new ViewToggle component
import {
	useChunithmVersion,
	useHighestRating,
	usePlayerRating,
	useUserRatingBaseHotList,
	useUserRatingBaseList,
	useUserRatingBaseNewList,
	useUserRatingBaseNextList,
} from "@/hooks/chunithm";
import { cdnUrl } from "@/lib/constants";
import { ChunitmRating, getChunithmComboStatus, getDifficultyFromChunithmChart } from "@/utils/helpers";

interface ChunithmRatingData {
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
	isFullCombo?: number;
	isClear?: number;
	isAllJustice?: number;
}

const ChunithmRatingFrames = () => {
	const [searchQueries, setSearchQueries] = useState({
		base: "",
		current: "",
		recent: "",
		potential: "",
		combined: "",
	});

	const [viewMode, setViewMode] = useState<"separate" | "combined">("separate"); // "separate" or "combined"

	const version = useChunithmVersion();
	const { data: baseSongs = [] } = useUserRatingBaseList();
	const { data: hotSongs = [] } = useUserRatingBaseHotList();
	const { data: newSongs = [] } = useUserRatingBaseNewList();
	const { data: nextSongs = [] } = useUserRatingBaseNextList();
	const { data: highestRating = [] } = useHighestRating();
	const { data: playerRating = [] } = usePlayerRating();

	const isVerseOrAbove = Number(version) >= 17;

	const ratingTable = {
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

	const recommenedTable = {
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

	const handleBaseSearch = (search: { value?: string }) => {
		setSearchQueries((prev) => ({ ...prev, base: search.value || "" }));
	};

	const handleCurrentSearch = (search: { value?: string }) => {
		setSearchQueries((prev) => ({ ...prev, current: search.value || "" }));
	};

	const handleRecentSearch = (search: { value?: string }) => {
		setSearchQueries((prev) => ({ ...prev, recent: search.value || "" }));
	};

	const handlePotentialSearch = (search: { value?: string }) => {
		setSearchQueries((prev) => ({ ...prev, potential: search.value || "" }));
	};

	const handleCombinedSearch = (search: { value?: string }) => {
		setSearchQueries((prev) => ({ ...prev, combined: search.value || "" }));
	};

	const filterBaseData = (data: ChunithmRatingData[]) => {
		return data.filter((song) => {
			return song.title?.toLowerCase().includes(searchQueries.base.toLowerCase());
		});
	};

	const filterCurrentData = (data: ChunithmRatingData[]) => {
		return data.filter((song) => {
			return song.title?.toLowerCase().includes(searchQueries.current.toLowerCase());
		});
	};

	const filterRecentData = (data: ChunithmRatingData[]) => {
		return data.filter((song) => {
			return song.title?.toLowerCase().includes(searchQueries.recent.toLowerCase());
		});
	};

	const filterPotentialData = (data: ChunithmRatingData[]) => {
		return data.filter((song) => {
			return song.title?.toLowerCase().includes(searchQueries.potential.toLowerCase());
		});
	};

	const filterCombinedData = (data: ChunithmRatingData[]) => {
		return data.filter((song) => {
			return song.title?.toLowerCase().includes(searchQueries.combined.toLowerCase());
		});
	};

	// Function to combine all data with source information
	const getCombinedData = () => {
		if (isVerseOrAbove) {
			// For newer version
			const combinedData = [
				...newSongs.map((song) => ({
					...song,
					source: "Top 20 current fumen",
					hasScore: true,
					hasRating: true,
					hasLamp: true,
					hasType: isVerseOrAbove,
				})),
				...hotSongs.map((song) => ({
					...song,
					source: "Recent 10 fumen",
					hasScore: true,
					hasRating: true,
					hasLamp: true,
					hasType: isVerseOrAbove,
				})),
				// Removed nextSongs (recommended fumens) from the combined view
			];
			return filterCombinedData(combinedData);
		} else {
			// For older version
			const combinedData = [
				...baseSongs.map((song) => ({
					...song,
					source: "Top 30 fumen",
					hasScore: true,
					hasRating: true,
					hasLamp: true,
				})),
				...hotSongs.map((song) => ({
					...song,
					source: "Recent 10 fumen",
					hasScore: true,
					hasRating: true,
					hasLamp: true,
				})),
			];
			return filterCombinedData(combinedData);
		}
	};

	return (
		<div className="relative flex-1 overflow-auto">
			<Header title="Rating Frame" />
			{version ? (
				<div className="container mx-auto space-y-6">
					<div className="mb-4 space-y-8 p-4 sm:px-6 sm:py-0">
						<QouteCard
							header={`Single track ratings are calculated from fumen constants and scores. Player rating is the average of ${
								isVerseOrAbove ? "50" : "30"
							} unique fumen ratings, including:`}
							welcomeMessage={
								<div className="flex flex-col space-y-1">
									{isVerseOrAbove ? (
										<>
											<span>• 30 highest ratings from old version fumens</span>
											<span>• 20 highest ratings from new version fumens</span>
										</>
									) : (
										<>
											<span>• Based on best 30 plays</span>
										</>
									)}
									<div className="flex flex-col">
										<span className="text-primary font-bold">
											Player Rating: {((playerRating[0]?.playerRating ?? 0) / 100).toFixed(2) || "Loading..."}
										</span>
										<span className="text-primary font-bold">
											Highest Rating: {((highestRating[0]?.highestRating ?? 0) / 100).toFixed(2) || "Loading..."}
										</span>
									</div>
								</div>
							}
							color="#ffaa00"
						/>
					</div>

					{/* View Mode Toggle */}
					<ViewToggle viewMode={viewMode} onToggle={() => setViewMode(viewMode === "separate" ? "combined" : "separate")} />

					<div className="mb-4 space-y-8 p-4 sm:px-6 sm:py-0">
						{viewMode === "separate" ? (
							// Separate Tables View
							isVerseOrAbove ? (
								<>
									<TableComponent
										data={filterCurrentData(newSongs)}
										columns={ratingTable}
										onSearch={handleCurrentSearch}
										title="Top 20 current fumen"
									/>
									<TableComponent
										data={filterRecentData(hotSongs)}
										columns={ratingTable}
										onSearch={handleRecentSearch}
										title="Recent 10 fumen"
									/>
									<TableComponent
										data={filterPotentialData(nextSongs)}
										columns={recommenedTable}
										onSearch={handlePotentialSearch}
										title="Potential fumens"
									/>
								</>
							) : (
								<>
									<TableComponent
										data={filterBaseData(baseSongs)}
										columns={ratingTable}
										onSearch={handleBaseSearch}
										title="Top 30 fumen"
									/>
									<TableComponent
										data={filterRecentData(hotSongs)}
										columns={ratingTable}
										onSearch={handleRecentSearch}
										title="Recent 10 fumen"
									/>
								</>
							)
						) : (
							<GridComponent
								data={getCombinedData()}
								onSearch={handleCombinedSearch}
								title="All Fumen Data"
								renderItem={(item, index) => (
									<ScoreGrid
										key={index}
										item={item}
										gameType="chunithm"
										getDifficulty={getDifficultyFromChunithmChart}
										getChunithmRating={ChunitmRating}
										getChunithmComboStatus={getChunithmComboStatus}
										isVerseOrAbove={isVerseOrAbove}
									/>
								)}
							/>
						)}
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

export default ChunithmRatingFrames;
