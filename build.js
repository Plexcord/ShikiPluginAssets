import { readFileSync } from "fs";
import { writeFile } from "fs/promises";

const BASE_URL = "https://raw.githubusercontent.com/shikijs/textmate-grammars-themes/main/packages";
const DEV_ICONS_FILE = "devicons.json";
const SOURCES = [
    {
        url: `${BASE_URL}/tm-grammars/index.js`,
        exportName: "grammars",
        outputFile: "grammars.json",
        keepFields: ["name", "displayName", "fileName", "scopeName", "devicon", "aliases"]
    }
];

async function addDeviconsToGrammars(grammars) {
    const devicons = JSON.parse(readFileSync(DEV_ICONS_FILE, "utf-8"));

    const deviconMap = Object.fromEntries(
        devicons.map(d => [d.name, d.devicon])
            .filter(([_, devicon]) => devicon)
    );

    for (const grammar of grammars) {
        if (deviconMap[grammar.name]) {
            grammar.devicon = deviconMap[grammar.name];
        }
    }
}

async function processSource({ url, exportName, outputFile, keepFields }) {
    try {
        const res = await fetch(url);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const text = await res.text();
        const match = text.match(new RegExp(`export const ${exportName} = ([\\s\\S]*?)(?=(\\nexport const|$))`));
        if (!match) throw new Error(`Couldn't find "${exportName}"`);

        const data = eval(match[1]);
        if (exportName === "grammars") {
            addDeviconsToGrammars(data)
        }

        for (const item of data) {
            for (const key of Object.keys(item)) {
                if (!keepFields.includes(key)) {
                    delete item[key];
                }
            }
        }

        await writeFile(outputFile, JSON.stringify(data));

        console.log(`Saved to ${outputFile}`);
    } catch (err) {
        console.error(`Error:`, err.message);
    }
}

await Promise.all(SOURCES.map(processSource));
console.log("Done");
