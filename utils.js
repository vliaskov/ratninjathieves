
$ = function(id)
{
	return document.getElementById(id);
}

var getURLOptions = function(obj)
{
	var s = window.location.href;
	var q = s.indexOf("?");
	var e = s.indexOf("#");
	if (e < 0)
	{
		e = s.length;
	}
	var query = s.substring(q + 1, e);
	var pairs = query.split("&");
	for (var ii = 0; ii < pairs.length; ++ii)
	{
		var keyValue = pairs[ii].split("=");
		var key = keyValue[0];
		var value = decodeURIComponent(keyValue[1]);
		try {
			value = parseFloat(value);
		} catch (e)
		{
		}
		obj[key] = value;
	}
};

var MergeOptions = function(opt, newOpt)
{
	for (var name in newOpt)
	{
		opt[name] = newOpt[name];
	}
}

var log = function(msg)
{
	if (window.console && window.console.log)
	{
		window.console.log(msg);
	}
}

var getTime = function()
{
	return(new Date()).getTime() * 0.001;
}

var LoadImage = function(url, callback)
{
	var image = new Image();
	image.onload = callback;
	image.src = url;
	return image;
}

var LoadImages = function(images, callback)
{
	var count = 0;
	for (var name in images)
	{
		count++;
		images[name].img = LoadImage(images[name].url, function(){
			count--;
			if(count == 0){
				callback();
			}
		});
	}
}

var Loader = function(callback)
{
	var count = 0;

	this.loadImages = function(images)
	{
		++count;
		var that = this;
		LoadImages(images, function(){
			that.checkDone_();
		});
	}

	this.checkDone_ = function()
	{
		--count;
		if (count == 0)
		{
			callback();
		}
	}
}



var degToRad = function(deg)
{
	return deg * Math.PI / 180;
}

// return int from 0 to range - 1
var randInt = function(range) {
  return Math.floor(Math.random() * range);
}

// shim layer with setTimeout fallback
window.requestAnimFrame = (function(){
	return  window.requestAnimationFrame       ||
		window.webkitRequestAnimationFrame ||
		window.mozRequestAnimationFrame    ||
		window.oRequestAnimationFrame      ||
		window.msRequestAnimationFrame     ||
		function( callback ){
			window.setTimeout(callback, 1000 / 60);
	};
})();

/**
 * Provides cancelRequestAnimationFrame in a cross browser way.
 */
window.cancelRequestAnimFrame = (function(){
	return window.cancelCancelRequestAnimationFrame ||
		window.webkitCancelRequestAnimationFrame ||
		window.mozCancelRequestAnimationFrame ||
		window.oCancelRequestAnimationFrame ||
		window.msCancelRequestAnimationFrame ||
		window.clearTimeout;
})();


(function(){
	/**
	 * A random seed for the pseudoRandom function.
	 * @private
	 * @type {number}
	 */
	var randomSeed_ = 0;

	/**
	 * A constant for the pseudoRandom function
	 * @private
	 * @type {number}
	 */
	var RANDOM_RANGE_ = Math.pow(2, 32);

	/*
	 * Returns a deterministic pseudorandom number between 0 and 1
	 * @return {number} a random number between 0 and 1
	 */
	window.pseudoRandom = function(){
	return (randomSeed_ = (134775813 * randomSeed_ + 1) %
			RANDOM_RANGE_) / RANDOM_RANGE_;
	};

	/*
	 * @return {number} a random number betwen 0 and range - 1
	 */
	window.pseudoRandInt = function(range){
		return Math.floor(window.pseudoRandom() * range);
	}

	/**
	 * Resets the pseudoRandom function sequence.
	 */
	window.resetPseudoRandom = function(){
		randomSeed_ = 0;
	};
}());

