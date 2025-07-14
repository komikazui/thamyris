import { useState } from "react";
import React from "react";

import Header from "@/components/common/header";
import Spinner from "@/components/common/spinner";
import TableComponent from "@/components/common/table";
import { useChunithmVersion, useLeaderboard } from "@/hooks/chunithm";

interface LeaderboardPlayer {
  userName: string;
  playerRating: number;
  rank: number;
}

const ChunithmLeaderboard = () => {
  const [searchQuery, setSearchQuery] = useState("");

  const { data: leaderboard = [], isLoading: isLoadingLeaderboard } =
    useLeaderboard() as {
      data: LeaderboardPlayer[];
      isLoading: boolean;
    };

  const version = useChunithmVersion();

  const filteredLeaderboard = leaderboard.filter((player) =>
    player.userName?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const columns = {
    Rank: (row: LeaderboardPlayer) => `#${row.rank}`,
    Player: (row: LeaderboardPlayer) => row.userName,
    Rating: (row: LeaderboardPlayer) => (row.playerRating / 100).toFixed(2),
  };

  if (isLoadingLeaderboard) {
    return (
      <div className="relative flex-1 overflow-auto">
        <Header title="Leaderboard" />
        <div className="flex h-[calc(100vh-64px)] items-center justify-center">
          <Spinner size={24} />
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex-1 overflow-auto">
      <Header title="Leaderboard" />
      {version ? (
        <div className="space-y-6">
          <div className="mb-4 space-y-4 p-4 sm:px-6 sm:py-0">
            <TableComponent
              data={filteredLeaderboard}
              columns={columns}
              onSearch={(search) => setSearchQuery(search.value || "")}
            />
          </div>
        </div>
      ) : (
        <div className="flex h-[calc(100vh-64px)] items-center justify-center">
          <p className="text-primary">
            Please set your Chunithm version in settings first
          </p>
        </div>
      )}
    </div>
  );
};

export default ChunithmLeaderboard;
