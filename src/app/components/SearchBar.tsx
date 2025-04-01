"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SearchBar() {
	const [query, setQuery] = useState("");
	const router = useRouter();

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (query.trim()) {
			router.push(
				`/search/query?search_query=${encodeURIComponent(query)}`,
			);
		}
	};

	return (
		<form
			onSubmit={handleSubmit}
			className="flex gap-2 items-center align-center"
		>
			<input
				type="text"
				value={query}
				onChange={(e) => setQuery(e.target.value)}
				placeholder="search for papers..."
				className="w-full p-4 text-lg border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:none"
			/>
			<button type="submit" className="">
				search
			</button>
		</form>
	);
}
