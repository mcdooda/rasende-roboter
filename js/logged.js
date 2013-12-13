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
		document.getElementById('compte-a-rebours').style.display = 'block';
		document.getElementById('compte-a-rebours-touch').style.display = 'block';
		var ms   = data.FinalCountDown;
		
		var iv = setInterval(function() {
			ms -= 1000;
			if (ms <= 0) {
				clearInterval(iv);
				document.getElementById('temps').innerHTML = 'Temps écoulé !';
				document.getElementById('temps-touch').innerHTML = '0s';
			} else {
				document.getElementById('temps').innerHTML = parseInt(ms / 1000) + 's';
				document.getElementById('temps-touch').innerHTML = parseInt(ms / 1000) + 's';
			}
		}, 1000);
		
		});
	socket.on('TerminateGame'	, function(data) {
		h1 = document.querySelector('#infos > header > h1');
		h1.innerHTML += ' est terminée';
		afficherGagnant();
		arreterPartie();
		});
	socket.on('solutions'		, function(data) {
		data.solutions.forEach(afficherScore);
		});
	socket.emit ('identification', 	{ login	: getLogin()
									, idGame: getIdGame()}
				);

	XHR('GET', '/' + getIdGame(), {
	
		onload: function() {
			var data = JSON.parse(this.responseText);
			
			util.detectTouch();
			afficherPlateau(data, document.getElementById('partie'), 'plateau');
			ajouterClicRobots();
			ajouterTouches();
			ajouterRedimensionnement();
			redimensionner();
		}
		
	});
}

