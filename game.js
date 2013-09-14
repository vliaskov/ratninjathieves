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
  speed: 300,
};

var SYNC = {
  lasers: [],
  players: [],
  state: 'title',
  gameClock: 0,
};

var g_availablePlayerIds = [];
for (var ii = 0; ii < 20; ++ii) {
  g_availablePlayerIds.push(ii);
}

// DELETE THIS!
for (var ii = 0; ii < 3; ++ii) {
  SYNC.players.push({playerId: ii});
}

// DELETE THIS!
for (var ii = 0; ii < 100; ++ii) {
  SYNC.lasers.push({
    y: ii * -250 + randInt(40),
    color: randInt(3),
  });
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


var Game;

var initGame = function() {
  var clock;

  connect();
  if (g_socket.offline) {
    log("offline");
    clock = new LocalClock();
  } else {
    log("ONLINE!!!--------");
    clock = new SyncedClock();
  };

  var then = clock.getTime();

  var update = function() {
    var now = clock.getTime();
    var elapsedTime = now - then;
    then = now;
    SYNC.gameClock += elapsedTime;
  };

  Game = {
    update: update,
  };

};


var gameUpdate = function() {
  Game.update();
};




