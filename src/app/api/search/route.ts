import { NextRequest, NextResponse } from "next/server";
import { parseStringPromise } from "xml2js";
import OpenAI from "openai";

type ArxivLink = {
	$: {
		href: string;
		title?: string;
	};
};

type ArxivAuthor = {
	name: string[];
};

type ArxivEntry = {
	id: string[];
	title: string[];
	summary: string[];
	author?: ArxivAuthor[];
	published: string[];
	link: ArxivLink[];
};

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

const openai = new OpenAI({
	apiKey: process.env.OPENAI_KEY,
});

async function generateAISummary(abstract: string, title: string): Promise<string> {
	try {
		const completion = await openai.chat.completions.create({
			model: "gpt-4o-mini",
			messages: [
				{
					role: "system",
					content: "You are a helpful assistant that creates concise, easy-to-understand summaries of academic papers. Create a 2-3 sentence summary that explains the main idea and key findings in plain language."
				},
				{
					role: "user",
					content: `Please summarize this academic paper:\n\nTitle: ${title}\n\nAbstract: ${abstract}`
				}
			],
			max_tokens: 150,
			temperature: 0.3,
		});

		return completion.choices[0]?.message?.content || "AI summary unavailable.";
	} catch (error) {
		console.error("Error generating AI summary:", error);
		return "AI summary unavailable.";
	}
}

export async function GET(request: NextRequest) {
	const searchParams = request.nextUrl.searchParams;
	const query = searchParams.get("q");
	const useAiSummary = searchParams.get("aiSummary") === "true";

	if (!query) {
		return NextResponse.json(
			{ error: "Query parameter 'q' is required" },
			{ status: 400 }
		);
	}

	try {
		const response = await fetch(
			`https://export.arxiv.org/api/query?search_query=all:${encodeURIComponent(query)}&max_results=20&sortBy=submittedDate&sortOrder=descending`
		);

		if (!response.ok) {
			throw new Error(`HTTP error! status: ${response.status}`);
		}

		const xml = await response.text();

		// Parse the XML response into JSON format
		const json = await parseStringPromise(xml);
		const entries = json.feed.entry ?? [];

		// Map the entries to a paper object and conditionally generate AI summaries
		const papers: Paper[] = await Promise.all(
			entries.map(async (entry: ArxivEntry) => {
				const title = entry.title[0] ?? "Untitled";
				const summary = entry.summary[0] ?? "No summary available.";
				const aiSummary = useAiSummary ? await generateAISummary(summary, title) : "";

				return {
					id: entry.id[0] ?? "",
					title,
					summary,
					authors: entry.author?.map((a: ArxivAuthor) => a.name[0]) ?? [],
					published: entry.published[0] ?? "",
					pdfLink:
						entry.link.find((l: ArxivLink) => l.$.title === "pdf")?.$.href ?? "",
					texLink:
						entry.link.find((l: ArxivLink) => l.$.title === "tex")?.$.href ?? "",
					aiSummary,
				};
			})
		);

		return NextResponse.json({ papers });
	} catch (error) {
		console.error("Error fetching data:", error);
		return NextResponse.json(
			{ error: "Failed to fetch papers" },
			{ status: 500 }
		);
	}
}