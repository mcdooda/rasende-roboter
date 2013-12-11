var XHR = function(method, ad, params) {
	var xhr = new XMLHttpRequest();
	xhr.onload = params.onload || null;
	xhr.open(method, ad);
	if(method == 'POST') {xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');}
	var variables   = params.variables || null
	  , str			= '';
	for(var i in variables) {
		str += i + '=' + encodeURIComponent( variables[i] ) + '&';
		}
	xhr.send( str );
}

function getLogin() {
	return document.getElementById('login').value;
}

function getIdGame() {
	return document.getElementById('idGame').value;
}

function init() {
	// Connect to the SocketIO server to retrieve ongoing games.
	socket = io.connect();
	socket.on('participants', function(data) {
		var ul = document.getElementById('lesParticipants');
		ul.innerHTML='';
		for(p in data.participants) {
			var li = document.createElement('li');
			li.setAttribute('data-nom', data.participants[p]);
			ul.appendChild( li );
			li.appendChild( document.createTextNode( data.participants[p] + " " ) );
			if(data.participants[p] == getLogin()) {
				li.className = 'login'
			}
			var score = document.createElement('span');
			score.className = 'score';
			li.appendChild(score);
			}
		});
	socket.on('FinalCountDown'	, function(data) {
		document.getElementById('count').style.display = 'block';
		var ms   = data.FinalCountDown;
		console.log("FinalCountDown : " + ms);
		
		var iv = setInterval(function() {
			ms -= 1000;
			if (ms <= 0) {
				clearInterval(iv);
				document.getElementById('final-count-down').innerHTML = 'time over';
			} else {
				document.getElementById('final-count-down').innerHTML = parseInt(ms / 1000) + 's';
			}
		}, 1000);
		
		});
	socket.on('TerminateGame'	, function(data) {
		h1 = document.querySelector('#infos > header > h1');
		h1.innerHTML += ' est terminée !';
		afficherGagnant();
		});
	socket.on('solutions'		, function(data) {
		console.log("Solutions are :\n"+JSON.stringify(data.solutions));
		data.solutions.forEach(afficherScore);
		});
	socket.emit ('identification', 	{ login	: getLogin()
									, idGame: getIdGame()}
				);

	XHR('GET', '/' + getIdGame(), {
	
		onload: function() {
			var data = JSON.parse(this.responseText);
			console.log('data', data);
			
			afficherPlateau(data);
			ajouterClicRobots();
			ajouterTouches();
		}
		
	});
	
	util.detectTouch();
}

