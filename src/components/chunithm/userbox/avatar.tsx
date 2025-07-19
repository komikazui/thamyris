/**
 * Avatar Component - Refactored to use grid-based item selection
 *
 * This component combines:
 * - Avatar display using the useAvatar hook
 * - AvatarItemGrid for item selection and customization
 *
 * The old dropdown-based approach has been replaced with a more visual
 * grid system that supports filtering, searching, and better UX.
 */
import React from "react";

import { useAvatar } from "@/hooks/chunithm/userbox/avatar";

import AvatarItemGrid from "./item";

const Avatar = () => {
	const { render, items, equip } = useAvatar();
	const equippedItems = items.map((item) => ({
		id: item.id,
		slot: item.slot,
	}));

	return (
		<div className="z-0 flex w-full flex-col gap-6">
			{/* Avatar Display */}
			<div className="flex items-center justify-center">{render}</div>

			{/* Item Grid */}
			<div className="bg-card w-full rounded-md p-4 md:p-6">
				<AvatarItemGrid onEquip={equip} equippedItems={equippedItems} />
			</div>
		</div>
	);
};

export default Avatar;
