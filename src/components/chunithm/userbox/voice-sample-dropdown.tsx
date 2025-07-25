import React, { useCallback, useMemo, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// Voice sample mapping - can be customized per system voice
const DEFAULT_VOICE_SAMPLES = {
	"00000": "Full Combo",
	"00001": "All Justice",
	"00002": "1000 Chain",
	"00003": "2000 Chain",
	"00004": "3000 Chain",
	"00005": "4000 Chain",
	"00006": "5000 Chain",
	"00007": "Full Chain",
	"00008": "New Record",
	"00009": "All Clear",
	"00010": "Rank D",
	"00011": "Rank C",
	"00012": "Rank B",
	"00013": "Rank BB",
	"00014": "Rank BBB",
	"00015": "Rank A",
	"00016": "Rank AA",
	"00017": "Rank AAA",
	"00018": "Rank S",
	"00019": "Rank S+",
	"00020": "Rank SS",
	"00021": "Rank SS+",
	"00022": "Rank SSS",
	"00023": "Rank SSS+",
	"00024": "Voice Sample 1",
	"00025": "Voice Sample 2",
	"00026": "Voice Sample 3",
	"00027": "Voice Sample 4",
	"00028": "Voice Sample 5",
	"00029": "Voice Sample 6",
	"00030": "Voice Sample 7",
	"00031": "Voice Sample 8",
	"00032": "Voice Sample 9",
	"00033": "Voice Sample 10",
	"00034": "Voice Sample 11",
	"00035": "Voice Sample 12",
	"00036": "Voice Sample 13",
	"00037": "Voice Sample 14",
	"00038": "Voice Sample 15",
	"00039": "Voice Sample 16",
	"00040": "Voice Sample 17",
	"00041": "Voice Sample 18",
};

interface VoiceSampleDropdownProps {
	systemVoiceId: number;
	className?: string;
}

export function VoiceSampleDropdown({ systemVoiceId, className }: VoiceSampleDropdownProps) {
	const [isOpen, setIsOpen] = useState(false);
	const [currentlyPlaying, setCurrentlyPlaying] = useState<string | null>(null);
	const audioRef = useRef<HTMLAudioElement | null>(null);
	const dropdownRef = useRef<HTMLDivElement>(null);

	// Format system voice ID for URL (pad with zeros to 4 digits)
	const formattedVoiceId = useMemo(() => {
		return systemVoiceId.toString().padStart(4, "0");
	}, [systemVoiceId]);

	// Generate audio URL for a sample
	const getAudioUrl = useCallback(
		(sampleId: string) => {
			return `https://cozynet.b-cdn.net/client/assets/chunithm/systemvoices/systemvoice${formattedVoiceId}/${sampleId}_streaming.wav`;
		},
		[formattedVoiceId]
	);

	// Play audio sample
	const playAudioSample = useCallback(
		async (sampleId: string, sampleName: string) => {
			try {
				// Stop any currently playing audio
				if (audioRef.current) {
					audioRef.current.pause();
					audioRef.current = null;
				}

				setCurrentlyPlaying(sampleId);

				const audioUrl = getAudioUrl(sampleId);
				const audio = new Audio(audioUrl);
				audioRef.current = audio;

				audio.onended = () => {
					setCurrentlyPlaying(null);
					audioRef.current = null;
				};

				audio.onerror = () => {
					setCurrentlyPlaying(null);
					audioRef.current = null;
					console.warn(`Failed to load audio sample: ${sampleName} (${sampleId})`);
				};

				await audio.play();
			} catch (error) {
				setCurrentlyPlaying(null);
				audioRef.current = null;
				console.error(`Error playing audio sample: ${sampleName} (${sampleId})`, error);
			}
		},
		[getAudioUrl]
	);

	// Stop currently playing audio
	const stopAudio = useCallback(() => {
		if (audioRef.current) {
			audioRef.current.pause();
			audioRef.current = null;
		}
		setCurrentlyPlaying(null);
	}, []);

	// Close dropdown when clicking outside
	const handleClickOutside = useCallback((event: MouseEvent) => {
		if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
			setIsOpen(false);
		}
	}, []);

	// Set up click outside listener
	React.useEffect(() => {
		if (isOpen) {
			document.addEventListener("mousedown", handleClickOutside);
			return () => document.removeEventListener("mousedown", handleClickOutside);
		}
	}, [isOpen, handleClickOutside]);

	// Clean up audio on unmount
	React.useEffect(() => {
		return () => {
			if (audioRef.current) {
				audioRef.current.pause();
			}
		};
	}, []);

	return (
		<div ref={dropdownRef} className={cn("relative", className)}>
			<Button
				variant="outline"
				size="sm"
				onClick={() => setIsOpen(!isOpen)}
				className="text-primary flex items-center gap-2"
			>
				🎵 Voice Samples
				<span className={cn("transition-transform", isOpen && "rotate-180")}>▼</span>
			</Button>

			{isOpen && (
				<div className="bg-card absolute top-full left-0 z-50 mt-1 max-h-96 w-64 overflow-y-auto rounded-md border shadow-lg">
					<div className="space-y-1 p-2">
						{Object.entries(DEFAULT_VOICE_SAMPLES).map(([sampleId, sampleName]) => (
							<div key={sampleId} className="hover:bg-muted group flex items-center justify-between rounded-sm p-2">
								<span className="text-primary flex-1 truncate text-sm">{sampleName}</span>
								<div className="flex items-center gap-1">
									{currentlyPlaying === sampleId ? (
										<Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-red-500" onClick={stopAudio}>
											⏹
										</Button>
									) : (
										<Button
											variant="ghost"
											size="sm"
											className="h-6 w-6 p-0 text-gray-500 opacity-70 group-hover:opacity-100"
											onClick={() => playAudioSample(sampleId, sampleName)}
										>
											▶
										</Button>
									)}
								</div>
							</div>
						))}
					</div>
				</div>
			)}
		</div>
	);
}
