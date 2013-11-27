function init() {
	// Connect to the SocketIO server to retrieve ongoing games.
	socket = io.connect();
	socket.on('gamesList', function(data) {
								 var ul = document.getElementById('lesParties');
								 ul.innerHTML='';
								 for(p in data.gamesList) {
									 var li = document.createElement('li'); 
									 ul.appendChild( li );
									 var a = document.createElement('a');
									 a.setAttribute('href', '#');
									 a.addEventListener('click', function() {
										document.getElementById('idGame').value = data.gamesList[p];
										document.getElementById('nouvellePartie').submit();
										return false;
									 });
									 a.appendChild( document.createTextNode( data.gamesList[p] ) );
									 li.appendChild(a);
									}
								}
			 );
	socket.emit('loginPage');
	
	document.getElementById('nouvellePartie').addEventListener('submit', function(e) {
		if (document.getElementById('login').value != '' && document.getElementById('idGame').value == '') {
			console.log('login=', document.getElementById('login').value);
			document.getElementById('champLogin').style.display = 'none';
			document.getElementById('champIdGame').style.display = 'block';
			document.getElementById('idGame').focus();
			e.preventDefault();
			return false;
		} else if (document.getElementById('idGame').value != '') {
			// on envoie !
		} else {
			e.preventDefault();
			return false;
		}
	});
}


