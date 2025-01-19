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
                const splits = itemPath.split('/')
                if (splits.length === 5) {
                    thirdPath = itemPath
                } else {
                    processFolderRecursively(itemPath);
                }
            } else if (item.endsWith('entry.json')) {
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
                    const ownerId = jsonData.owner_id;
                    const ownerName = jsonData.owner_name;
                    const title = jsonData.title;
                    const bvid = jsonData.bvid;

                    const parentFolder = thirdPath;
                    const videoPath = `${parentFolder}/video.m4s`;
                    const audioPath = `${parentFolder}/audio.m4s`;
                    const outputPath = `./putput/${ownerId}_${ownerName}_${title}.mp4`;

                    const ffmpegCommand = `ffmpeg -i "${videoPath}" -i "${audioPath}" -codec copy "${outputPath}"`;
                    child_process.exec(ffmpegCommand, (err, stdout, stderr) => {
                        if (err) {
                            console.error('Error running ffmpeg:', thirdPath, outputPath);
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

