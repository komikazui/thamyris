import { TrophyRareType } from "./enums";

export const CDN = env.CDN_URL;
export const turnstile = env.CFTurnstileKey;

export const honorBackgrounds: Record<TrophyRareType, string> = {
	[TrophyRareType.Normal]: `${CDN}/chunithm/honorBackgrounds/honor_bg_normal.png`,
	[TrophyRareType.Bronze]: `${CDN}/chunithm/honorBackgrounds/honor_bg_bronze.png`,
	[TrophyRareType.Silver]: `${CDN}/chunithm/honorBackgrounds/honor_bg_silver.png`,
	[TrophyRareType.Gold]: `${CDN}/chunithm/honorBackgrounds/honor_bg_gold.png`,
	[TrophyRareType.Gold2]: `${CDN}/chunithm/honorBackgrounds/honor_bg_gold.png`,
	[TrophyRareType.Platinum]: `${CDN}/chunithm/honorBackgrounds/honor_bg_platina.png`,
	[TrophyRareType.Platinum2]: `${CDN}/chunithm/honorBackgrounds/honor_bg_platina.png`,
	[TrophyRareType.Rainbow]: `${CDN}/chunithm/honorBackgrounds/honor_bg_rainbow.png`,
	[TrophyRareType.Staff]: `${CDN}/chunithm/honorBackgrounds/honor_bg_staff.png`,
	[TrophyRareType.Ongeki]: `${CDN}/chunithm/honorBackgrounds/honor_bg_ongeki.png`,
	[TrophyRareType.Maimai]: `${CDN}/chunithm/honorBackgrounds/honor_bg_maimai.png`,
	[TrophyRareType.Duals]: `${CDN}/chunithm/honorBackgrounds/honor_bg_platina.png`,
	[TrophyRareType.Idori]: `${CDN}/chunithm/honorBackgrounds/honor_bg_platina.png`,
	[TrophyRareType.Lamp]: ``,
	[TrophyRareType.Lamp2]: ``,
	[TrophyRareType.Lamp3]: ``,
	[TrophyRareType.Kop]: ``,
	[TrophyRareType.Kop2]: ``,
};
