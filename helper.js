function isPointInsidePolygon(point, polygon) {
    let crossings = 0;
    const numVertices = polygon.length;

    for (let i = 0; i < numVertices; i++) {
        const vertex1 = polygon[i];
        const vertex2 = polygon[(i + 1) % numVertices];

        if (((vertex1.y > point.y) !== (vertex2.y > point.y)) &&
            (point.x < (vertex2.x - vertex1.x) * (point.y - vertex1.y) / (vertex2.y - vertex1.y) + vertex1.x)) {
            crossings++;
        }
    }

    return (crossings % 2) === 1;
}


const point = { x: mouseX, y: mouseY };

const polygon = [
    { x: 100, y: 100 },
    { x: 200, y: 100 },
    { x: 200, y: 200 },
    { x: 100, y: 200 }
];

if (isPointInsidePolygon(point, polygon)) {
    console.log("点在多边形内部");
} else {
    console.log("点在多边形外部");
}


let fingerParticle = new Particle(-100, -100); // 将手指顶点放在屏幕外

// 为手指顶点与多边形顶点之间添加约束条件 在setup
for (let particle of particles) {
    const fingerToParticleDistance = dist(fingerParticle.x, fingerParticle.y, particle.x, particle.y);
    const springStrength = 0.01; // 调整弹簧强度以改变交互的影响程度
    springs.push(new Spring(fingerParticle, particle, springStrength));
}

function draw() {
    // ... 其他代码

    // 更新手指顶点的位置
    const indexFingerTipIndex = 8;  //比如12 中指
    const landmarkCoordinates = getLandmarkCoordinates([indexFingerTipIndex], detections);
    if (landmarkCoordinates[indexFingerTipIndex]) {
        fingerParticle.x = landmarkCoordinates[indexFingerTipIndex].x;
        fingerParticle.y = landmarkCoordinates[indexFingerTipIndex].y; 
    }

    // ... 其他代码
}


function draw() {
    // ... 其他代码

    // 更新手指顶点的位置
    if (detections && detections.multiHandLandmarks) {
        const handLandmarks = detections.multiHandLandmarks[0]; // 获取第一个检测到的手的关键点
        const indexFingerTip = handLandmarks[8]; // 获取食指尖的关键点
        fingerParticle.x = indexFingerTip.x * width;
        fingerParticle.y = indexFingerTip.y * height;
    }

    // ... 其他代码
}


// AttractionBehavior 用法参考：http://haptic-data.com/toxiclibsjs/examples/attraction2d
//让手指与软体互相排斥：
//从 toxi.physics2d.behaviors 中获取 AttractionBehavior。
const { AttractionBehavior } = toxi.physics2d.behaviors;


//为每个手指创建一个排斥行为（负的吸引力）

// 根据你的需求调整排斥力的大小和范围
const repulsionStrength = -0.5;
const repulsionRadius = 50;

// 使用检测到的手指坐标创建一个 Vec2D 对象
let fingerPosition = new Vec2D(fingerX, fingerY);

// 创建一个排斥行为
let repulsion = new AttractionBehavior(fingerPosition, repulsionRadius, repulsionStrength);


//将排斥行为添加到物理系统中。
physics.addBehavior(repulsion);

//在每一帧更新手指的位置。
// 在 draw 函数中，使用检测到的新手指坐标更新 Vec2D 对象
fingerPosition.set(fingerX, fingerY);



let physics;
let particleString;

function setup() {
  createCanvas(860, 540);

  physics = new toxi.physics2d.VerletPhysics2D();
  physics.setWorldBounds(new toxi.geom.Rect(0, 0, width, height));

  const startPosition = new toxi.geom.Vec2D(10, height / 2);
  const stepDirection = new toxi.geom.Vec2D(1, 0).normalizeTo(10);
  particleString = new ParticleString(physics, startPosition, stepDirection, 125, 0.1, 0.1);
}

function draw() {
  background(0);
  physics.update();
  particleString.display();
}
