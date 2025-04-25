// hooks/users/use-files.ts
import { useQuery } from "@tanstack/react-query";

export function useFiles(path = "") {
	return useQuery({
		queryKey: ["files", path],
		queryFn: async () => {
			const url = `https://${env.BUNNY_API_URL}/${path}`;
			const options = {
				method: "GET",
				headers: {
					accept: "application/json",
					AccessKey: `${env.BUNNY_API_KEY}`,
				},
			};

			const response = await fetch(url, options);
			if (!response.ok) throw new Error("Failed to fetch files.");
			return await response.json();
		},
	});
}
