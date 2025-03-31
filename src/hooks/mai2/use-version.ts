import { useMutation, useQuery } from "@tanstack/react-query";

import { api } from "@/utils";

import { useAuth } from "../auth";
import { useCurrentUser } from "../users";

export const useMai2Version = (): number => {
	const { versions } = useCurrentUser();
	return versions.chunithm_version;
};

export const useMai2Versions = () => {
	return useQuery({
		queryKey: ["mai2Versions"],
		queryFn: async () => {
			const response = await api.maimaidx.cozynet.versions.$get();
			if (!response.ok) {
				throw new Error();
			}

			return await response.json();
		},
	});
};

export const useUpdateMai2Version = () => {
	const { setUser } = useAuth();
	return useMutation({
		mutationFn: async (version: number) => {
			const response = await api.maimaidx.cozynet.update.$post({
				json: { version },
			});
			if (!response.ok) {
				throw new Error();
			}

			const user = await response.json();
			setUser(user);
		},
	});
};
