import { useQuery } from "@tanstack/react-query";
import { api } from "@/utils";

type RolesResponse = {
  isAdmin: boolean;
  
};

export const useAdmin = () => {
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
    hasAdminPerms: data?.isAdmin ?? false,
   
    isLoading,
    error,
  };
};