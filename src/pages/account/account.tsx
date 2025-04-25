import React from "react";

import KeychipGenerator from "@/components/admin/keychip-generator";
import Header from "@/components/common/header";
import AimeCardSwap from "@/components/settings/common/aime-card";
import ArcadeOwnership from "@/components/settings/common/arcade-ownership";
import UserRoles from "@/components/settings/common/user-roles";
import { useAdmin } from "@/hooks/admin";

const Account = () => {
	const { data: systemAdmin } = useAdmin();
	const hasAdminPerms = systemAdmin?.isAdmin ?? false;

	return (
		<div className="relative flex-1 overflow-auto">
			<Header title={hasAdminPerms ? "Admin Dashboard" : "Account Dashboard"} />
			<div className="mb-4 space-y-8 p-4 sm:px-6 sm:py-0">
				{hasAdminPerms && <UserRoles />}

				{hasAdminPerms && <KeychipGenerator />}
				{hasAdminPerms && <ArcadeOwnership />}

				<AimeCardSwap />
			</div>
		</div>
	);
};

export default Account;
