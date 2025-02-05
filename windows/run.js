const fs = require('fs');
const child_process = require('child_process');
// 参考coze编写
function processFolderRecursively(folderPath) {
    fs.readdir(folderPath, (err, items) => {
        if (err) {
            console.error(err);
            return;
        }
        let videoPath = ''
        let audioPath = ''

        items.forEach(item => {
            const itemPath = `${folderPath}/${item}`;
            if (fs.statSync(itemPath).isDirectory()) {
                processFolderRecursively(itemPath);
            } else if (item.endsWith('.m4s')) {
                console.log(item)
                if (['30064', '100048'].find((v)=>item.indexOf(v) > -1)) {
                    videoPath = itemPath
                }
                if (['30280'].find((v)=>item.indexOf(v) > -1)) {
                    audioPath = itemPath
                }
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
                    const groupTitle = jsonData.groupTitle.replace(/\/|\|/g, '_'));
                    const title = jsonData.title.replace(/\/|\|/g, '_');
                    const cid = jsonData.cid;

                    const parentFolder = `${folderPath}/${cid}`;

                    const outputPath = `./output/${ownerId}_${ownerName}_${bvid}_${title !== groupTitle ? `${groupTitle}_${title}` : `${groupTitle}`}.mp4`;

                    const ffmpegCommand = `ffmpeg -i "${videoPath}" ${audioPath ? `-i "${audioPath}"` : ''} -c:v copy -c:a copy -y "${outputPath}"`;
                    child_process.exec(ffmpegCommand, (err, stdout, stderr) => {
                        if (err) {
                            // console.error(err);
                            console.error('Error running ffmpeg', videoPath, outputPath);
                            move(folderPath.split('/').slice(0, 3).join('/'), './unsuccess')
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

const ffmpegCommand = `node delete.js"`;
child_process.exec(ffmpegCommand, (err, stdout, stderr) => {
    if (err) {
        console.error('Error running delete.js:', err);
    }
    processFolderRecursively(rootFolderPath);
});

