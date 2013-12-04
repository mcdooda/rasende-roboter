var proposition = [];

// construction du tableau contenant le plateau de jeu
function afficherPlateau(plateau) {
	var table = document.createElement('table');
	table.setAttribute('id', 'plateau');
	
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
		var largeurPlateau;
		var ratio = 0.96;
		if (partie.offsetWidth < partie.offsetHeight) {
			largeurPlateau = partie.offsetWidth * ratio;
			table.style.width = largeurPlateau + 'px';
			table.style.height = largeurPlateau + 'px';
		} else {
			largeurPlateau = partie.offsetHeight * ratio;
			table.style.width = largeurPlateau + 'px';
			table.style.height = largeurPlateau + 'px';
		}
		var largeurCase = largeurPlateau / 16;
		var L = table.querySelectorAll('tr, td');
		for (var i = 0; i < L.length; i++) {
			L[i].style.height = largeurCase + 'px';
		}
		var largeurRobot = (largeurCase - 1) * 0.8;
		var M = table.querySelectorAll('.robot');
		for (var i = 0; i < M.length; i++) {
			M[i].style.height = largeurRobot + 'px';
			M[i].style.width  = largeurRobot + 'px';
		}
	};
	redimensionner();
	addEventListener('resize', redimensionner);
}

// fonction appelee lors du clic sur un robot
function clicRobot() {
	selectionnerRobot(this);
}

// un robot est selectionne, on affiche les cases disponibles et on ajoute les evenements necessaires
function selectionnerRobot(robotElement) {
	masquerSelection();
	afficherSelection(robotElement);
	supprimerClicDestinations();
	masquerCasesAccessibles();
	afficherCasesAccessibles(robotElement);
	ajouterClicDestinations();
}
//tracer la route du robot
function trace(robot, caseArrivee){
	var couleur = getCouleur(robot);
	var caseCourante = robot.parentNode;
	var coordonnees = getCoordonneesCase(caseCourante);
	var direction = getDirection(caseArrivee);
	switch(direction){
		case 'd':
			for(var i = getCoordonneesCase(caseCourante).colonne; i <= getCoordonneesCase(caseArrivee).colonne;i++){
				supprimerTrace(getCase(getCoordonneesCase(caseCourante).ligne,i));
				util.addClass(getCase(getCoordonneesCase(caseCourante).ligne,i),'trace');
				util.addClass(getCase(getCoordonneesCase(caseCourante).ligne,i),'trace-'+couleur);
			}
		break;
		case 'g':
			for(var i = getCoordonneesCase(caseArrivee).colonne; i <= getCoordonneesCase(caseCourante).colonne;i++){
				supprimerTrace(getCase(getCoordonneesCase(caseCourante).ligne,i));
				util.addClass(getCase(getCoordonneesCase(caseCourante).ligne,i),'trace');
				util.addClass(getCase(getCoordonneesCase(caseCourante).ligne,i),'trace-'+couleur);
			}
		break;
		case 'b':
			for(var i = getCoordonneesCase(caseCourante).ligne; i <= getCoordonneesCase(caseArrivee).ligne;i++){
				supprimerTrace(getCase(i,getCoordonneesCase(caseCourante).colonne));			
				util.addClass(getCase(i,getCoordonneesCase(caseCourante).colonne),'trace');
				util.addClass(getCase(i,getCoordonneesCase(caseCourante).colonne),'trace-'+couleur);
			}
		break;
		case 'h':
			for(var i = getCoordonneesCase(caseArrivee).ligne; i <= getCoordonneesCase(caseCourante).ligne;i++){
				supprimerTrace(getCase(i,getCoordonneesCase(caseCourante).colonne));
				util.addClass(getCase(i,getCoordonneesCase(caseCourante).colonne),'trace');
				util.addClass(getCase(i,getCoordonneesCase(caseCourante).colonne),'trace-'+couleur);
			}
		break;
	}
}

// un robot est deplace vers une case
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
	trace(robotElement, caseElement);
	util.moveTo(robotElement, caseElement);
	util.addClass(robotElement, 'deplace');
	util.addClass(robotElement, 'dernier-deplace');
	supprimerClicRobotsDeplaces();
	supprimerClicDestinations();
	masquerCasesAccessibles();
	
	if (util.hasClass(caseElement, 'cible') && getCouleur(caseElement) == couleurRobot) {
		supprimerClicRobots();
		supprimerTouches();
		envoyerProposition();
	} else {
		afficherCasesAccessibles(robotElement);
		ajouterClicDestinations();
	}
}

