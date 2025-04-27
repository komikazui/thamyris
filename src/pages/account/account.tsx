import React from "react";

import KeychipGenerator from "@/components/admin/keychip-generator";
import Header from "@/components/common/header";
import AimeCardSwap from "@/components/settings/common/aime-card";
import ArcadeOwnership from "@/components/settings/common/arcade-ownership";
import UserRoles from "@/components/settings/common/user-roles";
import { useAdmin } from "@/hooks/admin";
import { hasAdminAccess } from "@/utils/permissions";

const Account = () => {
	const { data: systemAdmin } = useAdmin();

	const adminPerms = hasAdminAccess(systemAdmin);

	return (
		<div className="relative flex-1 overflow-auto">
			<Header title={adminPerms ? "Admin Dashboard" : "Account Dashboard"} />
			<div className="mb-4 space-y-8 p-4 sm:px-6 sm:py-0">
				{adminPerms && <UserRoles />}

				{adminPerms && <KeychipGenerator />}
				{adminPerms && <ArcadeOwnership />}

				<AimeCardSwap />
			</div>
		</div>
	);
};

export default Account;
