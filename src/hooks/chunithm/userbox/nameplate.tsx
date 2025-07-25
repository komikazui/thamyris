import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { api } from "@/utils";

export interface NameplateItem {
	id: number;
	imagePath: string;
	label: string;
	locked: boolean;
}

export function useCurrentNameplate() {
	return useQuery({
		queryKey: ["userbox", "nameplate", "current"],
		queryFn: async () => {
			const response = await api.chunithm.userbox.nameplate.$get();
			if (!response.ok) {
				throw new Error("Failed to fetch current nameplate");
			}
			return (await response.json()) as NameplateItem;
		},
	});
}

export function useSearchNameplates(filters: { locked: boolean | null }) {
	return useQuery({
		queryKey: ["userbox", "nameplate", "search", filters],
		queryFn: async () => {
			const response = await api.chunithm.userbox.nameplate.search.$post({
				json: {
					filter: filters,
				},
			});

			if (!response.ok) {
				throw new Error("Failed to search nameplates");
			}

			return await response.json();
		},
	});
}

export function useEquipNameplate() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (nameplateId: number) => {
			const response = await api.chunithm.userbox.nameplate.$post({
				json: { nameplateId },
			});

			if (!response.ok) {
				throw new Error("Failed to equip nameplate");
			}

			return await response.json();
		},
		onSuccess: (_, nameplateId) => {
			// Update current nameplate in cache
			queryClient.setQueryData(["userbox", "nameplate", "current"], (old: NameplateItem | undefined) => {
				if (!old) return old;
				// Find the equipped item from search cache or create minimal data
				const searchQueries = queryClient.getQueriesData({ queryKey: ["userbox", "nameplate", "search"] });
				let equippedItem = null;

				for (const [, searchData] of searchQueries) {
					if (searchData && typeof searchData === "object" && "items" in searchData) {
						const items = (searchData as any).items as NameplateItem[];
						equippedItem = items.find((item) => item.id === nameplateId);
						if (equippedItem) break;
					}
				}

				return equippedItem || { ...old, id: nameplateId };
			});

			// Update search results to reflect new equipped status
			queryClient.setQueriesData({ queryKey: ["userbox", "nameplate", "search"] }, (old: any) => {
				if (!old?.items) return old;
				return {
					...old,
					items: old.items.map((item: NameplateItem) => ({
						...item,
						// Only the equipped item should be marked as equipped
					})),
				};
			});
		},
	});
}

export function useUnlockNameplate() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (nameplateId: number) => {
			const response = await api.chunithm.userbox.nameplate.unlock[":id"].$patch({
				param: { id: nameplateId.toString() },
			});

			if (!response.ok) {
				throw new Error("Failed to unlock nameplate");
			}

			return await response.json();
		},
		onSuccess: (_, nameplateId) => {
			// Update search results to mark item as unlocked
			queryClient.setQueriesData({ queryKey: ["userbox", "nameplate", "search"] }, (old: any) => {
				if (!old?.items) return old;
				return {
					...old,
					items: old.items.map((item: NameplateItem) => (item.id === nameplateId ? { ...item, locked: false } : item)),
				};
			});
		},
	});
}
