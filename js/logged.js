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

function afficherPlateau(plateau) {
	var table = document.createElement('table');
	table.className = 'plateau';
	
	var robots = {};
	plateau.robots.forEach(function(robot) {
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
			var casePlateau = plateau.board[ligne][colonne];
			
			td.setAttribute('data-colonne', colonne);
			td.setAttribute('data-ligne', ligne);
			
			// classes appliquees sur la case
			var classes = [];
			
			for (var mur in casePlateau) {
				classes.push(mur);
			}
			

			if (ligne == plateau.target.l && colonne == plateau.target.c) {
				classes.push('cible');
				classes.push(plateau.target.t);
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

function gererClicRobots() {
	var L = document.querySelectorAll('.plateau .robot');
	for (var i = 0; i < L.length; i++) {
		L[i].addEventListener('click', afficherCasesAccessibles);
	}
}

function coordonneesCase(td) {
	return {
		ligne:   parseInt(td.getAttribute('data-ligne')),
		colonne: parseInt(td.getAttribute('data-colonne'))
	};
}

function getCase(ligne, colonne) {
	return document.querySelector('td[data-ligne="' + ligne + '"][data-colonne="' + colonne + '"]');
}

function getClasses(element) {
	console.log(element);
	return element.className.split(' ');
}

function hasClass(element, class_) {
	return getClasses(element).indexOf(class_) != -1;
}

function addClass(element, class_) {
	var classes = getClasses(element);
	if (!hasClass(element, class_)) {
		classes.push(class_);
		element.className = classes.join(' ');
	}
}

function removeClass(element, class_) {
	var classes = getClasses(element);
	var index = classes.indexOf(class_);
	if (index != -1) {
		classes.splice(index, 1);
		element.className = classes.join(' ');
	}
}

function deplacementPossible(td, direction) {
	if (td == null) {
		return false;
	}
	
	switch (direction) {
		case 'g':
		if (hasClass(td, 'g')) {
			return false;
		} else {
			var coordonnees = coordonneesCase(td);
			var caseGauche = getCase(coordonnees.ligne, coordonnees.colonne - 1);
			return caseGauche != null && !hasClass(caseGauche, 'd');
		}
		break;
		
		case 'h':
		if (hasClass(td, 'h')) {
			return false;
		} else {
			var coordonnees = coordonneesCase(td);
			var caseHaut = getCase(coordonnees.ligne - 1, coordonnees.colonne);
			return caseHaut != null && !hasClass(caseHaut, 'b');
		}
		break;
		
		case 'b':
		if (hasClass(td, 'b')) {
			return false;
		} else {
			var coordonnees = coordonneesCase(td);
			var caseBas = getCase(coordonnees.ligne + 1, coordonnees.colonne);
			return caseBas != null && !hasClass(caseBas, 'h');
		}
		break;
		
		case 'd':
		if (hasClass(td, 'd')) {
			return false;
		} else {
			var coordonnees = coordonneesCase(td);
			var caseDroite = getCase(coordonnees.ligne, coordonnees.colonne + 1);
			return caseDroite != null && !hasClass(caseDroite, 'g');
		}
		break;
	}
	
	return false;
}

function masquerCasesAccessibles() {
	var L = document.querySelectorAll('.plateau .accessible');
	for (var i = 0; i < L.length; i++) {
		removeClass(L[i], 'accessible');
		removeClass(L[i], 'destination');
	}
}

function afficherCasesAccessibles() {
	masquerCasesAccessibles();

	var caseCourante = this.parentNode;
	var coordonnees = coordonneesCase(caseCourante);
	
	var c, ligne, colonne;
	
	// deplacement vers la gauche
	colonne = coordonnees.colonne;
	while (true) {
		c = getCase(coordonnees.ligne, colonne);
		if (c == null) {
			break;
		}
		addClass(c, 'accessible');
		if (!deplacementPossible(c, 'g')) {
			if (c != caseCourante) {
				addClass(c, 'destination');
			}
			break;
		}
		colonne--;
	}
	
	// deplacement vers le haut
	ligne = coordonnees.ligne;
	while (true) {
		c = getCase(ligne, coordonnees.colonne);
		if (c == null) {
			break;
		}
		addClass(c, 'accessible');
		if (!deplacementPossible(c, 'h')) {
			if (c != caseCourante) {
				addClass(c, 'destination');
			}
			break;
		}
		ligne--;
	}
	
	// deplacement vers le bas
	ligne = coordonnees.ligne;
	while (true) {
		c = getCase(ligne, coordonnees.colonne);
		if (c == null) {
			break;
		}
		addClass(c, 'accessible');
		if (!deplacementPossible(c, 'b')) {
			if (c != caseCourante) {
				addClass(c, 'destination');
			}
			break;
		}
		ligne++;
	}
	
	// deplacement vers la droite
	colonne = coordonnees.colonne;
	while (true) {
		c = getCase(coordonnees.ligne, colonne);
		if (c == null) {
			break;
		}
		addClass(c, 'accessible');
		if (!deplacementPossible(c, 'd')) {
			if (c != caseCourante) {
				addClass(c, 'destination');
			}
			break;
		}
		colonne++;
	}
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
			
			afficherPlateau(data);
			gererClicRobots();
		}
		
	});
}

