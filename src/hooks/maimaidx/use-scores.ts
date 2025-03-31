import { useQuery } from "@tanstack/react-query";

import { api } from "@/utils";

// Fetch Chunithm scores
export function useMaimaidxScores() {
	return useQuery({
		queryKey: ["maimaidx", "scores"],
		queryFn: async () => {
			const response = await api.maimaidx.profile.playlog.$get();

			if (!response.ok) {
				throw new Error();
			}

			return await response.json();
		},
	});
}
