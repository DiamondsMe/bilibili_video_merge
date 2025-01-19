const fs = require('fs');
const path = require('path');

function removeLeadingThirties(filePath) {
    const data = fs.readFileSync(filePath);

    const zeroIndex = data.indexOf(Buffer.from('\x00\x00'));
    if (zeroIndex === -1) {
        console.log(`No double zero found in ${filePath}.`);
        return false;
    }

    let thirtyCount = 0;
    for (let i = 0; i < zeroIndex; i++) {
        if (data[i] === 0x30) {
            thirtyCount++;
        } else {
            break;
        }
    }

    const newData = data.slice(thirtyCount);
    fs.writeFileSync(filePath, newData);
    return true;
}

function removeTrailingSequence(filePath, sequence) {
    let data = fs.readFileSync(filePath);

    const sequenceLen = sequence.length;
    let end = data.length - sequenceLen;
    while (end >= 0) {
        if (data.slice(end, end + sequenceLen).equals(sequence)) {
            data = Buffer.concat([data.slice(0, end), data.slice(end + sequenceLen)]);
            end -= sequenceLen;
        } else {
            break;
        }
    }

    fs.writeFileSync(filePath, data);
}

function processFile(filePath, sequence) {
    if (removeLeadingThirties(filePath)) {
        removeTrailingSequence(filePath, sequence);
    } else {
        console.log(`Skipping ${filePath} due to no double zero found.`);
    }
}

function processDirectory(directoryPath, sequence) {
    const files = fs.readdirSync(directoryPath);
    files.forEach(fileName => {
        if (fileName.endsWith('.m4s')) {
            const filePath = path.join(directoryPath, fileName);
            processFile(filePath, sequence);
        }
    });
}

const inputDir = path.join(__dirname, 'input');
const sequence = Buffer.from('\x21\x11\x45\x00\x14\x50\x01\x47');

fs.readdirSync(inputDir).forEach(dirName => {
    if (/^\d+$/.test(dirName)) {
        const dirPath = path.join(inputDir, dirName);
        if (fs.statSync(dirPath).isDirectory()) {
            processDirectory(dirPath, sequence);
        }
    }
});