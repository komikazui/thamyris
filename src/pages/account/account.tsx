import React from "react";

import KeychipGenerator from "@/components/admin/keychip-generator";
import Header from "@/components/common/header";
import AimeCardSwap from "@/components/settings/common/aime-card";
import ArcadeOwnership from "@/components/settings/common/arcade-ownership";
import { useRoles } from "@/hooks/admin/use-admin";

const Account = () => {
	const { hasAdminPerms, isLoading: isCheckingAdmin } = useRoles();

	if (isCheckingAdmin) {
		return (
			<div className="relative flex-1 overflow-auto">
				<Header title="Account Dashboard" />
				<div className="mx-auto max-w-2xl space-y-6">
					<div className="rounded-lg bg-gray-800 p-6 shadow-md">
						<p className="text-center">Checking permissions...</p>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="relative flex-1 overflow-auto">
			<Header title={hasAdminPerms ? "Admin Dashboard" : "Account Dashboard"} />
			<div className="mb-4 space-y-8 p-4 sm:px-6 sm:py-0">
				{hasAdminPerms && <KeychipGenerator />}
				{hasAdminPerms && <ArcadeOwnership />}

				<AimeCardSwap />
			</div>
		</div>
	);
};

export default Account;
