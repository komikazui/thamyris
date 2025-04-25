import { useMutation } from "@tanstack/react-query";
import { api } from "@/utils";

interface UpdateUserRoleResponse {
  success?: boolean;
  error?: string;
}

interface UpdateUserRoleVariables {
  userId: number;
  role: 'upload' | 'download' | 'special';
  value: 0 | 1;
}

export function useUpdateUserRole() {
  return useMutation<UpdateUserRoleResponse, Error, UpdateUserRoleVariables>({
    mutationFn: async ({ userId, role, value }) => {
      const response = await api.admin.user.role.update.$post({
        json: { userId, role, value },
      });

      if (!response.ok) {
        throw new Error();
      }

      return response.json();
    },
    onError: (error) => {
      console.error("Error updating user role:", error);
    },
  });
}