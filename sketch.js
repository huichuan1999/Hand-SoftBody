//------- Condortable p5 world :))))) -------//
//hand points: https://github.com/tensorflow/tfjs-models/tree/master/hand-pose-detection#mediapipe-hands-keypoints-used-in-mediapipe-hands
//thread: http://haptic-data.com/toxiclibsjs/examples/thread 
//soft body character: https://thecodingtrain.com/challenges/177-soft-body-character 

let canvas;
let isLoadedBothHands = false;

const { VerletPhysics2D, VerletParticle2D, VerletSpring2D } = toxi.physics2d;
const { GravityBehavior } = toxi.physics2d.behaviors;
const { Vec2D, Rect } = toxi.geom;
let physics;
let particles = [];
let springs = [];
let eyes = [];

// thread 尾巴
let physicTail1, physicTail2, physicTail3;
let particleString1, particleString2, particleString3;
let tail;
let isTailLocked = false;

function setup() {
  let canvasWidth = 1920;
  let canvasHeight = 1080;

  canvas = createCanvas(canvasWidth, canvasHeight);
  canvas.id("canvas");

  colorMode(HSB, 255);
  //rectMode(CENTER);

  physics = new VerletPhysics2D();
  physicTail1 = new VerletPhysics2D();
  physicTail2 = new VerletPhysics2D();
  physicTail3 = new VerletPhysics2D();


  let bounds = new Rect(0, 0, canvasWidth, canvasHeight);
  physics.setWorldBounds(bounds);
  physicTail1.setWorldBounds(bounds);
  physicTail2.setWorldBounds(bounds);
  physicTail3.setWorldBounds(bounds);

  //把关键点全都写上去，在这里画我的怪东西
  {
    particles.push(new Particle(280, 145));//0
    particles.push(new Particle(390, 120));//1
    particles.push(new Particle(395, 228));//2
    particles.push(new Particle(340, 228));//3
    particles.push(new Particle(420, 350));//4
    particles.push(new Particle(390, 400));//5
    particles.push(new Particle(320, 380));//6
    particles.push(new Particle(300, 350));//7
    particles.push(new Particle(255, 400));//8
    particles.push(new Particle(222, 350));//9
    particles.push(new Particle(300, 228));//10
    particles.push(new Particle(248, 228));//11
    particles.push(new Particle(248, 120));//12
    particles.push(new Particle(280, 120));//13

    //eyes
    eyes.push(new Particle(300, 200));
    eyes.push(new Particle(360, 200));

    //弹簧绕表面一圈
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        if (i !== j) {
          let a = particles[i];
          let b = particles[j];
          // let b = particles[(i + 1) % particles.length];
          springs.push(new Spring(a, b, 0.001));
        }
      }
    }

    for (let particle of particles) {
      springs.push(new Spring(particle, eyes[0], 0.01));
      springs.push(new Spring(particle, eyes[1], 0.01));
    }

    //内部支撑 
    // springs.push(new Spring(particles[0], particles[11], 0.01));
    // springs.push(new Spring(particles[0], particles[10], 0.01));
    // springs.push(new Spring(particles[1], particles[11], 1));
    // springs.push(new Spring(particles[1], particles[3], 0.01));
    // springs.push(new Spring(particles[2], particles[12], 0.01));
    // springs.push(new Spring(particles[3], particles[7], 0.01));
    // springs.push(new Spring(particles[3], particles[10], 0.01));
    // springs.push(new Spring(particles[3], particles[8], 0.01));
    // springs.push(new Spring(particles[4], particles[9], 0.01));
    // springs.push(new Spring(particles[5], particles[3], 0.01));
    // springs.push(new Spring(particles[5], particles[10], 0.01));
    // springs.push(new Spring(particles[6], particles[3], 0.01));
    // springs.push(new Spring(particles[7], particles[10], 0.01));
    // springs.push(new Spring(particles[8], particles[10], 0.01));
    // springs.push(new Spring(particles[1], particles[9], 0.01));
    // springs.push(new Spring(particles[4], particles[12], 0.01));
    // springs.push(new Spring(particles[11], particles[13], 0.01));
  }
  //set up tails

  const stepDirection = new toxi.geom.Vec2D(1, 1).normalizeTo(10);

  particleString1 = new ParticleString(physicTail1, new toxi.geom.Vec2D(), stepDirection, 125, 1, 0.1);
  particleString1.particles[0].lock();
  tail = particleString1.particles[particleString1.particles.length - 1];

  particleString2 = new ParticleString(physicTail2, new toxi.geom.Vec2D(), stepDirection, 125, 1, 0.1);
  particleString2.particles[0].lock();
  tail = particleString2.particles[particleString2.particles.length - 1];

  particleString3 = new ParticleString(physicTail3, new toxi.geom.Vec2D(), stepDirection, 125, 1, 0.1);
  particleString3.particles[0].lock();
  tail = particleString3.particles[particleString3.particles.length - 1];

}

