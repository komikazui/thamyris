import { useEffect, useState } from "react";

import { api } from "@/utils";

export const useAdmin = () => {
	const [isAdmin, setIsAdmin] = useState(false);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		const checkAdminStatus = async () => {
			try {
				const response = await api.admin.isadmin.$get();
				if (response.ok) {
					setIsAdmin(true);
				} else {
					setIsAdmin(false);
				}
			} catch {
				setError("Failed to verify admin status");
				setIsAdmin(false);
			} finally {
				setIsLoading(false);
			}
		};

		checkAdminStatus();
	}, []);

	return { isAdmin, isLoading, error };
};

export const useSpecial = () => {
	const [isSpecial, setIsSpecial] = useState(false);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		const checkAdminStatus = async () => {
			try {
				const response = await api.admin.isspecial.$get();
				if (response.ok) {
					setIsSpecial(true);
				} else {
					setIsSpecial(false);
				}
			} catch {
				setError("Failed to verify admin status");
				setIsSpecial(false);
			} finally {
				setIsLoading(false);
			}
		};

		checkAdminStatus();
	}, []);

	return { isSpecial, isLoading, error };
};

