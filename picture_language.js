/**
  * This library is a JavaScript adaptation of the Picture Language from
  * the book "Structure and Interpretation of Computer Programs", Section 2.2.4:
  * http://http://mitpress.mit.edu/sicp/full-text/book/book.html
  *
  * @author Ivan Vladimirov Ivanov (ivan.vladimirov.ivanov@gmail.com)
  */


var pL = {};

pL.Vector = function(x, y) {
  this.x = x;
  this.y = y;
};

pL.Vector.prototype = {
  add: function(v) {
    return new pL.Vector(this.x + v.x, this.y + v.y);
  },

  sub: function(v) {
    return new pL.Vector(this.x - v.x, this.y - v.y);
  },

  scale: function(s) {
    return new pL.Vector(this.x * s, this.y * s);
  },

  toString: function() {
    return '(' + this.x + ', ' + this.y + ')';
  }
};

pL.Frame = function(origin, xAxis, yAxis) {
  this.origin = origin;
  this.xAxis = xAxis;
  this.yAxis = yAxis;
};

pL.Frame.prototype = {
  coordMap: function(v) {
    return this.origin.add(this.xAxis.scale(v.x).add(this.yAxis.scale(v.y)));
  },

  toString: function() {
    return '{origin: ' + this.origin +
           ', xAxis: ' + this.xAxis +
           ', yAxis: ' + this.yAxis + '}';
  }
};

pL.Segment = function(start, end) {
  this.start = start;
  this.end = end;
};

pL.Segment.prototype = {
  toString: function() {
    return '{start: ' + this.start + ', end: ' + this.end + '}';
  }
};

pL.transformPainter = function(painter, origin, cornerX, cornerY) {
  return function(frame) {
    var newOrigin = frame.coordMap(origin);
    var newXAxis = frame.coordMap(cornerX).sub(newOrigin);
    var newYAxis = frame.coordMap(cornerY).sub(newOrigin);
    painter(new pL.Frame(newOrigin, newXAxis, newYAxis));
  };
};

pL.flipVertical = function(painter) {
  return pL.transformPainter(painter,
      new pL.Vector(0, 1),
      new pL.Vector(1, 1),
      new pL.Vector(0, 0));
};

pL.flipHorizontal = function(painter) {
  return pL.transformPainter(painter,
      new pL.Vector(1, 0),
      new pL.Vector(0, 0),
      new pL.Vector(1, 1));
};

pL.beside = function(painter1, painter2) {
  var leftPainter = pL.transformPainter(painter1,
      new pL.Vector(0, 0),
      new pL.Vector(0.5, 0),
      new pL.Vector(0, 1));
  var rightPainter = pL.transformPainter(painter2,
      new pL.Vector(0.5, 0),
      new pL.Vector(1, 0),
      new pL.Vector(0.5, 1));
  return function(frame) {
    leftPainter(frame);
    rightPainter(frame);
  };
};

pL.below = function(painter1, painter2) {
  var bottomPainter = pL.transformPainter(painter1,
      new pL.Vector(0, 0),
      new pL.Vector(1, 0),
      new pL.Vector(0, 0.5));
  var topPainter = pL.transformPainter(painter2,
      new pL.Vector(0, 0.5),
      new pL.Vector(1, 0.5),
      new pL.Vector(0, 1));
  return function(frame) {
    topPainter(frame);
    bottomPainter(frame);
  };
};

pL.identity = function(painter) {
  return painter;
};

pL.rotate180 = function(painter) {
  return pL.transformPainter(painter,
      new pL.Vector(1, 1),
      new pL.Vector(0, 1),
      new pL.Vector(1, 0));
};

pL.rotate90 = function(painter) {
  return pL.transformPainter(painter,
      new pL.Vector(1, 0),
      new pL.Vector(1, 1),
      new pL.Vector(0, 0));
};

pL.squashInwards = function(painter) {
  return pL.transformPainter(painter,
      new pL.Vector(0, 0),
      new pL.Vector(0.65, 0.35),
      new pL.Vector(0.35, 0.65));
};

pL.rightSplit = function(painter, n) {
  if (n === 0) return painter;
  var smaller = pL.rightSplit(painter, n - 1);
  return pL.beside(painter, pL.below(smaller, smaller));
};

pL.upSplit = function(painter, n) {
  if (n === 0) return painter;
  var smaller = pL.upSplit(painter, n - 1);
  return pL.below(painter, pL.beside(smaller, smaller));
};

pL.cornerSplit = function(painter, n) {
  if (n === 0) return painter;
  var smaller = pL.cornerSplit(painter, n - 1);
  var up = pL.upSplit(painter, n - 1);
  var right = pL.rightSplit(painter, n - 1);
  return pL.beside(
      pL.below(painter, pL.beside(up, up)),
      pL.below(pL.below(right, right), smaller));
};

pL.squareOfFour = function(tl, tr, bl, br) {
  return function(painter) {
    var left = pL.below(bl(painter), tl(painter));
    var right = pL.below(br(painter), tr(painter));
    return pL.beside(left, right);
  };
};

pL.squareLimit = function(painter, n) {
  var combinator = pL.squareOfFour(
      pL.flipHorizontal,
      pL.identity,
      pL.rotate180,
      pL.flipVertical);
  return combinator(pL.cornerSplit(painter, n));
};

