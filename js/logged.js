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

function init() {
	// Connect to the SocketIO server to retrieve ongoing games.
	socket = io.connect();
	socket.on('participants', function(data) {
		 var ul = document.getElementById('lesParticipants');
		 ul.innerHTML='';
		 for(p in data.participants) {
			 var li = document.createElement('li'); 
			 ul.appendChild( li );
			 li.appendChild( document.createTextNode( data.participants[p] ) );
			}
		});
	socket.on('FinalCountDown'	, function(data) {
		 var ms   = data.FinalCountDown;
		 console.log("FinalCountDown : " + ms);
		});
	socket.on('TerminateGame'	, function(data) {
		 h1 = document.querySelector('body > header > h1');
		 h1.innerHTML += ' est terminée !';
		});
	socket.on('solutions'		, function(data) {
		 console.log("Solutions are :\n"+JSON.stringify(data.solutions));
		});
	socket.emit ('identification', 	{ login	: document.getElementById('login').value
									, idGame: document.getElementById('idGame').value}
				);

	XHR('GET', '/' + document.getElementById('idGame').value, {
	
		onload: function() {
			var data = JSON.parse(this.responseText);
			console.log('data', data);
			
			var table = document.createElement('table');
			table.className = 'plateau';
			
			var robots = {};
			data.robots.forEach(function(robot) {
				if (!(robot.line in robots)) {
					robots[robot.line] = {};
				}
				robots[robot.line][robot.column] = robot;
			});
			
			var tbody = document.createElement('tbody');
			for (var ligne = 0; ligne < 16; ligne++) {
				var tr = document.createElement('tr');
				for (var colonne = 0; colonne < 16; colonne++) {
					var td = document.createElement('td');
					var casePlateau = data.board[ligne][colonne];
					
					console.log(ligne, colonne, casePlateau);
					
					var classes = [];
					if (casePlateau.g) {
						classes.push('g');					
					}
					if (casePlateau.h) {
						classes.push('h');
					}
					if (casePlateau.b) {
						classes.push('b');
					}
					if (casePlateau.d) {
						classes.push('d');
					}
					if (ligne == data.target.l && colonne == data.target.c) {
						classes.push('cible');
						classes.push(data.target.t);
					}
					
					if (classes.length > 0) {
						td.className = classes.join(' ');
					}
					
					if (ligne in robots && colonne in robots[ligne]) {
						var robot = robots[ligne][colonne];
						var robotSpan = document.createElement('span');
						robotSpan.className = 'robot ' + robot.color;
						td.appendChild(robotSpan);
					}
					
					tr.appendChild(td);
				}
				tbody.appendChild(tr);
			}
			table.appendChild(tbody);
			
			
			
			document.getElementById('partie').appendChild(table);
		}
		
	});
}

