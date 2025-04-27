import React, { useState } from "react";

import { Star } from "lucide-react";

import Header from "@/components/common/header";
import QouteCard from "@/components/common/qoutecard";
import TableComponent from "@/components/common/table";
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
}

const OngekiRatingFrames = () => {
	const [searchQuery, setSearchQuery] = useState("");

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
		Song: (row: OngekiRatingData) => <span className="text-primary truncate">{row.title}</span>,
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
		Song: (row: OngekiRatingData) => <span className="text-primary truncate">{row.title}</span>,
		Difficulty: (row: OngekiRatingData) => getDifficultyFromOngekiChart(row.chartId ?? 0),
		Level: (row: OngekiRatingData) => row.level,
	};

	const pScoreTableColumns = {
		Song: (row: OngekiRatingData) => <span className="text-primary truncate">{row.title}</span>,
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

	const handleSearch = (search: { value?: string }) => {
		setSearchQuery(search.value || "");
	};

	const filterData = (data: any[]) =>
		data.filter((song) => song.title?.toLowerCase().includes(searchQuery.toLowerCase()));

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
									{/* {isRefreshOrAbove ? (
										<>
											<span>• (sum of NEW top 10) ÷ 50</span>
											<span>• (sum of BEST top 50) ÷ 50</span>
											<span>• (sum of PLATINUM top 50) ÷ 50</span>
										</>
									) : (
										<>
											<span>• 30 highest ratings from old version fumens</span>
											<span>• 15 highest ratings from new version fumens</span>
											<span>• 10 highest ratings from recent plays, excluding Lunatic difficulty</span>
										</>
									)} */}
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

					<div className="mb-4 space-y-8 p-4 sm:px-6 sm:py-0">
						{isRefreshOrAbove ? (
							<>
								<TableComponent
									data={filterData(newBaseSongs)}
									columns={ratingTableColumns}
									onSearch={handleSearch}
									title="Top 50 fumen"
								/>
								<TableComponent
									data={filterData(newPscoreSongs)}
									columns={pScoreTableColumns}
									onSearch={handleSearch}
									title="Top 50 PScore"
								/>
								<TableComponent
									data={filterData(newNewSongs)}
									columns={ratingTableColumns}
									onSearch={handleSearch}
									title="Top 10 current fumens"
								/>
								<TableComponent
									data={filterData(newNextSongs)}
									columns={recommendedTable}
									onSearch={handleSearch}
									title="Recommended fumens"
								/>
							</>
						) : (
							<>
								<TableComponent
									data={filterData(baseSongs)}
									columns={ratingTableColumns}
									onSearch={handleSearch}
									title="Top 30 fumen"
								/>
								<TableComponent
									data={filterData(newSongs)}
									columns={ratingTableColumns}
									onSearch={handleSearch}
									title="Recent 15 fumen"
								/>
								<TableComponent
									data={filterData(hotSongs)}
									columns={ratingTableColumns}
									onSearch={handleSearch}
									title="Recent 10 current fumen"
								/>
								<TableComponent
									data={filterData(nextSongs)}
									columns={ratingTableColumns}
									onSearch={handleSearch}
									title="Recommended fumens"
								/>
							</>
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
