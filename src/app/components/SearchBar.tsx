"use client";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";

export default function SearchBar() {
	const [query, setQuery] = useState("");
	const router = useRouter();
	const searchParams = useSearchParams();
	const [useAiSummary, setUseAiSummary] = useState(searchParams.get("aiSummary") === "true");

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
				<Switch
					id="ai-summary"
					checked={useAiSummary}
					onCheckedChange={handleAiSummaryToggle}
				/>
				<label htmlFor="ai-summary" className="text-sm font-medium cursor-pointer">
					AI Summary
				</label>
			</div>
		</div>
	);
}