function draw() {
  clear();
  // 翻转摄像头画面
  // translate(width, 0);
  // scale(-1, 1);

  if (detections != undefined) {
    if (detections.multiHandLandmarks != undefined) {

      //当4与8的距离过近，以8的位置作为触发交互的位置

      // drawLines([4, 5, 0]);
      // drawLines([8, 7, 6, 5]);
      // drawLines([12, 11, 5]);
      // drawLines([16, 15, 14, 9, 0]);
      // drawLines([20, 19, 13, 0]);

      // let s = sin(frameCount * 0.01);
      // let cHue = map(s, -1, 1, 0, 255)
      // drawTestC([4, 4], cHue, 30);
      // drawTestC([8, 8], cHue, 50);
      // drawTestC([12, 12], cHue, 70);
      // drawTestC([16, 16], cHue, 50);
      // drawTestC([20, 20], cHue, 30);

      //drawHands();
      // drawParts();

      drawLines([0, 5, 9, 13, 17, 0]);//palm
      drawLines([0, 1, 2, 3, 4]);//thumb
      drawLines([5, 6, 7, 8]);//index finger
      drawLines([9, 10, 11, 12]);//middle finger
      drawLines([13, 14, 15, 16]);//ring finger
      drawLines([17, 18, 19, 20]);//pinky

      drawLandmarks([0, 1], 0);//palm base

      drawLandmarks([1, 5], 60);//thumb

      drawLandmarks([5, 9], 120);//index finger
      drawLandmarks([9, 13], 180);//middle finger
      drawLandmarks([13, 17], 240);//ring finger
      drawLandmarks([17, 21], 300);//pinky

      // drawTest([8,9],200);

      // drawTestB([0,1,2,3,4,8,12,16,20,19,18,17,0,17,0],200);
      // drawTestB([3,4,8,7,3],0);
      // drawTestB([7,8,12,11,7],30);
      // drawTestB([11,12,16,15,11],60);
      // drawTestB([15,16,20,19,15],90);
      // drawTestB([0,1,2,3,6,9,14,17,0],90);

      // rect(imgPosX,imgPosY,imgSizeX,imgSizeY)

      //drawHandsTest();

      // drawLines([4,8,12,16,20]);
      // drawLines([4,7,12,15,20]);
      //  drawLines([3,8,11,16,19]);
    }
  }

  drawSoftBody();

  //draw tail
  particleString1.particles[0].set(particles[5]);
  physicTail1.update();
  particleString1.display();

  particleString2.particles[0].set(particles[6]);
  physicTail2.update();
  particleString2.display();

  particleString3.particles[0].set(particles[8]);
  physicTail3.update();
  particleString3.display();

  // 将画布翻转回来
  // translate(width, 0);
  // scale(-1, 1);
}

// function mousePressed() {
//   isTailLocked = !isTailLocked;
//   if (isTailLocked) {
//     tail.lock();
//   } else {
//     tail.unlock();
//   }
// }

