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
                    const videoPath2 = `${folderPath}/${cid}_ex1-1-30064.m4s`;
                    const audioPath2 = `${folderPath}/${cid}_ex1-1-30280.m4s`;
                    const outputPath = `./output/${ownerId}_${ownerName}_${bvid}_${title}.mp4`;

                    const ffmpegCommand = `ffmpeg -i "${videoPath}" -i "${audioPath}" -c:v copy -c:a copy -y "${outputPath}"`;
                    child_process.exec(ffmpegCommand, (err, stdout, stderr) => {
                        if (err) {
                            // console.error('Error running ffmpeg:', err);
                            console.error('Error running ffmpeg, try2:', videoPath, outputPath);
                            const ffmpegCommand = `ffmpeg -i "${videoPath2}" -i "${audioPath2}" -c:v copy -c:a copy -y "${outputPath}"`;
                            
                            child_process.exec(ffmpegCommand, (err, stdout, stderr) => {
                                if (err) {
                                    // console.error('Error running ffmpeg:', err);
                                    console.error('Error try2 running ffmpeg:', videoPath2, outputPath);
                                    move(folderPath, './unsuccess')
                                } else {
                                    console.log(`${outputPath}FFmpeg try2 command executed successfully.`);
                                }
                            });
                        } else {
                            console.log(`${outputPath}FFmpeg command executed successfully.`);
                        }
                    });
                });
            }
        });
    });
}

function move(pathFrom, pathTo) {
    const ffmpegCommand = `move "${pathFrom}" "${audioPath2}"`;
                            
    child_process.exec(ffmpegCommand, (err, stdout, stderr) => {
        if (err) {
            console.error('Error move:', err);
        }
    });
}

const rootFolderPath = './input'; // 将这里替换为实际的根文件夹路径

const ffmpegCommand = `node delete.js"`;
child_process.exec(ffmpegCommand, (err, stdout, stderr) => {
    if (err) {
        console.error('Error running delete.js:', err);
    }
    processFolderRecursively(rootFolderPath);
});

