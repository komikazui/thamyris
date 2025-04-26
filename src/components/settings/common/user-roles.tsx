import React, { useState } from "react";

import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { toast } from "sonner";

import { SubmitButton } from "@/components/common/button";
import Spinner from "@/components/common/spinner";
import { useUpdateUserRole } from "@/hooks/users";
import { useUsers } from "@/hooks/users/use-arcade";

const ROLE_OPTIONS = ["has_upload", "has_download", "has_special"] as const;
type RoleType = (typeof ROLE_OPTIONS)[number];

const ROLE_LABELS: Record<RoleType, string> = {
	has_upload: "Upload Permissions",
	has_download: "Download Permissions",
	has_special: "Special User",
};

const UserRoles = () => {
	const [userDropdownOpen, setUserDropdownOpen] = useState(false);
	const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);
	const [selectedUser, setSelectedUser] = useState<number | null>(null);
	const [selectedRole, setSelectedRole] = useState<RoleType | null>(null);

	const { data: users, isLoading: isLoadingUsers } = useUsers();
	const { mutate: updateUserRole, isPending } = useUpdateUserRole();

	const hasChanges = () => selectedUser !== null && selectedRole !== null;

	const handleSubmit = () => {
		if (hasChanges()) {
			updateUserRole(
				{ userId: selectedUser!, role: selectedRole!, value: 1 },
				{
					onSuccess: () => {
						toast.success("User role updated successfully");
						setUserDropdownOpen(false);
						setRoleDropdownOpen(false);
						setSelectedRole(null);
					},
					onError: (error) => {
						toast.error("Failed to update user role");
						console.error("Error updating role:", error);
					},
				}
			);
		}
	};

	const getSelectedUserLabel = () => {
		if (selectedUser === null) return "Select User";
		const selected = users?.find((user) => user.id === selectedUser);
		return selected?.username || selected?.id || "";
	};

	const getSelectedRoleLabel = () => {
		return selectedRole ? ROLE_LABELS[selectedRole] : "Select Role";
	};

	if (isLoadingUsers) {
		return (
			<div>
				<Spinner size={24} color="#ffffff" />
			</div>
		);
	}

	return (
		<div className="bg-card rounded-md p-6">
			<h2 className="text-primary mb-2 text-xl font-semibold">User Role Management</h2>
			<div className="text-primary mb-4 text-sm">Manage user roles and permissions</div>

			{/* User Dropdown */}
			<div className="mb-4">
				<button
					onClick={() => setUserDropdownOpen((o) => !o)}
					className="bg-dropdown hover:bg-dropdownhover flex w-full items-center justify-between rounded-md p-3 transition-colors"
				>
					<span className="text-primary truncate">{getSelectedUserLabel()}</span>
					<ChevronDown className={`text-primary h-5 w-5 transition-transform ${userDropdownOpen ? "rotate-180" : ""}`} />
				</button>
				<AnimatePresence>
					{userDropdownOpen && (
						<motion.div
							initial={{ opacity: 0, height: 0 }}
							animate={{ opacity: 1, height: "auto", maxHeight: "285px" }}
							exit={{ opacity: 0, height: 0 }}
							className="mt-2 overflow-hidden"
							onClick={(e) => e.stopPropagation()}
						>
							<div className="text-primary max-h-[285px] space-y-2 overflow-y-auto pr-2">
								{users
									?.filter((user) => user.username && user.username.trim() !== "")
									.map((user) => (
										<div
											key={user.id}
											onClick={() => {
												setSelectedUser(user.id);
												setUserDropdownOpen(false);
											}}
											className="bg-dropdownhover hover:bg-dropdownhoverhover cursor-pointer rounded-md p-3"
										>
											{user.username}
										</div>
									))}
							</div>
						</motion.div>
					)}
				</AnimatePresence>
			</div>

			{/* Role Dropdown */}
			<div className="mb-4">
				<button
					onClick={() => setRoleDropdownOpen((o) => !o)}
					className="bg-dropdown hover:bg-dropdownhover flex w-full items-center justify-between rounded-md p-3 transition-colors"
				>
					<span className="text-primary truncate">{getSelectedRoleLabel()}</span>
					<ChevronDown className={`text-primary h-5 w-5 transition-transform ${roleDropdownOpen ? "rotate-180" : ""}`} />
				</button>
				<AnimatePresence>
					{roleDropdownOpen && (
						<motion.div
							initial={{ opacity: 0, height: 0 }}
							animate={{ opacity: 1, height: "auto", maxHeight: "285px" }}
							exit={{ opacity: 0, height: 0 }}
							className="mt-2 overflow-hidden"
							onClick={(e) => e.stopPropagation()}
						>
							<div className="text-primary max-h-[285px] space-y-2 overflow-y-auto pr-2">
								{ROLE_OPTIONS.map((role) => (
									<div
										key={role}
										onClick={() => {
											setSelectedRole(role);
											setRoleDropdownOpen(false);
										}}
										className="bg-dropdownhover hover:bg-dropdownhoverhover cursor-pointer rounded-md p-3"
									>
										{ROLE_LABELS[role]}
									</div>
								))}
							</div>
						</motion.div>
					)}
				</AnimatePresence>
			</div>

			<SubmitButton
				onClick={handleSubmit}
				defaultLabel="Update Role"
				updatingLabel="Updating..."
				disabled={!hasChanges() || isPending}
			/>
		</div>
	);
};

export default UserRoles;
