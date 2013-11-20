var proposition = [];

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
				robotSpan.setAttribute('data-colonne-origine', colonne);
				robotSpan.setAttribute('data-ligne-origine', ligne);
				
				td.appendChild(robotSpan);
			}
			
			tr.appendChild(td);
		}
		tbody.appendChild(tr);
	}
	table.appendChild(tbody);
	
	document.getElementById('partie').appendChild(table);
	
	var redimensionner = function() {
		var partie = document.getElementById('partie');
		if (partie.offsetWidth < partie.offsetHeight) {
			table.style.width = partie.offsetWidth + 'px';
			table.style.height = partie.offsetWidth + 'px';
		} else {
			table.style.width = partie.offsetHeight + 'px';
			table.style.height = partie.offsetHeight + 'px';
		}
		var largeurCase = parseInt(table.querySelector('td').offsetWidth);
		var L = table.querySelectorAll('tr');
		for (var i = 0; i < L.length; i++) {
			L[i].style.height = largeurCase + 'px';
		}
	};
	redimensionner();
	addEventListener('resize', redimensionner);
}

function clicRobot() {
	selectionnerRobot(this);
}

function selectionnerRobot(robotElement) {
	masquerSelection();
	afficherSelection(robotElement);
	supprimerClicDestinations();
	masquerCasesAccessibles();
	afficherCasesAccessibles(robotElement);
	ajouterClicDestinations();
}

function deplacerRobot(robotElement, caseElement) {
	var couleurRobot = getCouleur(robotElement);
	var dernierDeplace = getDernierRobotDeplace();
	if (dernierDeplace != null) {
		util.removeClass(dernierDeplace, 'dernier-deplace');
	}
	
	if (dernierDeplace != robotElement) {
		proposition.push({
			command: 'select',
			robot: couleurRobot
		});
	}
	
	var coordonnees = getCoordonneesCase(caseElement);
	proposition.push({
		command: 'move',
		line:    coordonnees.ligne,
		column:  coordonnees.colonne
	});

	util.moveTo(robotElement, caseElement);
	util.addClass(robotElement, 'deplace');
	util.addClass(robotElement, 'dernier-deplace');
	supprimerClicRobotsDeplaces();
	supprimerClicDestinations();
	masquerCasesAccessibles();
	
	if (util.hasClass(caseElement, 'cible') && getCouleur(caseElement) == couleurRobot) {
		supprimerClicRobots();
		supprimerTouches();
		
		XHR('POST', '/proposition', {
		
			variables: {
				proposition: JSON.stringify(proposition),
				idGame: getIdGame(),
				login: getLogin()
			},
			
			onload: function() {
				console.log(this.responseText);
			}
			
		});
		
	} else {
		afficherCasesAccessibles(robotElement);
		ajouterClicDestinations();
	}
}

function getCouleur(element) {
	var couleurs = [
		'red',
		'green',
		'blue',
		'yellow'
	].filter(function(couleur) {
		return util.hasClass(element, couleur);
	});
	if (couleurs.length > 0) {
		return couleurs[0];
	} else {
		return null;
	}
}

function getRobotSelectionne() {
	return document.querySelector('.plateau .robot.selection');
}

function getDernierRobotDeplace() {
	return document.querySelector('.plateau .robot.dernier-deplace');
}

function masquerSelection() {
	var selection = getRobotSelectionne();
	if (selection != null) {
		util.removeClass(selection, 'selection');
	}
}

function afficherSelection(robotElement) {
	util.addClass(robotElement, 'selection');
}

function ajouterClicRobots() {
	var L = document.querySelectorAll('.plateau .robot');
	for (var i = 0; i < L.length; i++) {
		L[i].addEventListener('click', clicRobot);
	}
}

function supprimerClicRobotsDeplaces() {
	var L = document.querySelectorAll('.plateau .robot.deplace:not(.dernier-deplace)');
	for (var i = 0; i < L.length; i++) {
		L[i].removeEventListener('click', clicRobot);
	}
}

function supprimerClicRobots() {
	var L = document.querySelectorAll('.plateau .robot');
	for (var i = 0; i < L.length; i++) {
		L[i].removeEventListener('click', clicRobot);
	}
}

function getCoordonneesCase(td) {
	return {
		ligne:   parseInt(td.getAttribute('data-ligne')),
		colonne: parseInt(td.getAttribute('data-colonne'))
	};
}

function getCase(ligne, colonne) {
	return document.querySelector('td[data-ligne="' + ligne + '"][data-colonne="' + colonne + '"]');
}

function contientRobot(caseElement) {
	return caseElement.querySelector('.robot') != null;
}

function deplacementPossible(td, direction) {
	if (td == null) {
		return false;
	}
	
	switch (direction) {
		case 'g':
		if (util.hasClass(td, 'g')) {
			return false;
		} else {
			var coordonnees = getCoordonneesCase(td);
			var caseGauche = getCase(coordonnees.ligne, coordonnees.colonne - 1);
			return caseGauche != null && !util.hasClass(caseGauche, 'd') && !contientRobot(caseGauche);
		}
		break;
		
		case 'h':
		if (util.hasClass(td, 'h')) {
			return false;
		} else {
			var coordonnees = getCoordonneesCase(td);
			var caseHaut = getCase(coordonnees.ligne - 1, coordonnees.colonne);
			return caseHaut != null && !util.hasClass(caseHaut, 'b') && !contientRobot(caseHaut);
		}
		break;
		
		case 'b':
		if (util.hasClass(td, 'b')) {
			return false;
		} else {
			var coordonnees = getCoordonneesCase(td);
			var caseBas = getCase(coordonnees.ligne + 1, coordonnees.colonne);
			return caseBas != null && !util.hasClass(caseBas, 'h') && !contientRobot(caseBas);
		}
		break;
		
		case 'd':
		if (util.hasClass(td, 'd')) {
			return false;
		} else {
			var coordonnees = getCoordonneesCase(td);
			var caseDroite = getCase(coordonnees.ligne, coordonnees.colonne + 1);
			return caseDroite != null && !util.hasClass(caseDroite, 'g') && !contientRobot(caseDroite);
		}
		break;
	}
	
	return false;
}

