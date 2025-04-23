import { useState } from "react";
import React from "react";

import Header from "@/components/common/header";
import QouteCard from "@/components/common/qoutecard";
import Spinner from "@/components/common/spinner";
import TableComponent from "@/components/common/table";
import { useChunithmSongs, useChunithmVersion } from "@/hooks/chunithm";
import { cdnUrl } from "@/lib/constants";
import { getAllowedChunithmOptions, getDifficultyFromChunithmChart } from "@/utils/helpers";
import { useAdmin, useSpecial } from "@/hooks/admin/use-admin";

interface ChunithmSong {
	title: string;
	jacketPath?: string;
	artist?: string;
	level?: number;
	difficulty?: string;
	chartId?: number;
	genre?: string;
	option?: string;
}
const ChunithmAllSongs = () => {
	const { data: songs = [], isLoading: isLoadingSongs } = useChunithmSongs() as {
		data: ChunithmSong[];
		isLoading: boolean;
	};
	const version = useChunithmVersion();
	const [searchQuery, setSearchQuery] = useState("");

	const { isSpecial } = useSpecial();
	const { isAdmin } = useAdmin();

	const allowedOptions = getAllowedChunithmOptions(isSpecial, isAdmin);

	const columns = {
		Song: (row: ChunithmSong) => (
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
		Artist: (row: ChunithmSong) => row.artist || "Unknown",
		Level: (row: ChunithmSong) => row.level || "N/A",
		Difficulty: (row: ChunithmSong) => getDifficultyFromChunithmChart(row.chartId ?? 0),
		Genre: (row: ChunithmSong) => row.genre || "N/A",
	};

	const filterData = (data: ChunithmSong[]) => {
		return data
			.filter((song) => {
				const isAllowed = allowedOptions.includes(song.option || "");
				return (
					song.title?.toLowerCase().includes(searchQuery.toLowerCase()) &&
					(isSpecial || isSpecial || isAllowed)
				);
			})
	};

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
					</div>

					<div className="mb-4 space-y-8 p-4 sm:px-6 sm:py-0">
						<TableComponent
							data={filterData(songs)}
							columns={columns}
							onSearch={(search) => setSearchQuery(search.value || "")}
						/>
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

export default ChunithmAllSongs;