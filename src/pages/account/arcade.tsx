import React from "react";

import Header from "@/components/common/header";
import ArcadeConfiguration from "@/components/settings/common/arcade-configuration";
import { useAdmin } from "@/hooks/admin";

const Arcade = () => {
	const { data: systemAdmin } = useAdmin();
	const hasAdminPerms = systemAdmin?.isAdmin ?? false;

	return (
		<div className="relative flex-1 overflow-auto">
			<Header title={"Arcade Management"} />
			<div className="mb-4 space-y-8 p-4 sm:px-6 sm:py-0">{hasAdminPerms && <ArcadeConfiguration />}</div>
		</div>
	);
};

export default Arcade;
