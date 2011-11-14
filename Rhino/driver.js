/**
  * Copyright (c) 2011 Ivan Vladimirov Ivanov (ivan.vladimirov.ivanov@gmail.com)
  *
  * Permission is hereby granted, free of charge, to any person obtaining a copy
  * of this software and associated documentation files (the "Software"), to
  * deal in the Software without restriction, including without limitation
  * the rights to use, copy, modify, merge, publish, distribute, sublicense,
  * and/or sell copies of the Software, and to permit persons to whom the
  * Software is furnished to do so, subject to the following conditions:
  *
  * The above copyright notice and this permission notice shall be included
  * in all copies or substantial portions of the Software.
  *
  * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
  * OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
  * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL
  * THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR
  * OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE,
  * ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
  * OTHER DEALINGS IN THE SOFTWARE.
  *
  *
  * Simple driver for the Picture Language Library.
  *
  * NB - The driver takes a few of seconds for generating the
  * Newton square Limit so be patient!
  *
  * Example usage:
  * jrunscript driver.js
  */

(function() {
  var testGeorgePainter = function(outputFileName) {
    var targetImage = new java.awt.image.BufferedImage(
        400, 400, java.awt.image.BufferedImage.TYPE_INT_ARGB);
    var painter = pL.makeImageGeorgePainter(targetImage);
    var frame = new pL.Frame(
        new pL.Vector(0, 0),
        new pL.Vector(1, 0),
        new pL.Vector(0, 1));

    (pL.squareLimit(painter, 3))(frame);
    var file = new java.io.FileOutputStream(outputFileName);
    javax.imageio.ImageIO.write(targetImage, "png", file);
    file.close();
  }

  var testImagePainter = function(inputFileName, outputFileName) {
    var inputFile = new FileInputStream(inputFileName);
    var image = javax.imageio.ImageIO.read(inputFile);
    inputFile.close();

    var targetImage = new java.awt.image.BufferedImage(
        400, 400, java.awt.image.BufferedImage.TYPE_INT_ARGB);
    var painter = pL.makeImageToImagePainter(targetImage, image);
    var frame = new pL.Frame(
        new pL.Vector(0, 0),
        new pL.Vector(1, 0),
        new pL.Vector(0, 1));

    (pL.squareLimit(pL.flipHorizontal(painter), 2))(frame);
 
    var outputFile = new java.io.FileOutputStream(outputFileName);
    javax.imageio.ImageIO.write(targetImage, "png", outputFile);
    outputFile.close();
  }

  load("picture_language.js");
  testGeorgePainter("george.png");
  testImagePainter("inputImage.jpg", "outputImage.png");
})();

