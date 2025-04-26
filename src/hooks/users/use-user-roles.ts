import { api } from "@/utils";
import { useQuery } from "@tanstack/react-query";

interface RoleResponse {
  upload: number;
  download: number;
  special: number;
}

interface ParsedRoles {
  upload: number;
  download: number;
  special: number;
}

export const useUserRoles = () => {
  return useQuery({
    queryKey: ["userRoles"],
    queryFn: async () => {
      const response = await api.users.roles.$get();
      if (!response.ok) {
        throw new Error();
      }
      
      const data = await response.json() as RoleResponse;
      
      // Convert all values to numbers
      const parsedData: ParsedRoles = {
        upload: Number(data.upload),
        download: Number(data.download),
        special: Number(data.special)
      };
      
      return parsedData;
    },
  });
};