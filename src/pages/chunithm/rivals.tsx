import { useState } from "react";
import React from "react";

import { Handshake, Skull } from "lucide-react";
import { toast } from "sonner";

import Header from "@/components/common/header";
import Spinner from "@/components/common/spinner";
import TableComponent from "@/components/common/table";
import {
  useAddRival,
  useChunithmVersion,
  useRemoveRival,
  useRivalCount,
  useRivalUsers,
  useRivals,
} from "@/hooks/chunithm";

interface RivalUser {
  id: number;
  username: string;
  isMutual: boolean;
}

const ChunithmRivals = () => {
  const [searchQuery, setSearchQuery] = useState("");

  const version = useChunithmVersion();
  const { data: rivalIds = [], isLoading: isLoadingRivals } = useRivals();
  const { data: rivalCount = 0, isLoading: isLoadingCount } = useRivalCount();
  const { data: users = [], isLoading: isLoadingUsers } = useRivalUsers();
  const { mutate: addRival } = useAddRival();
  const { mutate: removeRival } = useRemoveRival();

  const filteredRivals = users.filter((user) =>
    user.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddRival = (id: number) => {
    if (rivalCount >= 3) {
      toast.error("You can only have up to 3 rivals.");
      return;
    }

    addRival(id, {
      onSuccess: () => {
        toast.success("Rival added successfully!");
      },
      onError: () => {
        toast.error("Failed to add rival");
      },
    });
  };

  const handleRemoveRival = (id: number) => {
    removeRival(id, {
      onSuccess: () => {
        toast.success("Rival removed successfully!");
      },
      onError: () => {
        toast.error("Failed to remove rival");
      },
    });
  };

  const isLoading = isLoadingRivals || isLoadingCount || isLoadingUsers;

  if (isLoading) {
    return (
      <div className="relative flex-1 overflow-auto">
        <Header title="Rivals" />
        <div className="flex h-[calc(100vh-64px)] items-center justify-center">
          <Spinner size={24} />
        </div>
      </div>
    );
  }

  const columns = {
    Username: (row: RivalUser) => row.username,
    Status: (row: RivalUser) => (
      <div className="flex items-center gap-2">
        {row.isMutual && <Handshake className="h-8 w-8 text-green-500" />}
        <Skull
          className={`h-8 w-8 cursor-pointer ${rivalIds.includes(row.id) ? "text-red-500" : "text-primary"}`}
          onClick={() => {
            const isRival = rivalIds.includes(row.id);
            if (isRival) {
              handleRemoveRival(row.id);
            } else {
              handleAddRival(row.id);
            }
          }}
        />
      </div>
    ),
  };

  return (
    <div className="relative flex-1 overflow-auto">
      <Header title={`Rivals ${rivalCount}/3`} />
      {version ? (
        <div className="space-y-6">
          <div className="mb-4 space-y-4 p-4 sm:px-6 sm:py-0">
            <TableComponent
              data={filteredRivals}
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

export default ChunithmRivals;
