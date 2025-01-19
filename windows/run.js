const fs = require('fs');
const child_process = require('child_process');
// 参考coze编写
function processFolderRecursively(folderPath) {
    fs.readdir(folderPath, (err, items) => {
        if (err) {
            console.error(err);
            return;
        }
        let thirdPath = ''
        items.forEach(item => {
            const itemPath = `${folderPath}/${item}`;
            if (fs.statSync(itemPath).isDirectory()) {
                processFolderRecursively(itemPath);
            } else if (item.endsWith('videoInfo.json')) {
                fs.readFile(itemPath, 'utf8', (err, data) => {
                    if (err) {
                        console.error(err);
                        return;
                    }
                    let jsonData;
                    try {
                        jsonData = JSON.parse(data);
                    } catch (e) {
                        console.error('Error parsing JSON:', e);
                        return;
                    }
                    const ownerId = jsonData.uid;
                    const ownerName = jsonData.uname;
                    const bvid = jsonData.bvid;
                    const title = jsonData.groupTitle;
                    const cid = jsonData.cid;

                    const parentFolder = `${folderPath}/${cid}`;
                    const videoPath = `${folderPath}/${cid}-1-30064.m4s`;
                    const audioPath = `${folderPath}/${cid}-1-30280.m4s`;
                    const outputPath = `./output/${ownerId}_${ownerName}_${bvid}_${title}.mp4`;

                    const ffmpegCommand = `ffmpeg -i "${videoPath}" -i "${audioPath}" -c:v copy -c:a copy -y "${outputPath}"`;
                    child_process.exec(ffmpegCommand, (err, stdout, stderr) => {
                        if (err) {
                            console.error('Error running ffmpeg:', err);
                            console.error('Error running ffmpeg:', videoPath, outputPath);
                        } else {
                            console.log(`${outputPath}FFmpeg command executed successfully.`);
                        }
                    });
                });
            }
        });
    });
}

const rootFolderPath = './input'; // 将这里替换为实际的根文件夹路径
processFolderRecursively(rootFolderPath);

