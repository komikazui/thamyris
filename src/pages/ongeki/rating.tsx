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
										columns={ratingColumns}
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
										columns={ratingColumns}
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
										columns={ratingColumns}
										onSearch={handleBaseSearch}
										title="Top 30 fumen"
									/>
									<TableComponent
										data={filterNewData(newSongs)}
										columns={ratingColumns}
										onSearch={handleNewSearch}
										title="Recent 15 fumen"
									/>
									<TableComponent
										data={filterNextData(hotSongs)}
										columns={ratingColumns}
										onSearch={handleNextSearch}
										title="Recent 10 current fumen"
									/>
									<TableComponent
										data={filterNextData(nextSongs)}
										columns={ratingColumns}
										onSearch={handleNextSearch}
										title="Recommended fumens"
									/>
								</>
							)
						) : (
							<>
								{isRefreshOrAbove ? (
									<>
										<GridComponent
											data={filterBaseData(
												newBaseSongs.map((song) => ({
													...song,
													source: "Top 50 fumen",
													hasLamp: true,
													hasTechScore: true,
													hasRate: true,
												}))
											)}
											onSearch={handleBaseSearch}
											title="Top 50 fumen"
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
										<GridComponent
											data={filterPScoreData(
												newPscoreSongs.map((song) => ({
													...song,
													source: "Top 50 PScore",
													hasPscore: true,
													hasRating: true,
													hasStars: true,
												}))
											)}
											onSearch={handlePScoreSearch}
											title="Top 50 PScore"
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
										<GridComponent
											data={filterNewData(
												newNewSongs.map((song) => ({
													...song,
													source: "Top 10 current fumens",
													hasLamp: true,
													hasTechScore: true,
													hasRate: true,
												}))
											)}
											onSearch={handleNewSearch}
											title="Top 10 current fumens"
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
									</>
								) : (
									<>
										<GridComponent
											data={filterBaseData(
												baseSongs.map((song) => ({
													...song,
													source: "Top 30 fumen",
													hasLamp: true,
													hasTechScore: true,
													hasRate: true,
												}))
											)}
											onSearch={handleBaseSearch}
											title="Top 30 fumen"
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
										<GridComponent
											data={filterNewData(
												newSongs.map((song) => ({
													...song,
													source: "Recent 15 fumen",
													hasLamp: true,
													hasTechScore: true,
													hasRate: true,
												}))
											)}
											onSearch={handleNewSearch}
											title="Recent 15 fumen"
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
										<GridComponent
											data={filterNextData(
												hotSongs.map((song) => ({
													...song,
													source: "Recent 10 current fumen",
													hasLamp: true,
													hasTechScore: true,
													hasRate: true,
												}))
											)}
											onSearch={handleNextSearch}
											title="Recent 10 current fumen"
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
									</>
								)}
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
