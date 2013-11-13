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
}

