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
	socket.on('gamesList', function(data) {

								 var ul = document.getElementById('lesParties');
								 alert('begin fonction');
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
									 alert('apres a.appendchild');
									 var span = document.createElement('span');
									 alert('apres creation span');
									 //span.setAttribute
									 getImgPart(data.gamesList[p], span);
									 alert('apres getImgPart');
									 a.appendChild(span);
									 alert('ajout span to a');
									 li.appendChild(a);
									 alert('apres creation span and add to a');

									}
								} else {
									var li = document.createElement('li'); 
									ul.appendChild(li);
									li.appendChild(document.createTextNode('Aucune partie disponible'));
									li.className = 'empty';
								}
							}
			);
	socket.emit('loginPage');
	
	document.getElementById('nouvellePartie').addEventListener('submit', function(e) {
		if (document.getElementById('login').value != '' && document.getElementById('idGame').value == '') {
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

function getImgPart(name, span){
  XHR('GET', '/' + name, {
	
		onload: function() {
			alert('dans getImg');
			var data = JSON.parse(this.responseText);
			//console.log('data', data);
			alert('recupere data');
			afficherPlateau(data, span);
			alert('afficher data dans span');
		}
		
	});
  
  
}


