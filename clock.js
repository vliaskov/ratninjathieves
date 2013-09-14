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


/**
 * @fileoverview This file contains various functions for managing a clock
 */

/**
 * Creates a clock. Optionally synced to a server
 * @param {number} opt_syncRate. If passed, this is the number of seconds
 *        between syncing to the server. If not passed the local clock is used.
 *        Note: If the client is faster than the server this means it's possible
 *        the clock will report a certain time and then later a previous time.
 */
var createClock = function(opt_syncRate, opt_url) {
  if (opt_syncRate) {
    return new SyncedClock(opt_syncRate, opt_url);
  } else {
    return new LocalClock();
  }
};


/**
 * A clock that gets the local current time in seconds.
 * @private
 */
var LocalClock = function() {
};

/**
 * Gets the current time in seconds.
 * @private
 */
LocalClock.prototype.getTime = function() {
  return (new Date()).getTime() * 0.001;
}

/**
 * A clock that gets the current time in seconds attempting to eep the clock
 * synced to the server.
 * @private
 */
var SyncedClock = function(opt_syncRate, opt_url) {
  this.url = opt_url || window.location.href;
  this.syncRate = opt_syncRate || 10;
  this.timeOffset = 0;
  this.syncToServer();
};

SyncedClock.prototype.getLocalTime_ = function() {
  return (new Date()).getTime() * 0.001;
}

SyncedClock.prototype.syncToServer = function() {
  var that = this;
  var sendTime = this.getLocalTime_();
  sendJSON(this.url, {cmd: 'time'}, function(obj, exception) {
    if (exception) {
      log("error: syncToServer: " + exception);
    } else {
      var receiveTime = that.getLocalTime_();
      var duration = receiveTime - sendTime;
      var serverTime = obj.time + duration * 0.5;
      that.timeOffset = serverTime - receiveTime;
      log("new timeoffset: " + that.timeOffset);
    }
    setTimeout(function() {
        that.syncToServer();
      }, that.syncRate * 1000);
  });
};

/**
 * Gets the current time in seconds.
 * @private
 */
SyncedClock.prototype.getTime = function() {
  return (new Date()).getTime() * 0.001 + this.timeOffset;
}

