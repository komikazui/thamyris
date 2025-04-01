import { useState } from "react";
import React from "react";

import Header from "@/components/common/header";
import Spinner from "@/components/common/spinner";
import TableComponent from "@/components/common/table";
import { useMaimaiDxScores, useMaimaiDxVersion } from "@/hooks/maimaidx";

interface ScoreData {
	id: number;
	title: string;
	difficulty: string;
	level: string;
	score: number;
	lamp: string;
}

const Mai2ScorePage = () => {
	const [searchQuery, setSearchQuery] = useState("");

	const { data: scores = [], isLoading: isLoadingScores } = useMaimaiDxScores();
	const version = useMaimaiDxVersion();

	const filteredScores = scores.filter((score) => score.title?.toLowerCase().includes(searchQuery.toLowerCase()));

	if (isLoadingScores) {
		return (
			<div className="relative flex-1 overflow-auto">
				<Header title="Scores" />
				<div className="flex h-[calc(100vh-64px)] items-center justify-center">
					<Spinner size={24} />
				</div>
			</div>
		);
	}

	const columns = {
		Title: (row: ScoreData) => row.title,
		Difficulty: (row: ScoreData) => row.difficulty,
		Level: (row: ScoreData) => row.level,
		Score: (row: ScoreData) => row.score.toLocaleString(),
		Lamp: (row: ScoreData) => row.lamp,
	};

	return (
		<div className="relative flex-1 overflow-auto">
			<Header title="Scores" />
			{version ? (
				<div className="space-y-6">
					<div className="mb-4 space-y-4 p-4 sm:px-6 sm:py-0">
						<TableComponent
							data={filteredScores}
							columns={columns}
							onSearch={(search) => setSearchQuery(search.value || "")}
						/>
					</div>
				</div>
			) : (
				<div className="flex h-[calc(100vh-64px)] items-center justify-center">
					<p className="text-primary">Please set your maimai DX version in settings first</p>
				</div>
			)}
		</div>
	);
};

export default Mai2ScorePage;
