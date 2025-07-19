import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { api } from "@/utils";

interface AvatarParts {
	head: number;
	back: number;
	wear: number;
	face: number;
	item: number;
	image: string;
	label: string;
	avatarHeadTexture?: string;
	avatarFaceTexture?: string;
	avatarBackTexture?: string;
	avatarWearTexture?: string;
	avatarItemTexture?: string;
	avatarAccessoryId?: number;
}

export function useCurrentAvatar() {
	return useQuery({
		queryKey: ["avatar", "current"],
		queryFn: async () => {
			const response = await api.chunithm.avatar.current.$get();
			if (!response.ok) {
				throw new Error();
			}

			return await response.json();
		},
	});
}
// Update avatar mutation
export function useUpdateAvatar() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (avatarParts: AvatarParts) => {
			const response = await api.chunithm.avatar.update.$post({
				json: avatarParts,
			});

			if (!response.ok) {
				throw new Error();
			}

			return response;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["avatar", "current"] });
		},
	});
}

export function useAllAvatarParts() {
	return useQuery({
		queryKey: ["avatar", "parts", "all"],
		queryFn: async () => {
			const response = await api.chunithm.avatar.parts.all.$get();
			if (!response.ok) {
				throw new Error();
			}

			const data = await response.json();

			return data || {};
		},
	});
}