function drawSoftBody() {
  //draw soft body
  physics.update();

  fill(255, 100);
  stroke(0);
  strokeWeight(2);
  beginShape();
  for (let particle of particles) {
    vertex(particle.x, particle.y);
  }
  endShape(CLOSE);

  //   for (let particle of particles) {
  //     particle.show();
  //   }
  eyes[0].show();
  eyes[1].show();

  //   for (let spring of springs) {
  //     spring.show();
  //   }
  if (mouseIsPressed) { //改成：如果手捏合了/如果检测到手的某一个节点
    // particles[1].lock();
    // particles[1].x = mouseX;
    // particles[1].y = mouseY;
    // particles[1].unlock();
  }

  //如果探测到手
  const landmarkIndices = [8, 4];
  const landmarkCoordinates = getLandmarkCoordinates(landmarkIndices, detections);

  if (landmarkCoordinates[8] && landmarkCoordinates[4]) {
    const distance = calculateDistance(landmarkCoordinates[8], landmarkCoordinates[4]);

    // 根据实际情况调整捏合阈值
    const pinchThreshold = 50;

    if (distance < pinchThreshold) {
      // 捏合动作发生
      const midpoint = {
        x: (landmarkCoordinates[8].x + landmarkCoordinates[4].x) / 2,
        y: (landmarkCoordinates[8].y + landmarkCoordinates[4].y) / 2
      };

      // flippedpointX = width - midpoint.x;
      // flippedpointY = midpoint.y;

      // fill(255, 0, 0);
      // noStroke();
      // ellipse(flippedpointX, flippedpointY, 20, 20);
      // particles[1].lock();
      // particles[1].x = flippedpointX;
      // particles[1].y = flippedpointY;
      // particles[1].unlock();

      fill(255, 0, 0);
      noStroke();
      ellipse(midpoint.x, midpoint.y, 20, 20);
      particles[1].lock();
      particles[1].x = midpoint.x;
      particles[1].y = midpoint.y;
      particles[1].unlock();

    }
  }

}

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

function calculateDistance(pointA, pointB) {
  const deltaX = pointA.x - pointB.x;
  const deltaY = pointA.y - pointB.y;
  //求平方根 三角函数
  return Math.sqrt(deltaX * deltaX + deltaY * deltaY);
}

function drawTestC(index, hue, size) { //画会变色的圆圈
  stroke(0, 0, 255);
  strokeWeight(1);
  //noStroke();
  //fill(hue);
  //noFill();

  //获得手部landmarks关键点

  for (let i = 0; i < detections.multiHandLandmarks.length; i++) {
    for (let j = 0; j < index.length - 1; j++) {
      let x = detections.multiHandLandmarks[i][index[j]].x * width;
      let y = detections.multiHandLandmarks[i][index[j]].y * height;
      let z = detections.multiHandLandmarks[i][index[j]].z;

      let _x = detections.multiHandLandmarks[i][index[j + 1]].x * width;
      let _y = detections.multiHandLandmarks[i][index[j + 1]].y * height;
      let _z = detections.multiHandLandmarks[i][index[j + 1]].z;
      // line(x, y, _x, _y);

      // stroke(hue,200,250);
      // strokeWeight(1);
      fill(hue, 140, 220, 200);
      //rect(_x, _y,10,10);
      ellipse(x, y, size); //在这里！！

      //ellipse(_x, _y,100);

    }
  }

}

function drawHands() {
  beginShape();
  for (let i = 0; i < detections.multiHandLandmarks.length; i++) {
    for (let j = 0; j < detections.multiHandLandmarks[i].length; j++) {
      let x = detections.multiHandLandmarks[i][j].x * width;
      let y = detections.multiHandLandmarks[i][j].y * height;
      let z = detections.multiHandLandmarks[i][j].z;
      // strokeWeight(0);
      // textFont('Helvetica Neue');
      // text(j, x, y);
      stroke(255);
      strokeWeight(10);

      point(x, y);

    }
    endShape();
  }
}

