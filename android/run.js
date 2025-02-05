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
                    const title = jsonData.title.replace(/\/|\|/g, '_');
                    const bvid = jsonData.bvid;

                    const parentFolder = thirdPath;
                    const videoPath = `${parentFolder}/video.m4s`;
                    const audioPath = `${parentFolder}/audio.m4s`;
                    const outputPath = `./output/${ownerId}_${ownerName}_${title}.mp4`;

                    const ffmpegCommand = `ffmpeg -i "${videoPath}" ${audioPath ? `-i "${audioPath}"` : ''} -c:v copy -c:a copy -y "${outputPath}"`;
                    child_process.exec(ffmpegCommand, (err, stdout, stderr) => {
                        if (err) {
                            // console.error(err);
                            console.error('Error running ffmpeg:', thirdPath, outputPath);
                            const ffmpegCommand2 = `ffmpeg -i "${videoPath}" -c:v copy -y "${outputPath}"`;
                            child_process.exec(ffmpegCommand2, (err, stdout, stderr) => {
                                if (err) {
                                    console.error('Error running2 ffmpeg:', thirdPath, outputPath);
                                    move(folderPath.split('/').slice(0, 3).join('/'), './unsuccess')
                                } else {
                                    console.log(`${outputPath}FFmpeg command2 executed successfully.`);
                                    move(folderPath.split('/').slice(0, 3).join('/'), './success')
                                }
                            });
                        } else {
                            console.log(`${outputPath}FFmpeg command executed successfully.`);
                            move(folderPath.split('/').slice(0, 3).join('/'), './success')
                        }
                    });
                });
            }
        });
    });
}

function move(pathFrom, pathTo) {
    const ffmpegCommand = `move "${pathFrom}" "${pathTo}"`;

    child_process.exec(ffmpegCommand, (err, stdout, stderr) => {
        if (err) {
            console.error('Error move:', err);
        }
    });
}

const rootFolderPath = './input'; // 将这里替换为实际的根文件夹路径
processFolderRecursively(rootFolderPath);

