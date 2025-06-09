"use client";
import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Sun, Moon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useTheme } from "next-themes";

function SearchBarContent() {
	const [query, setQuery] = useState("");
	const { theme, setTheme } = useTheme();
	const router = useRouter();
	const searchParams = useSearchParams();
	const [useAiSummary, setUseAiSummary] = useState(
		searchParams.get("aiSummary") === "true",
	);

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (query.trim()) {
			const params = new URLSearchParams();
			params.set("search_query", query);
			if (useAiSummary) {
				params.set("aiSummary", "true");
			}
			router.push(`/search/query?${params.toString()}`);
		}
	};

	const handleAiSummaryToggle = (checked: boolean) => {
		setUseAiSummary(checked);
	};

	return (
		<div className="flex flex-col gap-3">
			<form onSubmit={handleSubmit} className="flex items-center gap-2">
				<Input
					type="text"
					value={query}
					onChange={(e) => setQuery(e.target.value)}
					placeholder="search for papers..."
				/>
				<Button type="submit">search</Button>
			</form>

			<div className="flex items-center gap-3">
				<Button
					onClick={() => {
						if (theme === "system") {
							setTheme("light");
						} else if (theme === "light") {
							setTheme("dark");
						} else {
							setTheme("light");
						}
					}}
				>
					<Sun className="h-[1.2rem] w-[1.2rem] scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
					<Moon className="absolute h-[1.2rem] w-[1.2rem] scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
				</Button>
				<Switch
					id="ai-summary"
					checked={useAiSummary}
					onCheckedChange={handleAiSummaryToggle}
				/>
				<label
					htmlFor="ai-summary"
					className="text-sm font-medium cursor-pointer"
				>
					AI Summary
				</label>
			</div>
		</div>
	);
}

export default function SearchBar() {
	return (
		<Suspense fallback={<div>Loading search...</div>}>
			<SearchBarContent />
		</Suspense>
	);
}