function drawLandmarks(indexArray, hue) {
  noFill();
  //fill(50);
  strokeWeight(8);
  beginShape();
  for (let i = 0; i < detections.multiHandLandmarks.length; i++) {
    for (let j = indexArray[0]; j < indexArray[1]; j++) {
      let x = detections.multiHandLandmarks[i][j].x * width;
      let y = detections.multiHandLandmarks[i][j].y * height;
      // let z = detections.multiHandLandmarks[i][j].z;
      stroke(hue, 40, 255);
      point(x, y);
      //vertex(x, y);
      //vertex(y, x);

    }
    endShape();
  }
}

function drawLines(index) {
  stroke(0, 0, 255, 120);
  strokeWeight(3);
  beginShape();
  for (let i = 0; i < detections.multiHandLandmarks.length; i++) {
    for (let j = 0; j < index.length - 1; j++) {
      let x = detections.multiHandLandmarks[i][index[j]].x * width;
      let y = detections.multiHandLandmarks[i][index[j]].y * height;
      // let z = detections.multiHandLandmarks[i][index[j]].z;

      let _x = detections.multiHandLandmarks[i][index[j + 1]].x * width;
      let _y = detections.multiHandLandmarks[i][index[j + 1]].y * height;
      // let _z = detections.multiHandLandmarks[i][index[j+1]].z;
      line(x, y, _x, _y);
      // vertex(x, y);
      // vertex(_x, _y);

    }
    endShape();
  }
}

function drawTest(indexArray, hue) {
  //noFill();
  fill(hue);
  strokeWeight(8);
  beginShape();
  for (let i = 0; i < detections.multiHandLandmarks.length; i++) {
    for (let j = indexArray[0]; j < indexArray[1]; j++) {
      let x = detections.multiHandLandmarks[i][j].x * width;
      let y = detections.multiHandLandmarks[i][j].y * height;
      // let z = detections.multiHandLandmarks[i][j].z;
      stroke(hue, 40, 255);
      point(x, y);
      //vertex(x, y);
      //vertex(y, x);

    }
    endShape();
  }
}

function drawTestB(index, hue) {
  stroke(0, 0, 255);
  strokeWeight(10);
  noStroke();
  fill(hue);
  beginShape();
  for (let i = 0; i < detections.multiHandLandmarks.length; i++) {
    for (let j = 0; j < index.length - 1; j++) {
      let x = detections.multiHandLandmarks[i][index[j]].x * width;
      let y = detections.multiHandLandmarks[i][index[j]].y * height;
      // let z = detections.multiHandLandmarks[i][index[j]].z;

      let _x = detections.multiHandLandmarks[i][index[j + 1]].x * width;
      let _y = detections.multiHandLandmarks[i][index[j + 1]].y * height;
      // let _z = detections.multiHandLandmarks[i][index[j+1]].z;
      // line(x, y, _x, _y);

      vertex(x, y);
      vertex(_x, _y);

    }
    endShape();
  }

}

function drawHandsTest() {
  let hand_0 = detections.multiHandLandmarks[0];
  let hand_1 = detections.multiHandLandmarks[1];

  // let maxDist = dist(width - hand_0[8].x * width, hand_0[8].y * height,
  //   width - hand_0[7].x * width, hand_0[7].y * height);

  // let targetDistA = dist(width - hand_0[8].x * width, hand_0[8].y * height,
  //     width - hand_1[4].x * width, hand_1[4].y * height);

  // let targetDistB = dist(width - hand_0[4].x * width, hand_0[4].y * height,
  //       width - hand_1[8].x * width, hand_1[8].y * height);

  let a = hand_0[8].x * width;
  let b = hand_0[8].y * height;
  let c = hand_0[4].x * width;
  let d = hand_0[4].y * height;
  fill(100, 50, 200);
  ellipse(a, b, 100);
  ellipse(c, d, 100);

  // if (targetDistA < maxDist && targetDistB < maxDist) {
  //   drawTestC([4,8,12,16,20,0],90);
  // }

}



//let myp5 = new p5(sketch);