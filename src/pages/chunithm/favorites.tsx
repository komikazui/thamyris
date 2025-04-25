import { useState } from "react";
import React from "react";

import { Heart } from "lucide-react";
import { toast } from "sonner";

import Header from "@/components/common/header";
import Spinner from "@/components/common/spinner";
import TableComponent from "@/components/common/table";
import { useAdmin } from "@/hooks/admin";
import {
	useAddFavorite,
	useChunithmSongs,
	useChunithmVersion,
	useFavorites,
	useRemoveFavorite,
} from "@/hooks/chunithm";
import { cdnUrl } from "@/lib/constants";
import { getAllowedChunithmOptions } from "@/utils/helpers";

interface ChunithmFavorite {
	songId?: number;
	title?: string;
	chartId?: number;
	isFavorited?: boolean;
	jacketPath?: string | null;
	id?: number;
	user?: number;
	version?: number;
	favId?: number;
	favKind?: number;
	option?: string;
}
const ChunithmFavorites = () => {
	const version = useChunithmVersion();
	const { data: songs = [], isLoading: isLoadingSongs } = useChunithmSongs() as {
		data: ChunithmFavorite[];
		isLoading: boolean;
	};
	const { data: favoriteSongIds = [], isLoading: isLoadingFavorites } = useFavorites();
	const { mutate: addFavorite } = useAddFavorite();
	const { mutate: removeFavorite } = useRemoveFavorite();
	const [searchQuery, setSearchQuery] = useState("");

	const { data: systemAdmin } = useAdmin();
	const hasAdminPerms = systemAdmin?.isAdmin ?? false;

	const allowedOptions = getAllowedChunithmOptions(hasAdminPerms);

	const handleToggleFavorite = (songId: number) => {
		const isFavorited = favoriteSongIds.some((fav) => fav.favId === songId);

		if (isFavorited) {
			removeFavorite(songId, {
				onSuccess: () => {
					toast.success("Removed from favorites");
				},
				onError: () => {
					toast.error("Failed to remove from favorites");
				},
			});
		} else {
			addFavorite(songId, {
				onSuccess: () => {
					toast.success("Added to favorites");
				},
				onError: () => {
					toast.error("Failed to add to favorites");
				},
			});
		}
	};

	const filteredSongs = songs.filter((song) => {
		const isAllowed = allowedOptions.includes(song.option || "");
		return song.chartId === 3 && song.title?.toLowerCase().includes(searchQuery.toLowerCase()) && isAllowed;
	});

	const columns = {
		Jacket: (row: ChunithmFavorite) => (
			<img
				width={40}
				height={40}
				src={`${cdnUrl}/jacket/${row.jacketPath?.replace(".dds", ".png")}`}
				alt={row.title}
				className="flex-shrink-0"
			/>
		),
		Title: (row: ChunithmFavorite) => <span className="text-primary truncate">{row.title}</span>,
		Favorite: (row: ChunithmFavorite) => {
			const isFavorited = favoriteSongIds.some((favorite: ChunithmFavorite) => favorite.favId === row.songId);
			return (
				<Heart
					fill={isFavorited ? "currentColor" : "none"}
					className={`h-5 w-5 cursor-pointer ${isFavorited ? "text-red-500" : "text-gray-500"}`}
					onClick={() => handleToggleFavorite(row.songId ?? 0)}
				/>
			);
		},
	};

	if (isLoadingSongs || isLoadingFavorites) {
		return (
			<div className="relative flex-1 overflow-auto">
				<Header title="Favorites" />
				<div className="flex h-[calc(100vh-64px)] items-center justify-center">
					<Spinner size={24} />
				</div>
			</div>
		);
	}

	return (
		<div className="relative flex-1 overflow-auto">
			<Header title="Favorites" />
			{version ? (
				<div className="space-y-6">
					<div className="mb-4 space-y-4 p-4 sm:px-6 sm:py-0">
						<TableComponent
							data={filteredSongs}
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

export default ChunithmFavorites;
