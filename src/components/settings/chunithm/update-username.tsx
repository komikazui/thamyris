import React, { useState } from "react";
import { toast } from "sonner";
import { useUpdateName } from "@/hooks/chunithm/use-update-name";

const UpdateUsernameBox = () => {
  const [userName, setUserName] = useState("");
  const { mutate: updateUsername, isPending } = useUpdateName();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userName.trim()) {
      toast.error("Username cannot be empty");
      return;
    }
    updateUsername(
      { userName },
      {
        onSuccess: () => {
          toast.success("Username updated!");
          setUserName("");
        },
        onError: () => toast.error("Failed to update username."),
      }
    );
  };

  return (
    <div className="bg-card rounded-md p-6">
      <h2 className="text-primary mb-2 text-xl font-semibold">
        Username Settings
      </h2>
      <div className="text-primary mb-4 text-sm">
        Change your in-game username here.
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="username"
            className="text-primary mb-1 block text-sm font-medium"
          >
            New Username
          </label>
          <input
            id="username"
            type="text"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            className="bg-textbox text-primary w-full p-2"
            placeholder="Enter new username"
            required
            maxLength={8}
          />
        </div>
        <button
          type="submit"
          disabled={isPending || !userName.trim()}
          className="bg-button hover:bg-buttonhover text-buttontext mt-4 flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg p-3 font-bold transition-colors disabled:cursor-not-allowed disabled:opacity-80"
        >
          {isPending ? "Updating..." : "Update Username"}
        </button>
      </form>
    </div>
  );
};

export default UpdateUsernameBox;