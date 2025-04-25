import { useQuery } from "@tanstack/react-query";
import { api } from "@/utils";

type RolesResponse = {
  isAdmin: boolean;
  isSpecial: boolean;
  hasDownloads: boolean;
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
    isAdmin: data?.isAdmin ?? false,
    isSpecial: data?.isSpecial ?? false,
    hasDownloads: data?.hasDownloads ?? false,
    isLoading,
    error,
  };
};
