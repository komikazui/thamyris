import React, { useState } from "react";

import MapIcon from "@/components/chunithm/mapicon-customization";
import SystemVoice from "@/components/chunithm/systemvoice-customization";
import Trophies from "@/components/chunithm/trophies";
import Avatar from "@/components/chunithm/userbox/avatar";
import Nameplate from "@/components/chunithm/userbox/nameplate";
import Header from "@/components/common/header";
import { Button } from "@/components/ui/button";
import { useChunithmVersion } from "@/hooks/chunithm";
import { cn } from "@/lib/utils";

const ChunithmUserbox = () => {
	const version = useChunithmVersion();
	const [activeTab, setActiveTab] = useState("avatar");

	const tabs = [
		{ id: "avatar", label: "Avatar" },
		{ id: "nameplate", label: "Nameplate" },
		{ id: "trophy", label: "Trophy" },
		{ id: "systemvoice", label: "System Voice" },
		{ id: "mapicon", label: "Map Icon" },
	];

	const renderTabContent = () => {
		const active = "block w-full";
		return (
			<>
				<div className={activeTab === "avatar" ? active : "hidden"}>
					<Avatar />
				</div>
				<div className={activeTab === "nameplate" ? active : "hidden"}>
					<Nameplate />
				</div>
				<div className={activeTab === "trophy" ? active : "hidden"}>
					<Trophies />
				</div>
				<div className={activeTab === "systemvoice" ? active : "hidden"}>
					<SystemVoice />
				</div>
				<div className={activeTab === "mapicon" ? active : "hidden"}>
					<MapIcon />
				</div>
			</>
		);
	};

	return (
		<div className="relative flex-1 overflow-auto">
			<Header title={"Userbox"} />
			{version ? (
				<div className="flex flex-col">
					{/* Tab Navigation */}
					<div className="border-border bg-background/80 sticky top-0 z-10 backdrop-blur-sm">
						<div className="flex items-center justify-center px-4 py-3">
							<div className="bg-muted flex space-x-1 rounded-lg p-1">
								{tabs.map((tab) => (
									<Button
										key={tab.id}
										variant={activeTab === tab.id ? "default" : "ghost"}
										size="sm"
										onClick={() => setActiveTab(tab.id)}
										className={cn(
											"transition-all duration-200",
											activeTab === tab.id
												? "bg-background text-foreground shadow-sm"
												: "text-muted-foreground hover:text-foreground hover:bg-background/60"
										)}
									>
										{tab.label}
									</Button>
								))}
							</div>
						</div>
					</div>

					{/* Tab Content */}
					<div className="flex-1 p-4">
						<div className="flex">{renderTabContent()}</div>
					</div>
				</div>
			) : (
				<div className="flex h-[calc(100vh-64px)] items-center justify-center">
					<p className="text-primary">Please set your Chunithm version in settings first</p>
				</div>
			)}
		</div>
	);
};

export default ChunithmUserbox;
