import React, { useState } from "react";

import { Star } from "lucide-react";

import GridComponent, { ScoreGrid } from "@/components/common/grid";
import Header from "@/components/common/header";
import QouteCard from "@/components/common/qoutecard";
import TableComponent from "@/components/common/table";
import ViewToggle from "@/components/common/view-toggle";
import {
	useHighestRating,
	useNewHighestRating,
	useNewPlayerRating,
	useOngekiVersion,
	usePlayerRating,
	useUserNewRatingBaseBestList,
	useUserNewRatingBaseBestNewList,
	useUserNewRatingBaseNextBestList,
	useUserRatingBaseHotList,
	useUserRatingBaseList,
	useUserRatingBaseNewList,
	useUserRatingBaseNextList,
} from "@/hooks/ongeki";
import { useUserNewRatingBasePScoreList } from "@/hooks/ongeki/use-new-rating";
import { cdnUrl } from "@/lib/constants";
import {
	OngekiGekForceRating,
	OngekiRating,
	getDifficultyFromOngekiChart,
	getOngekiComboStatus,
} from "@/utils/helpers";

interface OngekiRatingData {
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
}

const OngekiRatingFrames = () => {
	const [searchQueries, setSearchQueries] = useState({
		base: "",
		pScore: "",
		new: "",
		next: "",
		combined: "",
	});

	const [viewMode, setViewMode] = useState<"separate" | "combined">("separate");

	const version = useOngekiVersion();

	// Fetch data for different rating categories
	const { data: baseSongs = [] } = useUserRatingBaseList();
	const { data: hotSongs = [] } = useUserRatingBaseHotList();
	const { data: newSongs = [] } = useUserRatingBaseNewList();
	const { data: nextSongs = [] } = useUserRatingBaseNextList();
	const { data: playerRating = [] } = usePlayerRating();
	const { data: highestRating = [] } = useHighestRating();

	const { data: newBaseSongs = [] } = useUserNewRatingBaseBestList();
	const { data: newNewSongs = [] } = useUserNewRatingBaseBestNewList();
	const { data: newNextSongs = [] } = useUserNewRatingBaseNextBestList();
	const { data: newPscoreSongs = [] } = useUserNewRatingBasePScoreList();

	const { data: newPlayerRating = [] } = useNewPlayerRating();
	const { data: newHighestRating = [] } = useNewHighestRating();

	const isRefreshOrAbove = Number(version) >= 8;

	const ratingTableColumns = {
		Song: (row: OngekiRatingData) => (
			<div className="flex items-center gap-3">
				<img width={40} height={40} src={`${cdnUrl}/ongeki/jacket/${row.jacketPath}`} className="flex-shrink-0" />
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
		Rate: (row: OngekiRatingData) => {
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

	const recommendedTable = {
		Song: (row: OngekiRatingData) => (
			<div className="flex items-center gap-3">
				<img width={40} height={40} src={`${cdnUrl}/ongeki/jacket/${row.jacketPath}`} className="flex-shrink-0" />
				<span className="text-primary truncate">{row.title}</span>
			</div>
		),
		Difficulty: (row: OngekiRatingData) => getDifficultyFromOngekiChart(row.chartId ?? 0),
		Level: (row: OngekiRatingData) => row.level,
	};

	const pScoreTableColumns = {
		Song: (row: OngekiRatingData) => (
			<div className="flex items-center gap-3">
				<img width={40} height={40} src={`${cdnUrl}/ongeki/jacket/${row.jacketPath}`} className="flex-shrink-0" />
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

	const handleSearch = (key: keyof typeof searchQueries) => (search: { value?: string }) => {
		setSearchQueries((prev) => ({ ...prev, [key]: search.value || "" }));
	};

	const handleBaseSearch = handleSearch("base");
	const handlePScoreSearch = handleSearch("pScore");
	const handleNewSearch = handleSearch("new");
	const handleNextSearch = handleSearch("next");
	const handleCombinedSearch = handleSearch("combined");

	const filterPScoreData = (data: OngekiRatingData[]) => {
		return data.filter((song) => {
			return song.title?.toLowerCase().includes(searchQueries.pScore.toLowerCase());
		});
	};

	const filterBaseData = (data: OngekiRatingData[]) => {
		return data.filter((song) => {
			return song.title?.toLowerCase().includes(searchQueries.base.toLowerCase());
		});
	};

	const filterNewData = (data: OngekiRatingData[]) => {
		return data.filter((song) => {
			return song.title?.toLowerCase().includes(searchQueries.new.toLowerCase());
		});
	};

	const filterNextData = (data: OngekiRatingData[]) => {
		return data.filter((song) => {
			return song.title?.toLowerCase().includes(searchQueries.next.toLowerCase());
		});
	};

	const filterCombinedData = (data: OngekiRatingData[]) => {
		return data.filter((song) => {
			return song.title?.toLowerCase().includes(searchQueries.combined.toLowerCase());
		});
	};

	const getCombinedData = () => {
		if (isRefreshOrAbove) {
			// For newer version
			const combinedData = [
				...newBaseSongs.map((song) => ({
					...song,
					source: "Top 50 fumen",
					hasLamp: true,
					hasTechScore: true,
					hasRate: true,
				})),
				...newPscoreSongs.map((song) => ({
					...song,
					source: "Top 50 PScore",
					hasPscore: true,
					hasRating: true,
					hasStars: true,
				})),
				...newNewSongs.map((song) => ({
					...song,
					source: "Top 10 current fumens",
					hasLamp: true,
					hasTechScore: true,
					hasRate: true,
				})),
			];
			return filterCombinedData(combinedData);
		} else {
			// For older version
			const combinedData = [
				...baseSongs.map((song) => ({ ...song, source: "Top 30 fumen", hasLamp: true, hasTechScore: true, hasRate: true })),
				...newSongs.map((song) => ({
					...song,
					source: "Recent 15 fumen",
					hasLamp: true,
					hasTechScore: true,
					hasRate: true,
				})),
				...hotSongs.map((song) => ({
					...song,
					source: "Recent 10 current fumen",
					hasLamp: true,
					hasTechScore: true,
					hasRate: true,
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
							header="Single track ratings are calculated from fumen constants and scores."
							welcomeMessage={
								<div className="flex flex-col space-y-1">
									<div className="flex flex-col">
										{isRefreshOrAbove ? (
											<>
												<span className="text-primary font-bold">
													Player Rating: {((newPlayerRating[0]?.newPlayerRating ?? 0) / 1000).toFixed(3) || "Loading..."}
												</span>
												<span className="text-primary font-bold">
													Highest Rating: {((newHighestRating[0]?.newHighestRating ?? 0) / 1000).toFixed(3) || "Loading..."}
												</span>
											</>
										) : (
											<>
												<span className="text-primary font-bold">
													Player Rating: {((playerRating[0]?.playerRating ?? 0) / 100).toFixed(2) || "Loading..."}
												</span>
												<span className="text-primary font-bold">
													Highest Rating: {((highestRating[0]?.highestRating ?? 0) / 100).toFixed(2) || "Loading..."}
												</span>
											</>
										)}
									</div>
								</div>
							}
							color="#f067e9"
						/>
					</div>

					{/* View Mode Toggle */}
					<ViewToggle viewMode={viewMode} onToggle={() => setViewMode(viewMode === "separate" ? "combined" : "separate")} />

					<div className="mb-4 space-y-8 p-4 sm:px-6 sm:py-0">
						{viewMode === "separate" ? (
							isRefreshOrAbove ? (
								<>
									<TableComponent
										data={filterBaseData(newBaseSongs)}
										columns={ratingTableColumns}
										onSearch={handleBaseSearch}
										title="Top 50 fumen"
									/>
									<TableComponent
										data={filterPScoreData(newPscoreSongs)}
										columns={pScoreTableColumns}
										onSearch={handlePScoreSearch}
										title="Top 50 PScore"
									/>
									<TableComponent
										data={filterNewData(newNewSongs)}
										columns={ratingTableColumns}
										onSearch={handleNewSearch}
										title="Top 10 current fumens"
									/>
									<TableComponent
										data={filterNextData(newNextSongs)}
										columns={recommendedTable}
										onSearch={handleNextSearch}
										title="Recommended fumens"
									/>
								</>
							) : (
								<>
									<TableComponent
										data={filterBaseData(baseSongs)}
										columns={ratingTableColumns}
										onSearch={handleBaseSearch}
										title="Top 30 fumen"
									/>
									<TableComponent
										data={filterNewData(newSongs)}
										columns={ratingTableColumns}
										onSearch={handleNewSearch}
										title="Recent 15 fumen"
									/>
									<TableComponent
										data={filterNextData(hotSongs)}
										columns={ratingTableColumns}
										onSearch={handleNextSearch}
										title="Recent 10 current fumen"
									/>
									<TableComponent
										data={filterNextData(nextSongs)}
										columns={ratingTableColumns}
										onSearch={handleNextSearch}
										title="Recommended fumens"
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
										gameType="ongeki"
										getDifficulty={getDifficultyFromOngekiChart}
										getComboStatus={getOngekiComboStatus}
										isRefreshOrAbove={isRefreshOrAbove}
										getOngekiRating={OngekiRating}
										getOngekiGekForceRating={OngekiGekForceRating}
									/>
								)}
							/>
						)}
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

export default OngekiRatingFrames;
