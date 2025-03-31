import React from "react";

import { CircleArrowDown, CircleArrowRight, CircleArrowUp, Search } from "lucide-react";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cdnUrl } from "@/lib/constants";
import { getChunithmGrade, getDifficultyFromChunithmChart } from "@/utils/helpers";

interface Mai2Score {
	id: number;
	user: number;
	userId: number | null;
	orderId: number | null;
	playlogId: number | null;
	version: number | null;
	placeId: number | null;
	placeName: string | null;
	loginDate: number | null;
	playDate: string | null;
	userPlayDate: string | null;
	type: number | null;
	musicId: number | null;
	level: number | null;
	trackNo: number | null;
	vsMode: number | null;
	vsUserName: string | null;
	vsStatus: number | null;
	vsUserRating: number | null;
	vsUserAchievement: number | null;
	vsUserGradeRank: number | null;
	vsRank: number | null;
	playerNum: number | null;
	playedUserId1: number | null;
	playedUserName1: string | null;
	playedMusicLevel1: number | null;
	playedUserId2: number | null;
	playedUserName2: string | null;
	playedMusicLevel2: number | null;
	playedUserId3: number | null;
	playedUserName3: string | null;
	playedMusicLevel3: number | null;
	characterId1: number | null;
	characterLevel1: number | null;
	characterAwakening1: number | null;
	characterId2: number | null;
	characterLevel2: number | null;
	characterAwakening2: number | null;
	characterId3: number | null;
	characterLevel3: number | null;
	characterAwakening3: number | null;
	characterId4: number | null;
	characterLevel4: number | null;
	characterAwakening4: number | null;
	characterId5: number | null;
	characterLevel5: number | null;
	characterAwakening5: number | null;
	achievement: number | null;
	deluxscore: number | null;
	scoreRank: number | null;
	maxCombo: number | null;
	totalCombo: number | null;
	maxSync: number | null;
	totalSync: number | null;
	tapCriticalPerfect: number | null;
	tapPerfect: number | null;
	tapGreat: number | null;
	tapGood: number | null;
	tapMiss: number | null;
	holdCriticalPerfect: number | null;
	holdPerfect: number | null;
	holdGreat: number | null;
	holdGood: number | null;
	holdMiss: number | null;
	slideCriticalPerfect: number | null;
	slidePerfect: number | null;
	slideGreat: number | null;
	slideGood: number | null;
	slideMiss: number | null;
	touchCriticalPerfect: number | null;
	touchPerfect: number | null;
	touchGreat: number | null;
	touchGood: number | null;
	touchMiss: number | null;
	breakCriticalPerfect: number | null;
	breakPerfect: number | null;
	breakGreat: number | null;
	breakGood: number | null;
	breakMiss: number | null;
	isTap: boolean | null;
	isHold: boolean | null;
	isSlide: boolean | null;
	isTouch: boolean | null;
	isBreak: boolean | null;
	isCriticalDisp: boolean | null;
	isFastLateDisp: boolean | null;
	fastCount: number | null;
	lateCount: number | null;
	isAchieveNewRecord: boolean | null;
	isDeluxscoreNewRecord: boolean | null;
	comboStatus: number | null;
	syncStatus: number | null;
	isclear: number | null;
	beforeRating: number | null;
	afterRating: number | null;
	beforeGrade: number | null;
	afterGrade: number | null;
	afterGradeRank: number | null;
	beforeDeluxRating: number | null;
	afterDeluxRating: number | null;
	isPlayTutorial: boolean | null;
	isEventMode: boolean | null;
	isFreedomMode: boolean | null;
	playMode: number | null;
	isNewFree: boolean | null;
	extNum1: number | null;
	extNum2: number | null;
	extNum4: number | null;
	extBool1: boolean | null;
	trialPlayAchievement: number | null;
	title?: string;
	jacketPath?: string;
	chartId?: number;
	rating_change?: "Increase" | "Decrease" | "Same";
}

