import { useQuery } from "@tanstack/react-query";
import { api } from "@/utils";

interface UserRolesResponse {
  roles: Record<string, number>;
}

export function useUserRoles() {
  return useQuery<UserRolesResponse, Error>({
    queryKey: ["userRoles"],
    queryFn: async () => {
      const response = await api.admin.user.roles.$get();
      if (!response.ok) {
        throw new Error("Failed to fetch user roles");
      }
      return response.json();
    },
  });
}