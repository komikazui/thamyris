import React, { useEffect, useState } from "react";

import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

import { useRoles } from "@/hooks/admin/use-admin";
import { useFiles } from "@/hooks/users/use-files";

const Downloads = () => {
	const navigate = useNavigate();
	const { isAdmin, isSpecial, hasDownloads } = useRoles();

	const [currentPath, setCurrentPath] = useState("");
	const { data = [], isLoading, error } = useFiles(currentPath);

	useEffect(() => {
		if (!(isAdmin || isSpecial || hasDownloads)) {
			navigate("/");
		}
	}, [isAdmin, isSpecial, hasDownloads, navigate]);

	const formatFileSize = (bytes: number) => {
		if (bytes === 0) return "0 Bytes";

		const k = 1024;
		const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
		const i = Math.floor(Math.log(bytes) / Math.log(k));

		return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
	};

	const goUp = () => {
		const parts = currentPath.split("/").filter(Boolean);
		if (parts.length > 1) {
			const newPath = parts.slice(0, parts.length - 1).join("/") + "/";
			setCurrentPath(newPath);
		} else {
			setCurrentPath("");
		}
	};

	const goToDirectory = (dirName: string) => {
		setCurrentPath((prev) => prev + dirName + "/");
	};

	const handleItemClick = (file: any) => {
		if (file.IsDirectory) {
			goToDirectory(file.ObjectName);
		}
	};

	const copyLinkToClipboard = (fileUrl: string) => {
		navigator.clipboard.writeText(fileUrl).then(
			() => {
				toast.success("Link copied to clipboard!");
			},
			(err) => {
				toast.error("Failed to copy link");
				console.error("Error copying link: ", err);
			}
		);
	};

	return (
		<div className="bg-background flex min-h-screen flex-col p-6 text-white">
			<h1 className="mb-6 text-3xl font-semibold text-gray-200">Browsing: /{currentPath}</h1>
			{currentPath && (
				<button
					onClick={goUp}
					className="mb-6 flex items-center space-x-2 text-blue-400 transition-all duration-300 hover:text-blue-500"
				>
					<span className="rotate-180 transform">&#8594;</span>
					<span className="cursor-pointer">Go Up</span>
				</button>
			)}
			{isLoading && <p className="text-gray-500">Loading files...</p>}
			{error && <p className="text-red-500">Failed to load files.</p>}
			<div className="flex-1 overflow-y-auto">
				<ul className="space-y-4">
					{data.map((file: any) => (
						<li
							key={file.Guid}
							className={`flex items-center justify-between rounded-md p-4 transition-all duration-300 ${
								file.IsDirectory ? "bg-card hover:bg-hover cursor-pointer" : "bg-card"
							}`}
							onClick={() => handleItemClick(file)}
						>
							<div className="flex items-center">
								<strong className={`mr-4 text-xl font-medium ${file.IsDirectory ? "text-green-400" : "text-blue-400"}`}>
									{file.IsDirectory ? <span className="text-lg font-medium">{file.ObjectName}</span> : file.ObjectName}
								</strong>
								<span className="text-sm text-gray-400">
									{file.IsDirectory ? "[Folder]" : `[File • ${formatFileSize(file.Length)}]`}
								</span>
							</div>
							{!file.IsDirectory && (
								<div className="flex items-center space-x-2">
									<a
										href={`https://${env.BUNNY_CDN_PULLZONE}/${currentPath}${file.ObjectName}`}
										className="text-blue-400 transition-all duration-300 hover:text-blue-500"
										download
									>
										<button className="text-primary bg-button hover:bg-hover cursor-pointer rounded-md px-6 py-2 transition-all duration-300 hover:shadow-xl">
											Download
										</button>
									</a>
									<button
										onClick={(e) => {
											e.stopPropagation();
											copyLinkToClipboard(`https://${env.BUNNY_CDN_PULLZONE}/${currentPath}${file.ObjectName}`);
										}}
										className="text-primary bg-button hover:bg-hover cursor-pointer rounded-md px-4 py-2 transition-all duration-300 hover:shadow-xl"
									>
										Copy Link
									</button>
								</div>
							)}
						</li>
					))}
				</ul>
			</div>
		</div>
	);
};

export default Downloads;
