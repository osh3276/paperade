"use client";

import SearchBar from "./components/SearchBar";

export default function Home() {
	return (
		<div className="flex items-center justify-center h-screen">
			<div className="w-3/4">
				<h1 className="text-5xl font-bold mb-6">paperade</h1>
				<SearchBar />
			</div>
		</div>
	);
}
