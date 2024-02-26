import { createReadStream, createWriteStream } from 'fs'
import * as readline from 'readline'
import { PassThrough } from 'stream'
import { unlinkAsync, writeFileAsync } from './promises/fsPromise.js';

async function sortLargeFile(filePath: string, chunkSize: number) {
    let chunkCount = 0;
    let chunks: string[] = [];
    let currentChunk: string[] = [];
    const rl = readline.createInterface({
        input: createReadStream(filePath),
        crlfDelay: Infinity
    });
    for await (const line of rl) {
        currentChunk.push(line);
        if (currentChunk.length >= chunkSize) {
            currentChunk.sort();
            const chunkFilePath = `chunk_${chunkCount}.txt`;
            await writeFileAsync(chunkFilePath, currentChunk.join('\n'));
            chunks.push(chunkFilePath);
            chunkCount++;
            currentChunk = [];
        }
    }
    if (currentChunk.length > 0) {
        currentChunk.sort();
        const chunkFilePath = `chunk_${chunkCount}.txt`;
        await writeFileAsync(chunkFilePath, currentChunk.join('\n'));
        chunks.push(chunkFilePath);
    }

    const outputStream = createWriteStream('sorted_file.txt');
    const streams = chunks.map(chunkFile => createReadStream(chunkFile));
    let mergedStream = new PassThrough();
    streams.forEach(stream => {
        stream.pipe(mergedStream, { end: false });
        stream.on('end', async () => {
            await unlinkAsync(stream.path);
        });
    });
    mergedStream.pipe(outputStream);
}

const filePath = '160-KB.txt';
const chunkSize = 500000;

sortLargeFile(filePath, chunkSize)
    .then(() => console.log('Файл отсортирован'))
    .catch(error => console.error('Ошибка сортировки:', error));