function envoyerProposition() {
	XHR('POST', '/proposition', {
		variables: {
			proposition: JSON.stringify(proposition),
			idGame: getIdGame(),
			login: getLogin()
		},
		
		onload: function(event) {
			console.log(this.responseText);
			var data = JSON.parse(this.responseText);
			console.log(data);
			
			var messageElem = document.getElementById('message');
			switch(data.state) {
				case 'INVALID_EMPTY':
				case 'INVALID_MOVE':
				case 'INVALID_SELECT':
				case 'INCOMPLETE':
					messageElem.className = 'error';
					messageElem.style.display = 'block';
					
					var message = data.details;
					if(message.length == 0)
						message = "Solution invalide"
						
					messageElem.innerHTML = message;
					break;
				case 'SUCCESS':
					messageElem.className = 'info';
					messageElem.style.display = 'block';
					
					var message = data.details;
					if(message.length == 0)
						message = "Proposition envoyée"
						
					messageElem.innerHTML = message;
					break;
				default:
					break;
			}
		}
	});

}
// renvoie la couleur red, green, blue ou yellow d'un robot ou d'une case
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

// renvoie la direction d'une case destination
function getDirection(element) {
	var destinations = [
		'destination-g',
		'destination-d',
		'destination-h',
		'destination-b'
	].filter(function(destination) {
		return util.hasClass(element, destination);
	});
	if (destinations.length > 0) {
		return destinations[0].split('-')[1];
	} else {
		return null;
	}
}

// renvoie le robot selectionne
function getRobotSelectionne() {
	return document.querySelector('#plateau .robot.selection');
}

// renvoie le dernier robot qui a ete deplace
function getDernierRobotDeplace() {
	return document.querySelector('#plateau .robot.dernier-deplace');
}

// masque l'effet de selection sur le robot
function masquerSelection() {
	var selection = getRobotSelectionne();
	if (selection != null) {
		util.removeClass(selection, 'selection');
	}
}

// affiche l'effet de selection sur un robot
function afficherSelection(robotElement) {
	util.addClass(robotElement, 'selection');
}

// fonction appelee lors du drag d'un robot
function drag(evt) {
	evt.dataTransfer.effectAllowed = 'copyMove';
	evt.dataTransfer.setData("Text",evt.target.id);
}

// ajoute les evenements clic sur les robots
function ajouterClicRobots() {
	var L = document.querySelectorAll('#plateau .robot');
	for (var i = 0; i < L.length; i++) {
		L[i].addEventListener('mousedown', clicRobot);
		L[i].addEventListener('touchstart', clicRobot);
		L[i].setAttribute('draggable','true');
		L[i].setAttribute('id',i);
		L[i].addEventListener('dragstart', drag);
	}
}

function supprimerClicRobot(robotElement) {
	robotElement.removeEventListener('mousedown', clicRobot);
	robotElement.removeEventListener('touchstart', clicRobot);
	robotElement.setAttribute('draggable','false');
	robotElement.removeEventListener('dragstart', drag);
}

// supprime les evenements clic pour les robots ne pouvant plus etre deplaces
function supprimerClicRobotsDeplaces() {
	var L = document.querySelectorAll('#plateau .robot.deplace:not(.dernier-deplace)');
	for (var i = 0; i < L.length; i++) {
		supprimerClicRobot(L[i]);
	}
}

// supprime les evenements clic sur tous les robots
function supprimerClicRobots() {
	var L = document.querySelectorAll('#plateau .robot');
	for (var i = 0; i < L.length; i++) {
		supprimerClicRobot(L[i]);
	}
}

// renvoie les coordonnees d'une case au format { ligne: y, colonne: x }
function getCoordonneesCase(td) {
	return {
		ligne:   parseInt(td.getAttribute('data-ligne')),
		colonne: parseInt(td.getAttribute('data-colonne'))
	};
}

// renvoie la case correspondant aux coordonnees
function getCase(ligne, colonne) {
	return document.querySelector('td[data-ligne="' + ligne + '"][data-colonne="' + colonne + '"]');
}

// renvoie si une case contient un robot
function contientRobot(caseElement) {
	return caseElement.querySelector('.robot') != null;
}

// renvoie si un deplacement dans une direction est disponible depuis une case donnee
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

