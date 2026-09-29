import {readFile, writeFile} from "node:fs/promises";

interface WordStat {
    word: string;
    count: number;
}

async function main() : Promise<void> {
    const path = process.argv[2] ?? "data/sample.txt";
    const text = await readFile(path, "utf-8");

    const words = text
        .toLowerCase()
        .split(/[^a-zăâîșț]+/)
        .filter((w) => w.length > 3);
    
    const counts = new Map<string, number>();
    for (const w of words) {
        counts.set(w, (counts.get(w) ?? 0) + 1);
    }

    const top: WordStat[] = [...counts.entries()]
        .map(([word, count]) => ({word, count}))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);

    console.log(`Fisier: ${path}| cuvinte: ${words.length} | unice: ${counts.size}`);
    console.table(top);

    await writeFile("data/wordcount.json", JSON.stringify(top, null, 2));
    console.log("Salvat in data/wordcount.json");
}

main().catch((err) => {
    console.error("Eroare:", err);
    process.exit(1);
});
