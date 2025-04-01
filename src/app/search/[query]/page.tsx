"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { parseStringPromise } from "xml2js";
import SearchBar from "@/app/components/SearchBar";

type Paper = {
	id: string;
	title: string;
	summary: string;
	authors: string[];
	published: string;
	pdfLink: string;
	texLink: string;
};

const SearchResults = () => {
	const searchParams = useSearchParams();
	const query = searchParams.get("search_query") ?? ""; // Get the query from the URL
	const [papers, setPapers] = useState<Paper[]>([]); // State for papers fetched from API
	const [loading, setLoading] = useState<boolean>(false); // State for loading indicator

	useEffect(() => {
		if (!query) return; // If no query, don't fetch

		console.log("query:", query);

		const fetchData = async () => {
			setLoading(true); // Start loading
			try {
				const response = await fetch(
					`https://export.arxiv.org/api/query?search_query=all:${encodeURIComponent(query)}&max_results=20&sortBy=submittedDate&sortOrder=descending`,
				);

				if (!response.ok) {
					throw new Error(`HTTP error! status: ${response.status}`);
				}

				const xml = await response.text();
				console.log(response);
				console.log("fetched papers");

				// Parse the XML response into JSON format
				const json = await parseStringPromise(xml);
				const entries = json.feed.entry ?? [];
				console.log("parsed xml");

				// Map the entries to a paper object
				const papersData: Paper[] = entries.map((entry: any) => ({
					id: entry.id[0] ?? "",
					title: entry.title[0] ?? "Untitled",
					summary: entry.summary[0] ?? "No summary available.",
					authors: entry.author?.map((a: any) => a.name[0]) ?? [],
					published: entry.published[0] ?? "",
					pdfLink:
						entry.link.find((l: any) => l.$.title === "pdf")?.$
							.href ?? "",
					texLink:
						entry.link.find((l: any) => l.$.title === "tex")?.$
							.href ?? "",
				}));
				console.log("mapped papers");

				setPapers(papersData); // Set the fetched papers data
			} catch (error) {
				console.error("Error fetching data:", error);
			} finally {
				setLoading(false); // Stop loading
			}
		};

		fetchData(); // Fetch the data when query is available
		console.log("fetched data");
	}, [query]);

	return (
		<div className="p-6">
			<SearchBar />

			{loading && <div>Loading...</div>}

			{!loading && papers.length > 0 && (
				<ul>
					{papers.map((paper) => (
						<li key={paper.id} className="mb-4">
							<h2 className="text-xl font-bold">
								<a href={paper.id} className="hover:underline">
									{paper.title}
								</a>
							</h2>
							<p className="text-sm text-gray-600">
								Published: {paper.published}
							</p>
							<p>{paper.summary.slice(0, 500)}...</p>
							<div className="mt-2">
								{paper.pdfLink && (
									<a
										href={paper.pdfLink}
										className="mr-4 hover:underline"
									>
										Download PDF
									</a>
								)}
								{paper.texLink && (
									<a
										href={paper.texLink}
										className="text-blue-600 hover:underline"
									>
										Download TeX Source
									</a>
								)}
							</div>
						</li>
					))}
				</ul>
			)}

			{/* No results found */}
			{!loading && papers.length === 0 && query && (
				<p>
					No results found for &quot;{query}&quot;. Try another
					search.
				</p>
			)}
		</div>
	);
};

export default SearchResults;
