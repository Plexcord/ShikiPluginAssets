import { writeFile } from 'fs/promises';

const COMMIT_HASH = "ecd9fb1b4a38381df95048c19cf9b8bdcbb1ec09";
const BASE_URL = `https://raw.githubusercontent.com/shikijs/textmate-grammars-themes/${COMMIT_HASH}/packages`;

const SOURCES = [
    {
        url: `${BASE_URL}/tm-themes/index.js`,
        exportName: 'themes',
        outputFile: 'themes.json'
    },
    {
        url: `${BASE_URL}/tm-grammars/index.js`,
        exportName: 'grammars',
        outputFile: 'grammars.json'
    }
];

async function processSource({ url, exportName, outputFile }) {
    try {
        const res = await fetch(url);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const text = await res.text();
        const match = text.match(new RegExp(`export const ${exportName} = ([\\s\\S]*?)(?=(\\nexport const|$))`));
        if (!match) throw new Error(`Couldn't find "${exportName}"`);

        const dataArray = eval(match[1]);
        await writeFile(outputFile, JSON.stringify(dataArray, null, 2));
        console.log(`Saved to ${outputFile}`);
    } catch (err) {
        console.error(`Error:`, err.message);
    }
}

await Promise.all(SOURCES.map(processSource));
