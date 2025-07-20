import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { api } from "@/utils";

export interface TrophyItem {
	id: number;
	imagePath: string;
	label: string;
	locked: boolean;
}

export function useCurrentTrophy() {
	return useQuery({
		queryKey: ["userbox", "trophy", "current"],
		queryFn: async () => {
			const response = await api.chunithm.userbox.trophy.$get();
			if (!response.ok) {
				throw new Error("Failed to fetch current trophy");
			}
			return (await response.json()) as TrophyItem;
		},
	});
}

export function useSearchTrophies(filters: { locked: boolean | null }, page: number) {
	return useQuery({
		queryKey: ["userbox", "trophy", "search", filters, page],
		queryFn: async () => {
			const response = await api.chunithm.userbox.trophy.search.$post({
				json: {
					filter: filters,
					pagination: {
						page,
						limit: 30,
					},
				},
			});

			if (!response.ok) {
				throw new Error("Failed to search trophies");
			}

			return await response.json();
		},
	});
}

export function useEquipTrophy() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (trophyId: number) => {
			const response = await api.chunithm.userbox.trophy.$post({
				json: { trophyId },
			});

			if (!response.ok) {
				throw new Error("Failed to equip trophy");
			}

			return await response.json();
		},
		onSuccess: (_, trophyId) => {
			// Update current trophy in cache
			queryClient.setQueryData(["userbox", "trophy", "current"], (old: TrophyItem | undefined) => {
				if (!old) return old;
				const searchQueries = queryClient.getQueriesData({ queryKey: ["userbox", "trophy", "search"] });
				let equippedItem = null;

				for (const [, searchData] of searchQueries) {
					if (searchData && typeof searchData === "object" && "items" in searchData) {
						const items = (searchData as any).items as TrophyItem[];
						equippedItem = items.find((item) => item.id === trophyId);
						if (equippedItem) break;
					}
				}

				return equippedItem || { ...old, id: trophyId };
			});
		},
	});
}

export function useUnlockTrophy() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (trophyId: number) => {
			const response = await api.chunithm.userbox.trophy.unlock[":id"].$patch({
				param: { id: trophyId.toString() },
			});

			if (!response.ok) {
				throw new Error("Failed to unlock trophy");
			}

			return await response.json();
		},
		onSuccess: (_, trophyId) => {
			// Update search results to mark item as unlocked
			queryClient.setQueriesData({ queryKey: ["userbox", "trophy", "search"] }, (old: any) => {
				if (!old?.items) return old;
				return {
					...old,
					items: old.items.map((item: TrophyItem) => (item.id === trophyId ? { ...item, locked: false } : item)),
				};
			});
		},
	});
}
