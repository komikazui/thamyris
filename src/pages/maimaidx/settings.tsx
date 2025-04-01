import React from "react";

import Header from "@/components/common/header";

interface GameSettingsProps {
	onUpdate?: () => void;
}

const MaimaiDxSettings: React.FC<GameSettingsProps> = () => {
	return (
		<div className="relative flex-1 overflow-auto">
			<Header title={"Maimai DX Settings"} />
			<div className="mb-4 space-y-8 p-4 sm:px-6 sm:py-0">
				<MaimaiDxVersionManager />
			</div>
		</div>
	);
};

export default MaimaiDxSettings;
