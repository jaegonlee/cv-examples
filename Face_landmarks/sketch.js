let faceapi;
let video;
let detections;

function setup() {
  createCanvas(640, 480);
  video = createCapture(VIDEO);

  video.size(320, 240);
  video.hide();
  faceapi = ml5.faceApi(
    video,
    {
      withLandmarks: true,
      withDescriptors: false,
    },
    modelReady
  );
}

function draw() {
  background(255);
  faceapi.detect(gotResults);
  imageMode(CORNER);
  tint(255, 100);
  image(video, 0, 0, width, height);

  if (detections) {
    if (detections.length > 0) {
      imageMode(CENTER);
      scale(2);
      // 얼굴 각 부분을 표시(테스트용)
      drawLandmarks(detections);

      // 가면을 그릴 부분
      for (let i = 0; i < detections.length; i++) {
        let face = faceFeatures(detections[i]);
        //print(face); // 얼굴 각 부분의 변수 이름 확인

        // -- 얼굴 그리는 부분 시작
        noFill();
        stroke(255, 0, 0);
        rectMode(CENTER);
        fill(255, 200);

        // face bounding box
        push();
        translate(face.x, face.y);
        rotate(face.angle);
        rect(0, 0, face.w, face.h);
        pop();

        // 코
        rect(face.noseX, face.noseY, 20, 20);
        // -- 얼굴 그리는 부분 끝
      }
    }
  }
}

// callback functions
function modelReady() {
  print("ready!");
  print(faceapi);
  faceapi.detect(gotResults);
}

function gotResults(err, result) {
  if (err) {
    print(err);
    return;
  }
  detections = result;
}

function drawBox(detections) {
  for (let i = 0; i < detections.length; i++) {
    let alignedRect = detections[i].alignedRect;
    let x = alignedRect._box._x;
    let y = alignedRect._box._y;
    let boxWidth = alignedRect._box._width;
    let boxHeight = alignedRect._box._height;
    noFill();
    stroke(161, 95, 251);
    strokeWeight(1);
    rect(x, y, boxWidth, boxHeight);
  }
}

function drawLandmarks(detections) {
  noFill();
  stroke(255, 0, 100);
  strokeWeight(1);

  for (let i = 0; i < detections.length; i++) {
    let mouth = detections[i].parts.mouth;
    let nose = detections[i].parts.nose;
    let leftEye = detections[i].parts.leftEye;
    let rightEye = detections[i].parts.rightEye;
    let rightEyeBrow = detections[i].parts.rightEyeBrow;
    let leftEyeBrow = detections[i].parts.leftEyeBrow;
    let jaw = detections[i].parts.jawOutline;
    drawPart(mouth, true);
    drawPart(nose, false);
    drawPart(leftEye, true);
    drawPart(leftEyeBrow, false);
    drawPart(rightEye, true);
    drawPart(rightEyeBrow, false);
    drawPart(jaw, false);
  }
}

function drawPart(feature, closed) {
  for (let i = 0; i < feature.length; i++) {
    let x = feature[i]._x;
    let y = feature[i]._y;
    stroke(255, 0, 100);
    strokeWeight(1);

    point(x, y);
    textSize(4);
    fill(0);
    noStroke();
    text(i, x, y);
  }
}

function faceFeatures(d) {
  let alignedRect = d.alignedRect;
  let x1 = (d.parts.leftEye[0]._x + d.parts.leftEye[3]._x) / 2;
  let y1 = (d.parts.leftEye[0]._y + d.parts.leftEye[3]._y) / 2;
  let x2 = (d.parts.rightEye[0]._x + d.parts.rightEye[3]._x) / 2;
  let y2 = (d.parts.rightEye[0]._y + d.parts.rightEye[3]._y) / 2;
  let a = atan2(y2 - y1, x2 - x1);
  let b = d.parts.jawOutline[16]._x - d.parts.jawOutline[0]._x;
  return {
    eyeLx: x1,
    eyeLy: y1,
    eyeLw: d.parts.leftEye[3]._x - d.parts.leftEye[0]._x,
    eyeLh: d.parts.leftEye[4]._y - d.parts.leftEye[2]._y,
    eyeRx: x2,
    eyeRy: y2,
    eyeRw: d.parts.rightEye[3]._x - d.parts.rightEye[0]._x,
    eyeRh: d.parts.rightEye[4]._y - d.parts.rightEye[2]._y,
    mouthX: (d.parts.mouth[0]._x + d.parts.mouth[6]._x) / 2,
    mouthY: (d.parts.mouth[3]._y + d.parts.mouth[9]._y) / 2,
    mouthW: d.parts.mouth[6]._x - d.parts.mouth[0]._x,
    mouthH: d.parts.mouth[18]._y - d.parts.mouth[14]._y,
    noseX: d.parts.nose[2]._x,
    noseY: d.parts.nose[2]._y,
    noseW: d.parts.nose[8]._x - d.parts.nose[4]._x,
    noseH: d.parts.nose[6]._y - d.parts.nose[0]._y,
    x: alignedRect._box._x + alignedRect._box._width / 2,
    y: alignedRect._box._y + alignedRect._box._height / 2,
    w: b, //alignedRect._box._width,
    h: alignedRect._box._height,
    angle: a,
  };
}
