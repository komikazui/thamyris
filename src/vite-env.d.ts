/// <reference types="vite/client" />

interface ClientEnv {
	// Any custom env variables set in
	// vite.config.ts -> define -> env
	readonly CHUNI_CDN_URL: string;
	readonly BUNNY_CDN_PULLZONE: string;
	readonly BUILD_HASH: string;
	readonly BUILD_HASH: string;
	readonly CFTurnstileKey: string;
	readonly BUILD_DATE_YEAR_MONTH_DAY: string;
	readonly BUILD_TIME_12_HOUR: string;
	readonly BUNNY_API_URL: string;
	readonly BUNNY_API_KEY: string;
	// Meh, could just expose the NODE_ENV
	// directly instead of this
	readonly USE_REACT_STRICT: boolean;
}

declare const env: ClientEnv;
