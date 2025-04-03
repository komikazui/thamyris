import React, { useState } from "react";

import Header from "@/components/common/header";
import QouteCard from "@/components/common/qoutecard";
import TableComponent from "@/components/common/table";
import {
	useChunithmVersion,
	useHighestRating,
	usePlayerRating,
	useUserRatingBaseHotList,
	useUserRatingBaseList,
	useUserRatingBaseNewList,
	useUserRatingBaseNextList,
} from "@/hooks/chunithm";
import { ChunitmRating, getAllowedChunithmOptions, getDifficultyFromChunithmChart } from "@/utils/helpers";
import { useAdmin } from "@/hooks/admin";
import { useSpecial } from "@/hooks/admin/use-admin";

interface ChunithmRatingData {
	title: string;
	score?: number;
	noteCount?: number;
	level?: number;
	difficulty?: string;
	playerRating?: number;
	highestRating?: number;
	chartId?: number;
	option?: string;
}

const ChunithmRatingFrames = () => {
	const [searchQuery, setSearchQuery] = useState("");

	const version = useChunithmVersion();
	const { data: baseSongs = [] } = useUserRatingBaseList();
	const { data: hotSongs = [] } = useUserRatingBaseHotList();
	const { data: newSongs = [] } = useUserRatingBaseNewList();
	const { data: nextSongs = [] } = useUserRatingBaseNextList();
	const { data: highestRating = [] } = useHighestRating();
	const { data: playerRating = [] } = usePlayerRating();

	const isVerseOrAbove = Number(version) >= 17;

	const { isSpecial } = useSpecial();
	const { isAdmin } = useAdmin();

	const allowedOptions = getAllowedChunithmOptions(isSpecial, isAdmin);

	const columns = {
		Song: (row: ChunithmRatingData) => <span className="text-primary truncate">{row.title}</span>,
		Rating: (row: ChunithmRatingData) => ((ChunitmRating(row.level!, row.score!) ?? 0) / 100).toFixed(2),
		Score: (row: ChunithmRatingData) => row.score?.toLocaleString(),
		Difficulty: (row: ChunithmRatingData) => getDifficultyFromChunithmChart(row.chartId ?? 0),
	};

	const handleSearch = (search: { value?: string }) => {
		setSearchQuery(search.value || "");
	};

	const filterData = (data: ChunithmRatingData[]) => {
		return data.filter((song) => {
			const isAllowed = allowedOptions.includes(song.option || "");
			return (
				song.title?.toLowerCase().includes(searchQuery.toLowerCase()) &&
				(isAdmin || isSpecial || isAllowed)
			);
		});
	};

	return (
		<div className="relative flex-1 overflow-auto">
			<Header title="Rating Frame" />
			{version ? (
				<div className="container mx-auto space-y-6">
					<div className="mb-4 space-y-8 p-4 sm:px-6 sm:py-0">
						<QouteCard
							header={`Single track ratings are calculated from fumen constants and scores. Player rating is the average of ${isVerseOrAbove ? "50" : "30"
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

					<div className="mb-4 space-y-8 p-4 sm:px-6 sm:py-0">
						{/* Best 30 Table */}
						<TableComponent data={filterData(baseSongs)} columns={columns} onSearch={handleSearch} />

						{/* Current Version Table */}
						{isVerseOrAbove && <TableComponent data={filterData(newSongs)} columns={columns} onSearch={handleSearch} />}

						{/* Recent Table */}
						<TableComponent data={filterData(hotSongs)} columns={columns} onSearch={handleSearch} />

						{/* Potential Plays Table */}
						{isVerseOrAbove && <TableComponent data={filterData(nextSongs)} columns={columns} onSearch={handleSearch} />}
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