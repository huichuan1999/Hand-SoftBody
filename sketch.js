//References:
//hand tracking: https://github.com/tensorflow/tfjs-models/tree/master/hand-pose-detection#mediapipe-hands-keypoints-used-in-mediapipe-hands
//thread: http://haptic-data.com/toxiclibsjs/examples/thread 
//soft body character: https://thecodingtrain.com/challenges/177-soft-body-character 
//Repulsion and gravitation between particles: http://haptic-data.com/toxiclibsjs/examples/attraction2d
//Toxiclibs.js Library: http://haptic-data.com/toxiclibsjs/

let canvas;

const { VerletPhysics2D, VerletParticle2D, VerletSpring2D } = toxi.physics2d;
const { GravityBehavior } = toxi.physics2d.behaviors;
const { Vec2D, Rect } = toxi.geom;

let particles = [];
let springs = [];
let handAttractions = [];

// Adjust the pinch threshold according to the actual situation
const pinchThreshold = 30;
let physics;

//soft body character
let eyes = [];
let tail;
let particleStrings = [];
let physicTail;
//const associatedVertices = [5, 6, 8];
const associatedVertices = Array.from({ length: 16 }, (_, i) => i);

//flower
let draggedParticle = null;
let centerParticle;
let particleGrabRadius = 30;

let handParticles = [];

function setup() {
  // let canvasWidth = window.innerWidth;
  // let canvasHeight = window.innerHeight;
  // let canvasWidth = 1920;
  // let canvasHeight = 1080;
  frameRate(60);

  canvas = createCanvas(window.innerWidth, window.innerHeight);
  canvas.id("canvas");

  colorMode(HSB, 255);

  // createCharacter();
  createSymmetricalFlower();

}

function draw() {
  clear();
  fill(0,10);

  //draw landmarks
  if (detections != undefined) {
    if (detections.multiHandLandmarks != undefined) {

      //draw landmarks 
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
    }
  }

  // drawSoftBodyCharacter();
  drawSymmertricalFlower();
}

function createCharacter() {

  // physics = new VerletPhysics2D();
  // physics.setWorldBounds(new Rect(0, 0, width, height));
  //create soft borders
  const boundaryParticles = [
    new VerletParticle2D(new Vec2D(width / 2, -50)),
    new VerletParticle2D(new Vec2D(width / 2, height + 50)),
    new VerletParticle2D(new Vec2D(-50, height / 2)),
    new VerletParticle2D(new Vec2D(width + 50, height / 2)),
  ];

  for (const boundaryParticle of boundaryParticles) {
    physics.addParticle(boundaryParticle);
    boundaryParticle.lock(); 
  }
  const boundarySpringCoefficient = 0.1; 

  // Create springs and add them to the physics system
  for (const particle of particles) {
    for (const boundaryParticle of boundaryParticles) {
      const distance = particle.distanceTo(boundaryParticle);
      const spring = new VerletSpring2D(particle, boundaryParticle, distance, boundarySpringCoefficient);
      physics.addSpring(spring);
    }
  }

  physicTail = new VerletPhysics2D();
  physicTail.setWorldBounds(new Rect(0, 0, width, height));

  //Write all the key points, draw my weird thing here

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

  for (let i = 0; i < particles.length; i++) {
    for (let j = i + 1; j < particles.length; j++) {
      if (i !== j) {
        let a = particles[i];
        let b = particles[j];
        springs.push(new Spring(a, b, 0.1));
      }
    }
  }

  for (let particle of particles) {
    springs.push(new Spring(particle, eyes[0], 0.1));
    springs.push(new Spring(particle, eyes[1], 0.1));
  }

  //set up tails
  const stepDirection = new toxi.geom.Vec2D(1, 1).normalizeTo(10);

  for (let i = 0; i < associatedVertices.length; i++) {
    const particleString = new ParticleString(physicTail, new toxi.geom.Vec2D(), stepDirection, 125, 1, 0.1);
    particleString.particles[0].lock();
    tail = particleString.particles[particleString.particles.length - 1];
    particleStrings.push(particleString);
  }
}

