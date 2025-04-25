import { useQuery } from "@tanstack/react-query";
import { api } from "@/utils";

type RolesResponse = {
  hasAdminPerms: boolean;
  hasSpecialPerms: boolean;
  hasDownloadPerms: boolean;
};

export const useRoles = () => {
  const { data, error, isLoading } = useQuery<RolesResponse>({
    queryKey: ["userRoles"],
    queryFn: async () => {
      const response = await api.admin.roles.$get();
      if (!response.ok) {
        throw new Error("Failed to fetch roles");
      }
      return response.json();
    },
  });

  return {
    hasAdminPerms: data?.hasAdminPerms ?? false,
    hasSpecialPerms: data?.hasSpecialPerms ?? false,
    hasDownloadPerms: data?.hasDownloadPerms ?? false,
    isLoading,
    error,
  };
};
