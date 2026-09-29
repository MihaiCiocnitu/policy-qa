const company: string = "INC";
let attempts: number = 0;
attempts += 1;

const words: string[] = ["policy", "coverage", "exclusion"];

interface Chunk {
    id: number;
    text: string;
    section? : string;
}

const chunk: Chunk = { id: 1, text: "Legal protection covers employment dispute." };

function countWords(text: string): number {
    return text.split(/\s+/).filter((word) => word.length > 0).length;
}

const longWords = words.filter((w) => w.length > 7);
const upper = words.map((w) => w.toUpperCase());

type Verdict =  "covered" | "excluded" | "not_found";
const v: Verdict ="covered";

console.log(company, attempts, chunk.section ?? "No section");
console.log(countWords(chunk.text), longWords, upper, v);
