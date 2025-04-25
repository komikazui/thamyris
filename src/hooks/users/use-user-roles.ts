import { api } from "@/utils";
import { useQuery } from "@tanstack/react-query";

export const useUserRoles = () => {
    return useQuery({
        queryKey: ["userRoles"],
        queryFn: async () => {
            const response = await api.users.roles.$get();
            if (!response.ok) {
                throw new Error();
            }

            return await response.json();
        },
    });
};