function drawSoftBodyCharacter() {
  //draw soft body
  physics.update();
  physicTail.update();

  fill(255, 150);
  stroke(255);
  strokeWeight(2);

  //draw shape
  beginShape();
  for (let particle of particles) {
    vertex(particle.x, particle.y);
  }
  endShape(CLOSE);

  eyes[0].show();
  eyes[1].show();

  //draw tail
  // Update the ParticleString's start point to follow the polygon vertices
  for (let i = 0; i < associatedVertices.length; i++) {
    const vertexIndex = associatedVertices[i];
    particleStrings[i].particles[0].set(particles[vertexIndex]);
  }
  for (const particleString of particleStrings) {
    particleString.display();
  }

  //If detected hand

  const allLandmarkIndices = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20];
  const allLandmarkCoordinates = getLandmarkCoordinates(allLandmarkIndices, detections);
  for (let i = 0; i < handParticles.length; i++) {
    const index = allLandmarkIndices[i];
    if (index == 8 || index == 4) {
      continue; // Skip keys with index 8 (index finger) or 4 (thumb)
    }
    const coord = allLandmarkCoordinates[index];
    if (coord) {
      handParticles[i].updatePosition(coord.x, coord.y);
    }
  }

  if (handParticles.length === 0) {
    addHandParticle(allLandmarkCoordinates);
  }
  //console.log(handParticles.length);

  // Create a repulsive force for the hand particles
  for (const handParticle of handParticles) {
    const attraction = new toxi.physics2d.behaviors.AttractionBehavior(handParticle, 10, -0.2, 0);
    for (let flowerParticle of particles) {
      physics.addBehavior(attraction);
    }
  }

  const landmarkIndices = [8, 4];
  const landmarkCoordinates = getLandmarkCoordinates(landmarkIndices, detections);

  if (landmarkCoordinates[8] && landmarkCoordinates[4]) {
    const distance = calculateDistance(landmarkCoordinates[8], landmarkCoordinates[4]);

    if (distance < pinchThreshold) {
      // The pinch action occurs
      const midpoint = {
        x: (landmarkCoordinates[8].x + landmarkCoordinates[4].x) / 2,
        y: (landmarkCoordinates[8].y + landmarkCoordinates[4].y) / 2
      };

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

function createSymmetricalFlower() {
  let nPetals = 16;
  let angleStep = TWO_PI / nPetals;
  let radius = 120;
  let centerX = width / 2;
  let centerY = height / 2;

  physics = new VerletPhysics2D();
  physics.setWorldBounds(new Rect(0, 0, width, height));

  physicTail = new VerletPhysics2D();
  physicTail.setWorldBounds(new Rect(0, 0, width, height));

  centerParticle = new VerletParticle2D(new Vec2D(centerX, centerY));
  physics.addParticle(centerParticle);
  particles.push(centerParticle);

  for (let i = 0; i < nPetals; i++) {
    let angle = i * angleStep;
    let x = centerX + radius * cos(angle);
    let y = centerY + radius * sin(angle);
    let particle = new VerletParticle2D(new Vec2D(x, y));
    particles.push(particle);
    physics.addParticle(particle);

    let centerSpring = new VerletSpring2D(centerParticle, particle, radius, 0.01);
    springs.push(centerSpring);
    physics.addSpring(centerSpring);

    if (i > 0) {
      let spring = new VerletSpring2D(particles[i + 1], particles[i], 2 * radius * sin(angleStep / 2), 0.1);
      springs.push(spring);
      physics.addSpring(spring);
    }
  }
    // Add inner spring -------------------------------------------------
    //if don't want the inner springs, comment out these
    for (let i = 1; i <= nPetals; i++) {
      for (let offset = nPetals/2-1; offset <= nPetals / 2; offset++) {
        const j = ((i + offset - 1) % nPetals) + 1;
        const spring = new VerletSpring2D(
          particles[i],
          particles[j],
          particles[i].distanceTo(particles[j]),
          0.1
        );
        springs.push(spring);
        physics.addSpring(spring);
      }
    }
    //-------------------------------------------------------------------
  let lastSpring = new VerletSpring2D(particles[1], particles[nPetals], 2 * radius * sin(angleStep / 2), 0.1);
  springs.push(lastSpring);
  physics.addSpring(lastSpring);

  //set up tails
  const stepDirection = new toxi.geom.Vec2D(1, 1).normalizeTo(20);

  for (let i = 0; i < associatedVertices.length; i++) {
    const particleString = new ParticleString(physicTail, new toxi.geom.Vec2D(), stepDirection, random(50, 100), 1, 0.5);
    particleString.particles[0].lock();
    tail = particleString.particles[particleString.particles.length - 1];
    particleStrings.push(particleString);
  }

}

function drawSymmertricalFlower() {
  // Draw petals
  fill(255, 120);
  stroke(255, 100);
  strokeWeight(16);
  beginShape();
  for (let i = 1; i < particles.length; i++) {
    vertex(particles[i].x, particles[i].y);
  }
  endShape(CLOSE);

  stroke(255);
  strokeWeight(1);
  for (let spring of springs) {
    line(spring.a.x, spring.a.y, spring.b.x, spring.b.y);
  }

  for (let particle of particles) {
    stroke(255);
    strokeWeight(1);
    //noFill();
    fill(255, 70);

    ellipse(particle.x, particle.y, 50, 40);
    ellipse(particle.x, particle.y, 40, 50);

    noStroke();
    ellipse(particle.x, particle.y, 20, 20);
  }

  //draw tails
  // Update the ParticleString's start point to follow the polygon vertices
  for (let i = 0; i < associatedVertices.length; i++) {
    const vertexIndex = associatedVertices[i];
    particleStrings[i].particles[0].set(particles[vertexIndex]);
  }
  for (const particleString of particleStrings) {
    particleString.display();
  }

  //If detected hand
  const allLandmarkIndices = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20];
  const allLandmarkCoordinates = getLandmarkCoordinates(allLandmarkIndices, detections);
  for (let i = 0; i < handParticles.length; i++) {
    const index = allLandmarkIndices[i];
    if (index == 8 || index == 4) {
      continue; // // Skip keys with index 8 (index finger) or 4 (thumb)
    }
    const coord = allLandmarkCoordinates[index];
    if (coord) {
      handParticles[i].updatePosition(coord.x, coord.y);
    }
  }

  if (handParticles.length === 0) {
    addHandParticle(allLandmarkCoordinates);
  }

  for (let i = 0; i < handParticles.length; i++) {
    handAttractions[i].attractor.set(handParticles[i].getPosition());
    // 将排斥力应用于花朵粒子
      physics.addBehavior(handAttractions[i]);
  }
  
  
  

  physics.update();
  physicTail.update();

  //Add pinch interaction
  const landmarkIndices = [8, 4];
  const landmarkCoordinates = getLandmarkCoordinates(landmarkIndices, detections);

  if (landmarkCoordinates[8] && landmarkCoordinates[4]) {
    const distance = calculateDistance(landmarkCoordinates[8], landmarkCoordinates[4]);

    if (distance < pinchThreshold) {
      // The pinch action occurs
      const midpoint = {
        x: (landmarkCoordinates[8].x + landmarkCoordinates[4].x) / 2,
        y: (landmarkCoordinates[8].y + landmarkCoordinates[4].y) / 2
      };
      fill(255, 0, 0);
      noStroke();
      ellipse(midpoint.x, midpoint.y, 20, 20);

      for (let particle of particles) {
        let d = dist(midpoint.x, midpoint.y, particle.x, particle.y);
        if (d < particleGrabRadius) {
          draggedParticle = particle;
          draggedParticle.set(midpoint.x, midpoint.y,);
          //break;
        }
      }
    } else {
      draggedParticle = null;
    }
  }
}

function windowResized(){
  resizeCanvas(window.innerWidth, window.innerHeight);
}