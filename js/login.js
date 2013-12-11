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
	document.getElementById('login').focus();
	// Connect to the SocketIO server to retrieve ongoing games.
	socket = io.connect();
	socket.on('gamesList', function(data) {

		var ul = document.getElementById('lesParties');
		var thumbDiv = document.getElementById('thumb');
		ul.innerHTML='';
		thumbDiv.innerHTML='';
		if(data.gamesList.length > 0)
	        {
			for(p in data.gamesList) {
				  var gameName = data.gamesList[p];
			      var li = document.createElement('li'); 
			      ul.appendChild( li );
			      var a = document.createElement('a');
			      a.setAttribute('href', '#');
			      a.addEventListener('click', function() {
				      document.getElementById('idGame').value = gameName;
				      document.getElementById('nouvellePartie').submit();
				      return false;
			      });
			      a.appendChild( document.createTextNode(gameName) );
			      var div = document.createElement('div');
			      //span.setAttribute
			      getImgPart(gameName, div);
			      thumbDiv.appendChild(div);
			      li.appendChild(a);
				  (function(div) {
					  a.addEventListener('mouseover', function() {
						showThumb(div, true);
					  });
					  a.addEventListener('mouseout', function() {
						showThumb(div, false);
					  });
				  })(div);

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
	
	util.detectTouch();
}

function getImgPart(name, span){
  XHR('GET', '/' + name, {
	
		onload: function() {
			var data = JSON.parse(this.responseText);
			//console.log('data', data);
			afficherPlateau(data, span, 'game-' + name);
		}
		
	});
  
  
}

function showThumb(elem, value) {
console.log(elem);
	elem.style.display = (value ? 'block' : 'none');
}
