import { readdir, readFile, writeFile } from "node:fs/promises";
import { extractText, getDocumentProxy } from "unpdf";

// Forma unei bucăți de text (o clauză din poliță)
interface Chunk {
  id: string;
  doc: string;
  page: number;
  section: string;
  text: string;
  words: number;
}

// Un rând este titlu de secțiune dacă începe cu "Art. 3", "Article 3", "Section 3" sau "§ 3"
const HEADING = /^(Art\.|Article|Section|Clause|§)\s*\d+/i;

// Curăță textul unei pagini și îl împarte în rânduri
function cleanLines(pageText: string): string[] {
  return pageText
    .replace(/-\n/g, "") // lipește cuvintele despărțite la capăt de rând
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0);
}
function countWords(text: string): number {
  return text.split(/\s+/).filter((w) => w.length > 0).length;
}
// Extrage textul dintr-un PDF și îl împarte pe secțiuni
async function ingestPdf(path: string, doc: string): Promise<Chunk[]> {
  const buffer = await readFile(path);
  const pdf = await getDocumentProxy(new Uint8Array(buffer));
  const { text: pages } = await extractText(pdf, { mergePages: false });

  const chunks: Chunk[] = [];
  let current: Chunk | null = null;

  pages.forEach((pageText, index) => {
    for (const line of cleanLines(pageText)) {
      if (HEADING.test(line)) {
        // începe o secțiune nouă
        current = { id: `${doc}#${chunks.length + 1}`, doc, page: index + 1, section: line, text: "", words: 0 };
        chunks.push(current);
      } else if (current) {
        // rândul aparține secțiunii curente
        current.text += (current.text ? " " : "") + line;
      }
    }
  });
    for (const chunk of chunks) {
    chunk.words = countWords(chunk.text);
  }

  return chunks;

}

async function main(): Promise<void> {
  const files = (await readdir("data")).filter((f) => f.toLowerCase().endsWith(".pdf"));
  const all: Chunk[] = [];

  for (const file of files) {
    const chunks = await ingestPdf(`data/${file}`, file);
    console.log(`${file}: ${chunks.length} secțiuni`);
    all.push(...chunks);
    for (const chunk of chunks) {
      console.log(`  ${chunk.section}: ${chunk.text.length} caractere, ${chunk.words} cuvinte`);
    }
  }

  await writeFile("data/chunks.json", JSON.stringify(all, null, 2));
  console.log(`Total: ${all.length} bucăți salvate în data/chunks.json`);
}

main().catch((err) => {
  console.error("Eroare:", err);
  process.exit(1);
});

git add .