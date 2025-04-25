import React from "react";

import Header from "@/components/common/header";
import ArcadeConfiguration from "@/components/settings/common/arcade-configuration";
import { useAdmin } from "@/hooks/admin";

const Arcade = () => {
	const { hasAdminPerms, isLoading: isCheckingAdmin } = useAdmin();

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
			<Header title={"Arcade Management"} />
			<div className="mb-4 space-y-8 p-4 sm:px-6 sm:py-0">{hasAdminPerms && <ArcadeConfiguration />}</div>
		</div>
	);
};

export default Arcade;
