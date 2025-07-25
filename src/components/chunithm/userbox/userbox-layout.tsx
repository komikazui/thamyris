import React, { useEffect } from "react";

import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";

import Header from "@/components/common/header";
import { Button } from "@/components/ui/button";
import { useChunithmVersion } from "@/hooks/chunithm";
import { cn } from "@/lib/utils";

const UserboxLayout = () => {
	const version = useChunithmVersion();
	const location = useLocation();
	const navigate = useNavigate();

	const tabs = [
		{ id: "avatar", label: "Avatar", path: "/chunithm/userbox/avatar" },
		{ id: "nameplate", label: "Nameplate", path: "/chunithm/userbox/nameplate" },
		{ id: "trophy", label: "Trophy", path: "/chunithm/userbox/trophy" },
		{ id: "systemvoice", label: "System Voice", path: "/chunithm/userbox/systemvoice" },
		{ id: "mapicon", label: "Map Icon", path: "/chunithm/userbox/mapicon" },
		{ id: "character", label: "Character", path: "/chunithm/userbox/character", disabled: true },
		{ id: "background", label: "Background", path: "/chunithm/userbox/background", disabled: true },
	];

	// Redirect to avatar if we're at the base userbox route
	useEffect(() => {
		if (location.pathname === "/chunithm/userbox") {
			navigate("/chunithm/userbox/avatar", { replace: true });
		}
	}, [location.pathname, navigate]);

	return (
		<div className="relative flex h-full flex-1 flex-col overflow-hidden">
			<Header title={"Userbox"} />
			{version ? (
				<div className="flex flex-1 flex-col overflow-hidden">
					{/* Tab Navigation */}
					<div className="border-border flex-shrink-0 backdrop-blur-sm">
						<div className="flex items-center justify-center px-4 py-3">
							<div className="bg-foreground/70 flex space-x-1 rounded-md p-1">
								{tabs.map((tab) => (
									tab.disabled ? (
										<Button
											key={tab.id}
											variant="ghost"
											size="sm"
											disabled={true}
											className={cn(
												"transition-all duration-200",
												"text-muted-foreground cursor-not-allowed opacity-50"
											)}
										>
											{tab.label}
										</Button>
									) : (
										<NavLink key={tab.id} to={tab.path}>
											{({ isActive }) => (
												<Button
													variant={isActive ? "default" : "ghost"}
													size="sm"
													className={cn(
														"transition-all duration-200",
														isActive
															? "text-primary hover:bg-buttonhover bg-button cursor-pointer"
															: "text-primary hover:text-primary hover:bg-buttonhover cursor-pointer"
													)}
												>
													{tab.label}
												</Button>
											)}
										</NavLink>
									)
								))}
							</div>
						</div>
					</div>

					{/* Tab Content */}
					<div className="flex-1 overflow-hidden p-4">
						<div className="h-full">
							<Outlet />
						</div>
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

export default UserboxLayout;