// masque l'effet de case accessible sur toutes les cases
function masquerCasesAccessibles() {
	var L = document.querySelectorAll('#plateau .accessible');
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

// enlève les traces des robots
function supprimerTraces() {
	var L = document.querySelectorAll('#plateau .trace');
	for (var i = 0; i < L.length; i++) {
		[
			'trace',
			'trace-blue',
			'trace-red',
			'trace-green',
			'trace-yellow'
		].forEach(function(class_) {
			util.removeClass(L[i], class_);
		});
	}
}

function supprimerTrace(caseElement) {
	[
		'trace',
		'trace-blue',
		'trace-red',
		'trace-green',
		'trace-yellow'
	].forEach(function(class_) {
		util.removeClass(caseElement, class_);
	});
}

// affiche les cases accessibles d'un robot
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

// fonction appelee lors d'un clic sur une case accessible pour le robot selectionne
function clicDestination() {
	var selection = getRobotSelectionne();
	deplacerRobot(selection, this);
}

// fonction appelee lors du deplacement d'un robot sur une case
function dragOverEnter(evt) {
	evt.stopPropagation();
	evt.preventDefault();
	evt.dataTransfer.dropEffect = "move";
}

// fonction appelee lorsqu'un robot est depose sur une case
function drop(evt) {
	if(evt.preventDefault) { evt.preventDefault(); }
    if(evt.stopPropagation) { evt.stopPropagation(); }
	var selection = getRobotSelectionne();
	deplacerRobot(selection, evt.target);
	
	return false;
}

// suppression des evenements clic sur les cases de destination du robot selectionne
function supprimerClicDestinations() {
	var L = document.querySelectorAll('#plateau .destination');
	for (var i = 0; i < L.length; i++) {
		L[i].removeEventListener('mousedown', clicDestination);
		L[i].removeEventListener('touchstart', clicDestination);
		L[i].removeEventListener('dragover',dragOverEnter);
		L[i].removeEventListener('dragenter',dragOverEnter);
		L[i].removeEventListener('drop',drop);
	}
}

// ajout des evenements clic sur les cases de destination du robot selectionne
function ajouterClicDestinations() {
	var L = document.querySelectorAll('#plateau .destination');
	for (var i = 0; i < L.length; i++) {
		L[i].addEventListener('mousedown', clicDestination);
		L[i].addEventListener('touchstart', clicDestination);
		L[i].addEventListener('dragover',dragOverEnter);
		L[i].addEventListener('dragenter',dragOverEnter);
		L[i].addEventListener('drop',drop);
	}
}

// selection du prochain robot disponible pour etre deplace (touche espace)
function selectionnerRobotSuivant() {
	var L = document.querySelectorAll('#plateau .robot:not(.deplace), #plateau .robot.dernier-deplace');
	var selection = getRobotSelectionne();
	if (selection != null) {
		var index = Array.prototype.indexOf.call(L, selection);
		var prochainIndex = (index + 1) % L.length;
		selectionnerRobot(L[prochainIndex]);
	} else {
		selectionnerRobot(L[0]);
	}
}

// deplacer un robot dans une direction donnee (touches directionnelles)
function deplacerRobotDirection(direction) {
	var selection = getRobotSelectionne();
	var destination = document.querySelector('#plateau .destination-' + direction);
	if (selection != null && destination != null) {
		deplacerRobot(selection, destination);
	}
}

// fonction appelee lors de l'appui sur une touche du clavier
function appuiTouche(e) {
	switch (e.keyCode || e.charCode) {
		case 27: // echap
		recommencer();
		e.preventDefault();
		break;
	
		case 32: // espace
		selectionnerRobotSuivant();
		e.preventDefault();
		break;
		
		case 37: // gauche
		deplacerRobotDirection('g');
		e.preventDefault();
		break;
		
		case 38: // haut
		deplacerRobotDirection('h');
		e.preventDefault();
		break;
		
		case 40: // bas
		deplacerRobotDirection('b');
		e.preventDefault();
		break;
		
		case 39: // droite
		deplacerRobotDirection('d');
		e.preventDefault();
		break;
	}
}

// ajoute l'evenement touche appuyee
function ajouterTouches() {
	document.addEventListener('keydown', appuiTouche);
}

// supprime l'evenement touche appuyee
function supprimerTouches() {
	document.removeEventListener('keydown', appuiTouche);
}

// ajoute les evenements swipe sur le plateau
function ajouterSwipe() {
	var table = document.getElementById('plateau');
	util.addSwipe(table, 'u', function() {
		alert('swipe u');
	});
	util.addSwipe(table, 'l', function() {
		alert('swipe l');
	});
	util.addSwipe(table, 'd', function() {
		alert('swipe d');
	});
	util.addSwipe(table, 'r', function() {
		alert('swipe r');
	});
}

// supprime les evenements swipe
function supprimerSwipe() {
	var table = document.getElementById('plateau');
	util.removeSwipe(table, 'u');
	util.removeSwipe(table, 'l');
	util.removeSwipe(table, 'd');
	util.removeSwipe(table, 'r');
}

// reinitialise les positions initiales des robots
function reinitialiserRobots() {
	var L = document.querySelectorAll('#plateau .robot');
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

// recommencer la partie
function recommencer() {
	proposition.length = 0;
	masquerCasesAccessibles();
	supprimerTraces();
	reinitialiserRobots();
	supprimerClicRobots();
	supprimerClicDestinations();
	supprimerTouches();
	ajouterClicRobots();
	ajouterTouches();
}

// renvoie le nombre de mouvements pour une proposition donnee
function getNombreMouvements(proposition) {
	return proposition.filter(function(p) {
		return p.command == 'move';
	}).length;
}

// affiche le score d'une solution donnee
function afficherScore(solution) {
	var scoreElement = document.querySelector('#lesParticipants li[data-nom="' + solution.player + '"] .score');
	var score = getNombreMouvements(solution.proposition);
	scoreElement.innerHTML = '(' + score + ' mouvements)';
	scoreElement.setAttribute('data-score', score);
}

// affiche le gagnant de la partie
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


