"use client";

import SearchBar from "./components/SearchBar";

export default function Home() {
	return (
		<div className="flex items-center justify-center h-screen">
			<div className="w-3/4">
				<div className="flex flex-col mb-3 gap-3">
					<h1 className="text-5xl font-bold">paperade</h1>
					<p>find papers better.</p>
				</div>
				<SearchBar />
			</div>
		</div>
	);
}
