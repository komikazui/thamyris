import React, { useState } from "react";

import GridComponent, { ScoreGrid } from "@/components/common/grid";
import Header from "@/components/common/header";
import QouteCard from "@/components/common/qoutecard";
import TableComponent from "@/components/common/table";
import ViewToggle from "@/components/common/view-toggle";
import {
	OngekiRatingData,
	pScoreTableColumns,
	ratingTableColumns,
	recommendedTable,
} from "@/components/ongeki/rating-columns";
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

	const handleSearch = (key: keyof typeof searchQueries) => (search: { value?: string }) => {
		setSearchQueries((prev) => ({ ...prev, [key]: search.value || "" }));
	};

	const handleBaseSearch = handleSearch("base");
	const handlePScoreSearch = handleSearch("pScore");
	const handleNewSearch = handleSearch("new");
	const handleNextSearch = handleSearch("next");

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

	const ratingColumns = {
		...ratingTableColumns,
		Rate: (row: OngekiRatingData) => ratingTableColumns.Rate(row, isRefreshOrAbove),
	};

	// Determine which data to use based on version
	const topFumens = isRefreshOrAbove ? newBaseSongs : baseSongs;
	const topFumensTitle = isRefreshOrAbove ? "Top 50 fumen" : "Top 30 fumen";

	const currentFumens = isRefreshOrAbove ? newNewSongs : hotSongs;
	const currentFumensTitle = isRefreshOrAbove ? "Top 10 current fumens" : "Recent 10 current fumen";

	const recommendedFumens = isRefreshOrAbove ? newNextSongs : nextSongs;
	const recommendedFumensTitle = "Recommended fumens";

	// Only newer versions have PScore data
	const pScoreData = newPscoreSongs;
	const pScoreTitle = "Top 50 PScore";

	// Additional data only in older versions
	const recentFumens = newSongs;
	const recentFumensTitle = "Recent 15 fumen";

	return (
		<div className="relative flex-1 overflow-auto">
			<Header title="Rating Frame" />
			{version ? (
				<div className="container mx-auto space-y-6">
					<div className="mb-4 space-y-8 p-4 sm:px-6 sm:py-0">
						<QouteCard
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
							<>
								{/* Top fumens table - present in both versions */}
								<TableComponent
									data={filterBaseData(topFumens)}
									columns={ratingColumns}
									onSearch={handleBaseSearch}
									title={topFumensTitle}
								/>

								{/* PScore table - only in newer versions */}
								{isRefreshOrAbove && (
									<TableComponent
										data={filterPScoreData(pScoreData)}
										columns={pScoreTableColumns}
										onSearch={handlePScoreSearch}
										title={pScoreTitle}
									/>
								)}

								{/* Current fumens table - present in both versions */}
								<TableComponent
									data={filterNewData(currentFumens)}
									columns={ratingColumns}
									onSearch={handleNewSearch}
									title={currentFumensTitle}
								/>

								{/* Recent fumens table - only in older versions */}
								{!isRefreshOrAbove && (
									<TableComponent
										data={filterNewData(recentFumens)}
										columns={ratingColumns}
										onSearch={handleNewSearch}
										title={recentFumensTitle}
									/>
								)}

								{/* Recommended fumens table - present in both versions */}
								<TableComponent
									data={filterNextData(recommendedFumens)}
									columns={recommendedTable}
									onSearch={handleNextSearch}
									title={recommendedFumensTitle}
								/>
							</>
						) : (
							<>
								{/* Top fumens grid - present in both versions */}
								<GridComponent
									data={filterBaseData(
										topFumens.map((song) => ({
											...song,
											source: topFumensTitle,
											hasLamp: true,
											hasTechScore: true,
											hasRate: true,
										}))
									)}
									onSearch={handleBaseSearch}
									title={topFumensTitle}
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

								{/* PScore grid - only in newer versions */}
								{isRefreshOrAbove && (
									<GridComponent
										data={filterPScoreData(
											pScoreData.map((song) => ({
												...song,
												source: pScoreTitle,
												hasPscore: true,
												hasRating: true,
												hasStars: true,
											}))
										)}
										onSearch={handlePScoreSearch}
										title={pScoreTitle}
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

								{/* Current fumens grid - present in both versions */}
								<GridComponent
									data={filterNewData(
										currentFumens.map((song) => ({
											...song,
											source: currentFumensTitle,
											hasLamp: true,
											hasTechScore: true,
											hasRate: true,
										}))
									)}
									onSearch={handleNewSearch}
									title={currentFumensTitle}
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

								{/* Recent fumens grid - only in older versions */}
								{!isRefreshOrAbove && (
									<GridComponent
										data={filterNewData(
											recentFumens.map((song) => ({
												...song,
												source: recentFumensTitle,
												hasLamp: true,
												hasTechScore: true,
												hasRate: true,
											}))
										)}
										onSearch={handleNewSearch}
										title={recentFumensTitle}
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

								{/* Recommended fumens grid - present in both versions */}
								<GridComponent
									data={filterNextData(
										recommendedFumens.map((song) => ({
											...song,
											source: recommendedFumensTitle,
											// Recommended fumens don't need the same display features as other categories
										}))
									)}
									onSearch={handleNextSearch}
									title={recommendedFumensTitle}
									renderItem={(item, index) => (
										<ScoreGrid
											key={index}
											item={item}
											gameType="ongeki"
											getDifficulty={getDifficultyFromOngekiChart}
											isRefreshOrAbove={isRefreshOrAbove}
										/>
									)}
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
