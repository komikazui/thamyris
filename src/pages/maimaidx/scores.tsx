import { useState } from "react";
import React from "react";

import Header from "@/components/common/header";
import Pagination from "@/components/common/pagination";
import Spinner from "@/components/common/spinner";
import MaimaiDxScoreTable from "@/components/mai2/score-table";
import { useMaimaidxScores } from "@/hooks/maimaidx/use-scores";
import { useMaimaiDxVersion } from "@/hooks/maimaidx/use-version";

const Mai2ScorePage = () => {
	const [searchQuery, setSearchQuery] = useState("");
	const [currentPage, setCurrentPage] = useState(1);

	const { data: scores = [], isLoading: isLoadingScores } = useMaimaidxScores();
	const version = useMaimaiDxVersion();

	const filteredScores = scores.filter((score) => score.title?.toLowerCase().includes(searchQuery.toLowerCase()));

	const itemsPerPage = 15;
	const totalPages = Math.ceil(filteredScores.length / itemsPerPage);
	const paginatedScores = filteredScores.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

	if (isLoadingScores) {
		return (
			<div className="relative flex-1 overflow-auto">
				<Header title="Overview" />
				<div className="flex h-[calc(100vh-64px)] items-center justify-center">
					<div className="text-lg text-gray-400">
						<Spinner size={24} color="#ffffff" />
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="relative flex-1 overflow-auto">
			<Header title="Scores" />
			{version ? (
				<div className="container mx-auto space-y-6">
					<div className="mb-4 space-y-8 p-4 sm:px-6 sm:py-0">
						<MaimaiDxScoreTable
							scores={paginatedScores}
							searchQuery={searchQuery}
							onSearchChange={(e) => setSearchQuery(e.target.value)}
						/>
						{totalPages > 1 && <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />}
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

export default Mai2ScorePage;