pL.makeSegmentPainter = function(segments, drawSegment) {
  return function(frame) {
    var i;
    for (i = 0; i < segments.length; i++) {
      drawSegment(new pL.Segment(
          frame.coordMap(segments[i].start),
          frame.coordMap(segments[i].end)));
    }
  };
};

pL.makeCanvasXPainter = function(canvas) {
  return pL.makeSegmentPainter([
      new pL.Segment(new pL.Vector(0, 0), new pL.Vector(1, 1)),
      new pL.Segment(new pL.Vector(0, 1), new pL.Vector(1, 0))],
      pL.makeCanvasDrawSegment(canvas));
};

pL.makeCanvasYPainter = function(canvas) {
  return pL.makeSegmentPainter([
      new pL.Segment(new pL.Vector(0, 0), new pL.Vector(1.0, 1.0)),
      new pL.Segment(new pL.Vector(0, 1), new pL.Vector(0.5, 0.5))],
      pL.makeCanvasDrawSegment(canvas));
};

pL.makeCanvasGeorgePainter = function(canvas) {
  return pL.makeSegmentPainter([
      new pL.Segment(new pL.Vector(0.25, 0.00), new pL.Vector(0.37, 0.37)),
      new pL.Segment(new pL.Vector(0.40, 0.00), new pL.Vector(0.50, 0.25)),
      new pL.Segment(new pL.Vector(0.50, 0.25), new pL.Vector(0.62, 0.00)),
      new pL.Segment(new pL.Vector(0.75, 0.00), new pL.Vector(0.70, 0.50)),
      new pL.Segment(new pL.Vector(0.70, 0.50), new pL.Vector(1.00, 0.30)),
      new pL.Segment(new pL.Vector(1.00, 0.50), new pL.Vector(0.75, 0.62)),
      new pL.Segment(new pL.Vector(0.75, 0.62), new pL.Vector(0.62, 0.62)),
      new pL.Segment(new pL.Vector(0.62, 0.62), new pL.Vector(0.75, 0.75)),
      new pL.Segment(new pL.Vector(0.75, 0.75), new pL.Vector(0.62, 1.00)),
      new pL.Segment(new pL.Vector(0.40, 1.00), new pL.Vector(0.30, 0.75)),
      new pL.Segment(new pL.Vector(0.30, 0.75), new pL.Vector(0.40, 0.62)),
      new pL.Segment(new pL.Vector(0.40, 0.62), new pL.Vector(0.25, 0.62)),
      new pL.Segment(new pL.Vector(0.25, 0.62), new pL.Vector(0.20, 0.50)),
      new pL.Segment(new pL.Vector(0.20, 0.50), new pL.Vector(0.00, 0.70)),
      new pL.Segment(new pL.Vector(0.37, 0.37), new pL.Vector(0.30, 0.50)),
      new pL.Segment(new pL.Vector(0.30, 0.50), new pL.Vector(0.12, 0.37)),
      new pL.Segment(new pL.Vector(0.12, 0.37), new pL.Vector(0.00, 0.50))],
      pL.makeCanvasDrawSegment(canvas));
};

pL.makeCanvasDrawSegment = function(canvas) {
  var height = canvas.height;
  var width = canvas.width;
  var context = canvas.getContext('2d');

  return function(segment) {
    var x1 = Math.floor(segment.start.x * (width - 1));
    var y1 = Math.floor((height - 1) - segment.start.y * (height - 1));
    var x2 = Math.floor(segment.end.x * (width - 1));
    var y2 = Math.floor((height - 1) - segment.end.y * (height - 1));
    context.beginPath();
    context.moveTo(x1, y1);
    context.lineTo(x2, y2);
    context.stroke();
    context.closePath();
  };
};

pL.makeCanvasDrawPixel = function(canvas) {
  return function(x, y, r, g, b, a) {
    var row = Math.floor((1 - y) * canvas.height);
    var col = Math.floor(x * canvas.width);
    var context = canvas.getContext('2d');
    var imageData = context.getImageData(col, row, 1, 1);
    imageData.data[0] = r;
    imageData.data[1] = g;
    imageData.data[2] = b;
    imageData.data[3] = a;
    context.putImageData(imageData, col, row);
  };
};

pL.makeImagePainter = function(image, drawPixel) {
  var dummyCanvas = document.createElement('canvas');
  dummyCanvas.height = image.height;
  dummyCanvas.width = image.width;
  var context = dummyCanvas.getContext('2d');
  context.drawImage(image, 0, 0);
  var imageData = context.getImageData(
      0, 0, dummyCanvas.width, dummyCanvas.height);

  var toVector = function(row, col) {
    var x = col / image.width;
    var y = (image.height - row - 1) / image.height;
    return new pL.Vector(x, y);
  };

  return function(frame) {
    var row;
    var col;
    for (row = 0; row < image.height; row++) {
      for (col = 0; col < image.width; col++) {
        var v = frame.coordMap(toVector(row, col));
        var index = 4 * (row * image.width + col);
        var r = imageData.data[index];
        var g = imageData.data[index + 1];
        var b = imageData.data[index + 2];
        var a = imageData.data[index + 3];
        drawPixel(v.x, v.y, r, g, b, a);
      }
    }
  };
};

pL.makeCanvasImagePainter = function(targetCanvas, image) {
  return pL.makeImagePainter(
      image,
      pL.makeCanvasDrawPixel(targetCanvas));
};

