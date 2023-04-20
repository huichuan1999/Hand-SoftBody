function getLandmarkCoordinates(indexArray, detections) {
    const coordinates = {};
    if (detections != undefined && detections.multiHandLandmarks != undefined) {
        for (let i = 0; i < detections.multiHandLandmarks.length; i++) {
            for (let j = 0; j < indexArray.length; j++) {
                let index = indexArray[j];
                let x = detections.multiHandLandmarks[i][index].x * width;
                let y = detections.multiHandLandmarks[i][index].y * height;
                coordinates[index] = { x, y };
            }
        }
    }
    return coordinates;
}


const landmarkIndices = [8, 4];
const landmarkCoordinates = getLandmarkCoordinates(landmarkIndices, detections);
console.log(landmarkCoordinates);



function calculateDistance(pointA, pointB) {
    const deltaX = pointA.x - pointB.x;
    const deltaY = pointA.y - pointB.y;
    //求平方根 三角函数
    return Math.sqrt(deltaX * deltaX + deltaY * deltaY);
}


function draw() {
    // 其他绘制代码...

    const landmarkIndices = [8, 4];
    const landmarkCoordinates = getLandmarkCoordinates(landmarkIndices, detections);

    if (landmarkCoordinates[8] && landmarkCoordinates[4]) {
        const distance = calculateDistance(landmarkCoordinates[8], landmarkCoordinates[4]);

        // 根据实际情况调整捏合阈值
        const pinchThreshold = 30;

        if (distance < pinchThreshold) {
            // 捏合动作发生
            const midpoint = {
                x: (landmarkCoordinates[8].x + landmarkCoordinates[4].x) / 2,
                y: (landmarkCoordinates[8].y + landmarkCoordinates[4].y) / 2
            };

            fill(255, 0, 0);
            noStroke();
            ellipse(midpoint.x, midpoint.y, 20, 20);
        }
    }
}
