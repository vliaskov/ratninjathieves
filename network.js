
var g_socket;
var g_statusElem;
var g_numPlayers = 0;
var g_players = {};

var NUM_PLAYERS_PER_OCTOPUS = 8;
var g_octopiByNumPlayers = [];
var g_numNetOctopi = 0;
var g_numActiveOctopi = 0;

for (var ii = 0; ii <= NUM_PLAYERS_PER_OCTOPUS; ++ii) {
	g_octopiByNumPlayers.push([]);
}

// adds a player to the octopus
// with the lowest number of users
// returns the netInfo of that octopus
var getOctopusForPlayer = (function() {
	var checkOrder = [];
	for (var ii = 0; ii < NUM_PLAYERS_PER_OCTOPUS; ++ii) {
		checkOrder.push((ii + 1) % NUM_PLAYERS_PER_OCTOPUS);
	}

	return function() {
		// if there are only 8s and one 4 then start a new octopus.
		var non4s = 0;
		for (var ii = 1; ii < NUM_PLAYERS_PER_OCTOPUS; ++ii) {
			if (ii == 4) {
				continue;
			}
			non4s += g_octopiByNumPlayers[ii].length;
		}
		if (non4s == 0 && g_octopiByNumPlayers[4].length == 1 && g_octopiByNumPlayers[0].length > 0) {
			return useOctopiLevel(0);
		}

		for (var jj = 0; jj < checkOrder.length; ++jj) {
			var ii = checkOrder[jj];
			var octopi = g_octopiByNumPlayers[ii];
			if (octopi && octopi.length > 0) {
				return useOctopiLevel(ii);
			}
		}
		throw "should never get here";
	}
}());

var useOctopiLevel = function(ii) {
	var octopi = g_octopiByNumPlayers[ii];
	var octoNetInfo = octopi.pop();
	g_octopiByNumPlayers[ii + 1].push(octoNetInfo);
	octoNetInfo.octo.inactive = false;
	if (ii == 0) {
		++g_numActiveOctopi;
	}
	return octoNetInfo;
}

var removePlayerFromOctopus = function(octoNetInfo) {
	var newCount = NUM_PLAYERS_PER_OCTOPUS - octoNetInfo.freeSlots.length;
	var oldCount = newCount + 1;
	var oldIndex = g_octopiByNumPlayers[oldCount].indexOf(octoNetInfo);
	if (oldIndex < 0) {
		throw "should never get here";
	}
	g_octopiByNumPlayers[oldCount].splice(oldIndex, 1);
	g_octopiByNumPlayers[newCount].push(octoNetInfo);
	if (newCount == 0) {
		if (OPTIONS.battle) {
			octoNetInfo.octo.health = 0;
		}
		--g_numActiveOctopi;
	}
}

var addNetOctopus = function(octopus) {
	var netInfo = {
		octo: octopus,
		players: [],
		freeSlots: [0, 1, 2, 3, 4, 5, 6, 7]
	};
	octopus.netInfo = netInfo;
	g_octopiByNumPlayers[0].unshift(netInfo);
}

var redistributePlayers = function(octoNetInfo) {
	var players = [];
	while (octoNetInfo.players.length) {
		var player = octoNetInfo.players[0];
		player.removeFromOctopus();
		players.push(player);
	}
	for (var ii = 0; ii < players.length; ++ii) {
		players[ii].addToOctopus();
	}
}

var connect = function()
{
	if (!window.io)
	{
		log("no socket io");
		g_socket = {
            offline: true,
			send: function()
 			{
			}
		};
		return;
	}


	$("online").style.display = "block";
	g_statusElem = $("onlinestatus");
	var url = "http://" + window.location.host;
	log("connecting to: " + url);
//  g_socket = new io.connect(window.location.host, {
//      transports: ['websocket']});
	g_socket = io.connect(url);
	g_socket.on('connect', connected);
	g_socket.on('message', function(obj){
//log("got message");
//log(obj);
				processMessage(obj);
			   });
	g_socket.on('disconnect', disconnected);
}

var sendCmd = function(cmd, id, data)
{
	g_socket.emit('message',{
		cmd: cmd,
		id: id,
		data: data
	});
}

var connected = function()
{
	sendCmd("server");
	sendCmd("broadcast", -1,{
		cmd: 'reconnect'
	});
	updateOnlineStatus();
}

var updateOnlineStatus = function()
{
	g_statusElem.innerHTML = "num players: " + g_numPlayers;
	g_statusElem.style.backgroundColor = "green";
}

var disconnected = function()
{
	g_statusElem.innerHTML = "disconnected";
	g_statusElem.style.backgroundColor = "red";
	while (g_numPlayers > 0)
	{
		for (var id in g_players)
		{
			removePlayer(id);
			break;
		}
	}
	connect();
}

var sendCmd = function(cmd, id, data)
{
	g_socket.emit('message',{
		cmd: cmd,
		id: id,
		data: data
	});
}

var processMessage = function(msg)
{
	switch (msg.cmd)
	{
	case 'start':
		startPlayer(msg.id);
		break;
	case 'update':
		updatePlayer(msg.id, msg.data);
		break;
	case 'remove':
		removePlayer(msg.id);
		break;
	}
}

var startPlayer = function(id)
{
	// Checks if a player is already under this id
	if (g_players[id])
	{
		return;
	}
	if (g_numPlayers >= OPTIONS.numOctopi * NUM_PLAYERS_PER_OCTOPUS) {
		return;
	}
	++g_numPlayers;
	updateOnlineStatus();
	g_players[id] = new Player(id);
}

var updatePlayer = function(id, msg)
{
	var player = g_players[id];
	if (!player)
	{
		return;
	}

	player.update(msg);
}

var removePlayer = function(id)
{
	if (g_players[id])
	{
		--g_numPlayers;
		updateOnlineStatus();
		g_players[id].removeFromGame();
		delete g_players[id];
	}
}

g_slotRemap = [
	5,
	2,
	7,
	0,
	6,
	1,
	4,
	3
];

var getLegId = function(slotId)
{
	return g_slotRemap[slotId % 8];
}

var Player = function(clientId)
{
	this.clientId = clientId;
	this.slotId = -1;
	this.addToOctopus();
}

Player.prototype.update = function(msg)
{
	//log("player slot:" + this.slotId + ", msg");
	switch (msg.cmd)
	{
	case 'press':
		InputSystem.addEvent(this.octoNetInfo.octo.getOctoId(), getLegId(this.slotId));
		break;
	}
};

Player.prototype.addToOctopus = function()
{
	var octoNetInfo = getOctopusForPlayer();
	octoNetInfo.players.push(this);
	this.octoNetInfo = octoNetInfo;
	this.slotId = octoNetInfo.freeSlots.shift();
	var teamId = octoNetInfo.octo.getOctoId();
	this.send({
		cmd: 'id',
		legId: getLegId(this.slotId),
		teamId: teamId,
		hue: octoNetInfo.octo.drawInfo.hue
	});
};

Player.prototype.removeFromOctopus = function()
{
	var octoNetInfo = this.octoNetInfo;
	octoNetInfo.freeSlots.push(this.slotId);
	var ndx = octoNetInfo.players.indexOf(this);
	octoNetInfo.players.splice(ndx, 1);
	removePlayerFromOctopus(this.octoNetInfo);
};

Player.prototype.removeFromGame = function()
{
	this.removeFromOctopus();
};

Player.prototype.send = function(cmd)
{
	sendCmd("client", this.clientId, cmd);
};