function masquerCasesAccessibles() {
	var L = document.querySelectorAll('.plateau .accessible');
	for (var i = 0; i < L.length; i++) {
		[
			'accessible',
			'destination',
			'destination-g',
			'destination-h',
			'destination-b',
			'destination-d'
		].forEach(function(class_) {
			util.removeClass(L[i], class_);
		});
	}
}

function afficherCasesAccessibles(robotElement) {

	var caseCourante = robotElement.parentNode;
	var coordonnees = getCoordonneesCase(caseCourante);
	
	var c, ligne, colonne;
	
	// deplacement vers la gauche
	colonne = coordonnees.colonne;
	while (true) {
		c = getCase(coordonnees.ligne, colonne);
		if (c == null) {
			break;
		}
		util.addClass(c, 'accessible');
		if (!deplacementPossible(c, 'g')) {
			if (c != caseCourante) {
				util.addClass(c, 'destination');
				util.addClass(c, 'destination-g');
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
		util.addClass(c, 'accessible');
		if (!deplacementPossible(c, 'h')) {
			if (c != caseCourante) {
				util.addClass(c, 'destination');
				util.addClass(c, 'destination-h');
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
		util.addClass(c, 'accessible');
		if (!deplacementPossible(c, 'b')) {
			if (c != caseCourante) {
				util.addClass(c, 'destination');
				util.addClass(c, 'destination-b');
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
		util.addClass(c, 'accessible');
		if (!deplacementPossible(c, 'd')) {
			if (c != caseCourante) {
				util.addClass(c, 'destination');
				util.addClass(c, 'destination-d');
			}
			break;
		}
		colonne++;
	}
}

function clicDestination() {
	var selection = getRobotSelectionne();
	deplacerRobot(selection, this);
}

function supprimerClicDestinations() {
	var L = document.querySelectorAll('.plateau .destination');
	for (var i = 0; i < L.length; i++) {
		L[i].removeEventListener('click', clicDestination);
	}
}

function ajouterClicDestinations() {
	var L = document.querySelectorAll('.plateau .destination');
	for (var i = 0; i < L.length; i++) {
		L[i].addEventListener('click', clicDestination);
	}
}

function selectionnerRobotSuivant() {
	var L = document.querySelectorAll('.plateau .robot:not(.deplace), .plateau .robot.dernier-deplace');
	var selection = getRobotSelectionne();
	if (selection != null) {
		var index = Array.prototype.indexOf.call(L, selection);
		var prochainIndex = (index + 1) % L.length;
		selectionnerRobot(L[prochainIndex]);
	} else {
		selectionnerRobot(L[0]);
	}
}

function deplacerRobotDirection(direction) {
	var selection = getRobotSelectionne();
	var destination = document.querySelector('.plateau .destination-' + direction);
	if (selection != null && destination != null) {
		deplacerRobot(selection, destination);
	}
}

function appuiTouche(e) {
	console.log(e.keyCode || e.charCode);
	switch (e.keyCode || e.charCode) {
		case 27: // echap
		recommencer();
		break;
	
		case 32: // espace
		selectionnerRobotSuivant();
		break;
		
		case 37: // gauche
		deplacerRobotDirection('g');
		break;
		
		case 38: // haut
		deplacerRobotDirection('h');
		break;
		
		case 40: // bas
		deplacerRobotDirection('b');
		break;
		
		case 39: // droite
		deplacerRobotDirection('d');
		break;
	}
}

function ajouterTouches() {
	document.addEventListener('keypress', appuiTouche);
}

function supprimerTouches() {
	document.removeEventListener('keypress', appuiTouche);
}

function reinitialiserRobots() {
	var L = document.querySelectorAll('.plateau .robot');
	for (var i = 0; i < L.length; i++) {
		[
			'deplace',
			'dernier-deplace',
			'selection'
		].forEach(function(class_) {
			util.removeClass(L[i], class_);
		});
		util.moveTo(L[i], getCase(L[i].getAttribute('data-ligne-origine'), L[i].getAttribute('data-colonne-origine')));
	}
}

function recommencer() {
	proposition.length = 0;
	masquerCasesAccessibles();
	reinitialiserRobots();
	supprimerClicRobots();
	supprimerClicDestinations();
	supprimerTouches();
	ajouterClicRobots();
	ajouterTouches();
}

function getNombreMouvements(proposition) {
	return proposition.filter(function(p) {
		return p.command == 'move';
	}).length;
}

function afficherScore(solution) {
	var scoreElement = document.querySelector('#lesParticipants li[data-nom="' + solution.player + '"] .score');
	var score = getNombreMouvements(solution.proposition);
	scoreElement.innerHTML = '(' + score + ' mouvements)';
	scoreElement.setAttribute('data-score', score);
}

function afficherGagnant() {
	var L = document.querySelectorAll('#lesParticipants span[data-score]');
	var imin = 0;
	for (var i = 1; i < L.length; i++) {
		if (parseInt(L[i].getAttribute('data-score')) < parseInt(L[imin].getAttribute('data-score'))) {
			imin = i;
		}
	}
	util.addClass(L[imin], 'gagnant');
}


