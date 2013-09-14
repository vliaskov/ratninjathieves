/*
 * Copyright 2013, Rat Ninja Thieves Team.
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are
 * met:
 *
 *     * Redistributions of source code must retain the above copyright
 * notice, this list of conditions and the following disclaimer.
 *     * Redistributions in binary form must reproduce the above
 * copyright notice, this list of conditions and the following disclaimer
 * in the documentation and/or other materials provided with the
 * distribution.
 *     * Neither the name of Rat Ninja Thieves Team. nor the names of its
 * contributors may be used to endorse or promote products derived from
 * this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
 * "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
 * LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR
 * A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT
 * OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
 * SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
 * LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
 * DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
 * THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
 * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

var g_canvas;
var g_ctx;
var g_clock = 0;
var g_bgm;
// World scroll position.
var g_printMsgs = [];
var update;

var OPTIONS = {
};

MergeOptions(OPTIONS, GAMEOPTIONS);
getURLOptions(OPTIONS);

var print = function(msg) {
  if (OPTIONS.debug) {
    g_printMsgs.push(msg);
  }
}

var drawPrint = function(ctx) {
  ctx.font = "10pt monospace";
  ctx.fillStyle = "white";
  for (var ii = 0; ii < g_printMsgs.length; ++ii) {
    ctx.fillText(g_printMsgs[ii], 10, ii * 15 + 20);
  }
  g_printMsgs = [];
}

var drawText = function(ctx, x, y, msg, opt_color) {
  ctx.font = "10pt monospace";
  ctx.fillStyle = opt_color || "white";
  ctx.fillText(msg, x, y);
}

var resizeCanvas = function() {
}

var g_images = {
  rat01:
  {
    url: "images/rat01.png"
  },
  title:
  {
    url: "images/title.png"
  },
  laser:
  {
	url: "images/laser1.png"
}
};

Sounds = {
  hit: {
    filename: "sounds/hit.wav",
    samples: 3
  },
  jump: {
    filename: "sounds/jump.wav",
    samples: 6
  },
};

var GenerateColors = function(images, hsvs, callback) {
  var count = 0;
  images.forEach(function(image) {
    images.imgs = [];
    hsvs.forEach(function(hsv, ndx) {
      ++count;
      ImageProcess.adjustHSV(image.img, hsv.h, hsv.s, hsv.v, function(images, ndx) {
        return function(img) {
          imgs[ndx] = msg;
          --count;
          checkDone();
        }
      })
    });
  });

  var checkDone= function() {
    if (count == 0) {
      callback();
    }
  }
};

var main = function() {
  initGame();
  var requestId;
  g_canvas = document.getElementById("canvas");
  resizeCanvas();
  window.addEventListener('resize', resize, true);
  window.addEventListener('blur', function() {
    if (!OPTIONS.noPause){
      pauseGame();
    }
  }, true);
  window.addEventListener('focus', function() {
    if (!OPTIONS.noPause){
      resumeGame();
    }
  }, true);
  g_ctx = g_canvas.getContext("2d");

  window.addEventListener('click', handleClick);
  window.addEventListener('touchstart', handleClick);

  var handleClick = function(event) {
  }

  var then = getTime();
  var mainLoop = function()
  {
    var now = getTime();
    var elapsedTime = Math.min(0.1, now - then);
    then = now;
    g_clock += elapsedTime;

    gameUpdate();
    update(elapsedTime, g_ctx);
    drawPrint(g_ctx);

    requestId = requestAnimFrame(mainLoop, g_canvas);
  }

  var loader = new Loader(mainLoop);
  loader.loadImages(g_images);
  if (false)  // set to true to repeat background music? Maybe not
  {
    g_bgm = $('bgm');
    g_bgm.addEventListener('ended', function() {
      log("replay");
      this.currentTime = 0;
      this.play();
    }, false);
  }
  audio.init(Sounds);

  var resize = function()
  {
    resizeCanvas();
    update(0.0001, g_ctx);
  }

  var pauseGame = function()
  {
    if (requestId !== undefined)
    {
      cancelRequestAnimFrame(requestId);
      requestId = undefined;
    }
  }

  var resumeGame = function()
  {
    if (requestId === undefined)
    {
      mainLoop();
    }
  }

  var processImages = function(callback)
  {
    var count = 0;
    for (var ii = 0; ii < g_octopi.length; ++ii)
    {
      var octopus = g_octopi[ii];
      var drawInfo = octopus.drawInfo;
      if (drawInfo.hue)
      {
        var octoImages = drawInfo.images;
        for (var name in octoImages)
        {
          ++count;
          var image = octoImages[name].img;
          ImageProcess.adjustHSV(image, drawInfo.hue, 0, 0, function(images, name){
            return function(img){
              images[name].img = img;
              --count;
              checkDone();
            }
          }(octoImages, name));
        }
      }
    }

    var checkDone = function()
    {
      if (count == 0)
      {
        callback();
      }
    }

    checkDone();
  }
}

var drawBackground = function(ctx)
{
  ctx.fillStyle = "rgb(80,80,80)";
  ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
}

var drawImageCentered = function(ctx, img, x, y)
{
  ctx.save();
  ctx.translate(x, y);
  ctx.translate(-img.width * 0.5, -img.height * 0.5);
  //ctx.fillStyle = "purple";
  //ctx.fillRect(0, 0, img.width, img.height);
  ctx.scale(0.5, 0.5);
  ctx.drawImage(img, 0, 0);
  ctx.restore();
}

var drawCircle = function(ctx, x, y, radius, color)
{
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2, false);
  ctx.fill();
}

var drawCircleLine = function(ctx, x, y, radius, color)
{
  ctx.strokeStyle = color;
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2, false);
  ctx.stroke();
}

var drawLasers = function(ctx) {
  yOff = SYNC.gameClock * OPTIONS.speed;
  SYNC.lasers.forEach(function(laser, ndx) {
    var y = laser.y + yOff;
	ctx.drawImage(g_images.laser.img, 0, y - 35);
  });
};

var drawPlayers = function(ctx) {
  var numPlayers = SYNC.players.length;
  var spacing = ctx.canvas.width / (numPlayers + 1);
  SYNC.players.forEach(function(player, ndx) {
    var x = Math.floor((ndx + 1) * spacing);
    drawImageCentered(ctx, g_images.rat01.img, x, OPTIONS.ratY);
  });
};

var drawOther = function(ctx) {

};

var update = function(elapsedTime, ctx)
{
  print("");
  print(SYNC.gameClock.toFixed(2));

  ctx.save();
  drawBackground(ctx);
  drawLasers(ctx);
  drawPlayers(ctx);
  drawOther(ctx);
  ctx.restore();
};

window.onload = main;


