import React, { useState } from "react";

import { ChunithmRatingData, ratingTable, recommendedTable } from "@/components/chunithm/rating-columns";
import GridComponent, { ScoreGrid } from "@/components/common/grid";
import Header from "@/components/common/header";
import QouteCard from "@/components/common/qoutecard";
import TableComponent from "@/components/common/table";
import ViewToggle from "@/components/common/view-toggle";
import {
	useChunithmVersion,
	useHighestRating,
	usePlayerRating,
	useUserRatingBaseHotList,
	useUserRatingBaseList,
	useUserRatingBaseNewList,
	useUserRatingBaseNextList,
} from "@/hooks/chunithm";
import { ChunitmRating, getChunithmComboStatus, getDifficultyFromChunithmChart } from "@/utils/helpers";

const ChunithmRatingFrames = () => {
	const [searchQueries, setSearchQueries] = useState({
		base: "",
		current: "",
		recent: "",
		potential: "",
		combined: "",
	});

	const [viewMode, setViewMode] = useState<"separate" | "combined">("separate");

	const version = useChunithmVersion();
	const { data: baseSongs = [] } = useUserRatingBaseList();
	const { data: hotSongs = [] } = useUserRatingBaseHotList();
	const { data: newSongs = [] } = useUserRatingBaseNewList();
	const { data: nextSongs = [] } = useUserRatingBaseNextList();
	const { data: highestRating = [] } = useHighestRating();
	const { data: playerRating = [] } = usePlayerRating();

	const isVerseOrAbove = Number(version) >= 17;

	const handleSearch = (key: keyof typeof searchQueries) => (search: { value?: string }) => {
		setSearchQueries((prev) => ({ ...prev, [key]: search.value || "" }));
	};

	const handleBaseSearch = handleSearch("base");
	const handleCurrentSearch = handleSearch("current");
	const handleRecentSearch = handleSearch("recent");
	const handlePotentialSearch = handleSearch("potential");

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

	// Determine which data to use based on version
	const topFumens = isVerseOrAbove ? newSongs : baseSongs;
	const topFumensTitle = isVerseOrAbove ? "Top 20 current fumen" : "Top 30 fumen";

	const recentFumens = hotSongs;
	const recentFumensTitle = "Recent 10 fumen";

	const recommendedFumens = nextSongs;
	const recommendedFumensTitle = "Potential fumens";

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
							<>
								{/* Top fumens table - present in both versions */}
								<TableComponent
									data={filterCurrentData(topFumens)}
									columns={ratingTable}
									onSearch={isVerseOrAbove ? handleCurrentSearch : handleBaseSearch}
									title={topFumensTitle}
								/>

								{/* Recent fumens table - present in both versions */}
								<TableComponent
									data={filterRecentData(recentFumens)}
									columns={ratingTable}
									onSearch={handleRecentSearch}
									title={recentFumensTitle}
								/>

								{/* Recommended/potential fumens table - only present in Verse or above */}
								{isVerseOrAbove && (
									<TableComponent
										data={filterPotentialData(recommendedFumens)}
										columns={recommendedTable}
										onSearch={handlePotentialSearch}
										title={recommendedFumensTitle}
									/>
								)}
							</>
						) : (
							<>
								{/* Top fumens grid - present in both versions */}
								<GridComponent
									data={filterCurrentData(
										topFumens.map((song) => ({
											...song,
											hasScore: true,
											hasRating: true,
											hasLamp: true,
											hasType: isVerseOrAbove,
										}))
									)}
									onSearch={isVerseOrAbove ? handleCurrentSearch : handleBaseSearch}
									title={topFumensTitle}
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

								{/* Recent fumens grid - present in both versions */}
								<GridComponent
									data={filterRecentData(
										recentFumens.map((song) => ({
											...song,
											hasScore: true,
											hasRating: true,
											hasLamp: true,
										}))
									)}
									onSearch={handleRecentSearch}
									title={recentFumensTitle}
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

								{/* Recommended/potential fumens grid - only in Verse or above */}
								{isVerseOrAbove && (
									<GridComponent
										data={filterPotentialData(
											recommendedFumens.map((song) => ({
												...song,
												hasScore: false,
												hasRating: false,
												hasLamp: false,
											}))
										)}
										onSearch={handlePotentialSearch}
										title={recommendedFumensTitle}
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
							</>
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
