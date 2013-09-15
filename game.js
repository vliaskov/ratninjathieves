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
"use strict";

var GAMEOPTIONS = {
  showAll: false,      // show inactive octopi
  noPause: false,      // don't pause the game when out of focus
  debug: false,        // show extra info
  ratY: 400,
  ratHitYOffset: -60,
  ratHitHeight: 512/5,
  speed: 300,
  jumpDuration: 0.5,   // in seconds
  hitDuration: 0.3,    // in seconds
  numPlayers: 3,
  numLasers: 100,
  laserYRandom: 40,
  laserYSpacing: 250,
  gameOverYOffset: 200,
};

var SYNC = {
  lasers: [],
  players: [],
  gameClock: 0,
  gameOver: false,
  topLaser: 0,
  highScore: 0,
};

var g_availablePlayerIds = [];
for (var ii = 0; ii < 20; ++ii) {
  g_availablePlayerIds.push(ii);
}

var chooseHue = function(ii) {
  var hue = (1 - ii * 0.2) % 1;
  if (ii % 10 >= 5)
  {
    hue += 0.1;
  }
  if (ii % 20 >= 10)
  {
    hue += 0.05;
  }
  return hue;
};

var isPlayerJumping = function(player) {
  var timeSinceLastJump = SYNC.gameClock - player.jumpTime;
  return timeSinceLastJump < OPTIONS.jumpDuration;
};

var jumpPlayer = function(player) {
  player.jumpTime = SYNC.gameClock;
};

var isPlayerHit = function(player) {
  var timeSinceLastHit = SYNC.gameClock - player.hitTime;
  return timeSinceLastHit < OPTIONS.hitDuration;
};

var hitPlayer = function(player) {
  player.hitTime = SYNC.gameClock;
  player.clear = false;
  ++player.hits;
  audio.play_sound('hit');
};

var Game;
var initGame = function() {
  var clock;

  // DELETE THIS!
  for (var ii = 0; ii < OPTIONS.numPlayers; ++ii) {
    SYNC.players.push({
      playerId: ii,
      jumpTime: -100000,
      hits: 0,
      hitTime: -100000,
      clear: true,
    });
  }

  // DELETE THIS!
  for (var ii = 0; ii < OPTIONS.numLasers; ++ii) {
    SYNC.lasers.push({
      y: ii * -OPTIONS.laserYSpacing + randInt(OPTIONS.laserYRandom),
      color: randInt(3),
    });
  }


  connect();
  if (g_socket.offline) {
    log("offline");
    clock = new LocalClock();
  } else {
    log("ONLINE!!!--------");
    clock = new SyncedClock();
  };

  InputSystem.startInput();

  var then = clock.getTime();

  var update = function() {
    var now = clock.getTime();
    var elapsedTime = Math.min(0.1, now - then);
    then = now;
    SYNC.gameClock += elapsedTime;

    checkPlayers();
    checkGameOver();
  };

  var checkGameOver = function() {
    if (!SYNC.gameOver) {
      // check the last laser is off the canvas.
      var yOff = SYNC.gameClock * OPTIONS.speed;
      var laser = SYNC.lasers[SYNC.lasers.length - 1];
      var y = laser.y + yOff - OPTIONS.ratY - OPTIONS.ratHitYOffset;
      if (y > OPTIONS.gameOverYOffset) {
        SYNC.gameOver = true;
      }
    }
  };

  var checkPlayers = function() {
    var topLaser = -1;
    var yOff = SYNC.gameClock * OPTIONS.speed;
    var clears = [true, true, true];
    // check every player vs every laser :-(
    SYNC.lasers.forEach(function(laser, ndx) {
      // is the laser anywhere near the rats
      var y = laser.y + yOff - OPTIONS.ratY - OPTIONS.ratHitYOffset;
      if (y > 0) {
        topLaser = Math.max(ndx, topLaser);
      }
      if (y > 0 && y < OPTIONS.ratHitHeight) {
        // We could hit a rat. check the rats
        SYNC.players.forEach(function(player, ndx) {
          clears[ndx] = false;
          if (player.clear && !isPlayerJumping(player) && !isPlayerHit(player)) {
            hitPlayer(player);
          }
        });
      }
    });

    SYNC.topLaser = topLaser;

    SYNC.players.forEach(function(player, ndx) {
      player.clear = clears[ndx];
    });
  };

  Game = {
    update: update,
  };

};


var gameUpdate = function() {
  Game.update();
};




