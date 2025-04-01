import { useState } from "react";
import React from "react";

import Header from "@/components/common/header";
import QouteCard from "@/components/common/qoutecard";
import Spinner from "@/components/common/spinner";
import ScoreTable from "@/components/common/table";
import { useOngekiSongs, useOngekiVersion } from "@/hooks/ongeki";
import { getDifficultyFromOngekiChart } from "@/utils/helpers";

interface OngekiSong {
	title: string;
	jacketPath?: string;
	artist?: string;
	level?: number;
	difficulty?: string;
	genre?: string;
	chartId?: number;
}

const OngekiAllSongs = () => {
	const { data: songs = [], isLoading: isLoadingSongs } = useOngekiSongs() as {
		data: OngekiSong[];
		isLoading: boolean;
	};
	const version = useOngekiVersion();
	const [searchQuery, setSearchQuery] = useState("");

	const columns = {
		Song: (row: OngekiSong) => (
			<div className="flex items-center gap-3">
				{/* <img
					width={40}
					height={40}
					src={`${cdnUrl}/assets/jacket/${row.jacketPath?.replace(".dds", ".png")}`}
					alt={row.title}
					className="flex-shrink-0"
				/> */}
				<span className="text-primary truncate">{row.title}</span>
			</div>
		),
		Artist: (row: OngekiSong) => row.artist || "Unknown",
		Level: (row: OngekiSong) => row.level || "N/A",
		Difficulty: (row: OngekiSong) => getDifficultyFromOngekiChart(row.chartId ?? 0),

		Genre: (row: OngekiSong) => row.genre || "N/A",
	};

	const filterData = (data: OngekiSong[]) =>
		data.filter((song) => song.title?.toLowerCase().includes(searchQuery.toLowerCase()));

	if (isLoadingSongs) {
		return (
			<div className="relative flex-1 overflow-auto">
				<Header title="All Songs" />
				<div className="flex h-[calc(100vh-64px)] items-center justify-center">
					<Spinner size={24} />
				</div>
			</div>
		);
	}

	return (
		<div className="relative flex-1 overflow-auto">
			<Header title="All Songs" />
			{version ? (
				<div className="container mx-auto space-y-6">
					<div className="mb-4 space-y-8 p-4 sm:px-6 sm:py-0">
						<QouteCard
							header="Song data is displayed based on the Ongeki version."
							welcomeMessage={
								<div className="flex flex-col space-y-1">
									<span>• Data includes detailed song information.</span>
									<span>• Use the search bar to filter songs by title.</span>
								</div>
							}
							color="#f067e9"
						/>
					</div>

					<div className="mb-4 space-y-8 p-4 sm:px-6 sm:py-0">
						<ScoreTable
							data={filterData(songs)}
							columns={columns}
							onSearch={(search) => setSearchQuery(search.value || "")}
						/>
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

export default OngekiAllSongs;