interface MaimaiDxScoreTableProps {
	scores: Mai2Score[];
	searchQuery: string;
	onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const MaimaiDxScoreTable = ({ scores, searchQuery, onSearchChange }: MaimaiDxScoreTableProps) => {
	const filteredScores = scores.filter((score) => score.title?.toLowerCase().includes(searchQuery.toLowerCase()));

	return (
		<div className="bg-card rounded-md p-4 sm:p-6">
			<div className="mb-4 flex flex-col items-center justify-between gap-4 sm:mb-6 sm:flex-row">
				<h2 className="text-primary text-lg font-semibold sm:text-xl">Recent Scores</h2>
				<div className="relative w-full sm:w-auto">
					<input
						type="text"
						placeholder="Search songs..."
						className="bg-searchbar text-primary placeholder-primary focus:ring-primary w-full rounded-lg py-2 pr-4 pl-10 focus:outline-none"
						value={searchQuery}
						onChange={onSearchChange}
					/>
					<Search className="text-primary absolute top-2.5 left-3" size={18} />
				</div>
			</div>
			<div className="overflow-x-auto">
				<Table>
					<TableHeader>
						<TableRow className="border-seperator border-b hover:bg-transparent">
							<TableHead className="text-primary whitespace-nowrap">Song</TableHead>
							<TableHead className="text-primary whitespace-nowrap">Score</TableHead>
							<TableHead className="text-primary whitespace-nowrap">Grade</TableHead>

							<TableHead className="text-primary whitespace-nowrap">Rating</TableHead>
							<TableHead className="text-primary whitespace-nowrap">Difficulty</TableHead>
							<TableHead className="text-primary whitespace-nowrap">Playdate</TableHead>
							<TableHead className="text-primary whitespace-nowrap">Level</TableHead>
							<TableHead className="text-primary whitespace-nowrap">Combo Lamp</TableHead>
							<TableHead className="text-primary whitespace-nowrap">Clear Lamp</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{filteredScores.map((score) => (
							<TableRow key={score.id} className="border-seperator hover:bg-hover border-b">
								<TableCell className="text-primary text-sm">
									<div className="flex items-center gap-3">
										{/* <img
											width={50}
											height={50}
											src={`${cdnUrl}assets/jacket/${score.jacketPath!.replace(".dds", ".png")}`}
											alt={String(score.title)}
											className="flex-shrink-0"
										/> */}
										<span className="text-primary truncate">{score.title}</span>
									</div>
								</TableCell>
								<TableCell className="text-primary text-sm font-medium">{score.achievement?.toLocaleString()}</TableCell>
								<TableCell className="text-primary text-sm font-medium">{getChunithmGrade(score.achievement!)}</TableCell>
								<TableCell className="text-primary text-sm">
									<div className="flex items-center">
										<span className="mr-4">{((score.deluxscore ?? 0) / 100).toFixed(2)}</span>{" "}
										{score.rating_change === "Increase" && <CircleArrowUp className="h-6 w-6 text-green-500" />}
										{score.rating_change === "Decrease" && <CircleArrowDown className="h-6 w-6 text-red-500" />}
										{score.rating_change === "Same" && <CircleArrowRight className="h-6 w-6 text-gray-500" />}
									</div>
								</TableCell>
								<TableCell className="text-primary text-sm">{getDifficultyFromChunithmChart(score.chartId ?? 0)}</TableCell>
								<TableCell className="text-primary text-sm">
									{score.userPlayDate ? new Date(score.userPlayDate).toLocaleString() : "Unknown"}
								</TableCell>
								<TableCell className="text-primary text-sm">{score.level}</TableCell>
								<TableCell className="text-primary text-sm">
									{/* {score.isFullCombo ? "FC" : ""} {score.isAllJustice ? "AJ" : ""} */}
								</TableCell>
								<TableCell className="text-primary text-sm">
									{/* {score.isClear === 1 ? "Clear" : score.isClear === 0 ? "Failed" : "Unknown"} */}
								</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
				{filteredScores.length === 0 && (
					<div className="text-primary py-8 text-center">
						<p>No scores found. Try a different search term.</p>
					</div>
				)}
			</div>
		</div>
	);
};

export default MaimaiDxScoreTable;
