"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import SearchBar from "@/app/components/SearchBar";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardHeader,
	CardTitle,
	CardDescription,
	CardContent,
	CardFooter,
} from "@/components/ui/card";

type Paper = {
	id: string;
	title: string;
	summary: string;
	authors: string[];
	published: string;
	pdfLink: string;
	texLink: string;
	aiSummary: string;
};

const SearchResults = () => {
	const searchParams = useSearchParams();
	const query = searchParams.get("search_query") ?? ""; // Get the query from the URL
	const useAiSummary = searchParams.get("aiSummary") === "true";
	const [papers, setPapers] = useState<Paper[]>([]); // State for papers fetched from API
	const [loading, setLoading] = useState<boolean>(false); // State for loading indicator

	useEffect(() => {
		if (!query) return; // If no query, don't fetch

		console.log("query:", query);

		const fetchData = async () => {
			setLoading(true);
			try {
				const response = await fetch(
					`/api/search?q=${encodeURIComponent(query)}&aiSummary=${useAiSummary}`,
				);

				if (!response.ok) {
					throw new Error(`HTTP error! status: ${response.status}`);
				}

				const data = await response.json();
				setPapers(data.papers);
			} catch (error) {
				console.error("Error fetching data:", error);
			} finally {
				setLoading(false);
			}
		};

		fetchData();
	}, [query, useAiSummary]);

	return (
		<div className="flex flex-col p-6 gap-8 max-w-[1280px] m-auto">
			<h1 className="text-3xl font-bold">paperade</h1>
			<Suspense fallback={<div>Loading search...</div>}>
				<SearchBar />
			</Suspense>

			{loading && <div>Loading...</div>}
			{!loading && papers.length > 0 && (
				<div className="flex flex-col gap-6">
					{papers.map((paper) => (
						<Card
							key={paper.id}
							className="hover:shadow-md transition-shadow"
						>
							<CardHeader>
								<CardTitle>
									<a
										href={paper.id}
										className="text-lg hover:underline"
									>
										{paper.title}
									</a>
								</CardTitle>
								<CardDescription>
									Published:{" "}
									{paper.published
										? new Date(
												paper.published,
											).toLocaleDateString("en-US", {
												year: "numeric",
												month: "long",
												day: "numeric",
												hour: "numeric",
												minute: "numeric",
												second: "numeric",
											})
										: "Unknown"}
								</CardDescription>
							</CardHeader>
							<CardContent>
								{useAiSummary ? (
									<p className="leading-relaxed">
										{paper.aiSummary}
									</p>
								) : (
									<p className="line-clamp-3 leading-relaxed">
										{paper.summary}
									</p>
								)}
							</CardContent>
							<CardFooter className="gap-4">
								{paper.pdfLink && (
									<Button asChild>
										<a
											href={paper.pdfLink}
											target="_blank"
											rel="noopener noreferrer"
										>
											View PDF
										</a>
									</Button>
								)}
								{paper.texLink && (
									<Button asChild variant="outline">
										<a
											href={paper.texLink}
											target="_blank"
											rel="noopener noreferrer"
										>
											Download TeX Source
										</a>
									</Button>
								)}
							</CardFooter>
						</Card>
					))}
				</div>
			)}

			{/* No results found */}
			{!loading && papers.length === 0 && query && (
				<p>No results found for &quot;{query}&quot;.</p>
			)}
		</div>
	);
};

export default function Page() {
	return (
		<Suspense fallback={<div>Loading...</div>}>
			<SearchResults />
		</Suspense>
	);
}
