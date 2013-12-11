var util = {

	// renvoie si le touch est disponible
	isTouchDevice: function() {
		return 'ontouchstart' in document.documentElement;
	},
	
	// ajoute la class 'touch' sur le body si le touch est disponible
	detectTouch: function() {
		if (this.isTouchDevice()) {
			this.addClass(document.body, 'touch');
		}
	},

	// renvoie les classes d'un element
	getClasses: function(element) {
		return element.className.split(' ');
	},

	// renvoie si un element a une classe donnee
	hasClass: function(element, class_) {
		return this.getClasses(element).indexOf(class_) != -1;
	},

	// ajoute une classe a un element
	addClass: function(element, class_) {
		var classes = this.getClasses(element);
		if (!this.hasClass(element, class_)) {
			classes.push(class_);
			element.className = classes.join(' ');
		}
	},

	// supprime une classe d'un element
	removeClass: function(element, class_) {
		var classes = this.getClasses(element);
		var index = classes.indexOf(class_);
		if (index != -1) {
			classes.splice(index, 1);
			element.className = classes.join(' ');
		}
	},
	
	// gestion des evenements swipe
	swipeEvents: {},
	
	// ajoute un evenement swipe 'l', 'r', 'u' ou 'd'
	addSwipe: function(element, direction, callback) {
		(function() {
			var startX, startY;
			
			var touchStart = function(e) {
				startX = e.pageX;
				startY = e.pageY;
				e.preventDefault();
			};
			element.addEventListener('touchstart', touchStart);
			
			var touchMove = function(e) {
				e.preventDefault();
			};
			element.addEventListener('touchmove', touchMove);
			
			var touchEnd = function(e) {
				var x = e.pageX;
				var y = e.pageY;
				
				var diffX = x - startX;
				var diffY = y - startY;
				
				var d;
				if (diffX * diffX + diffY * diffY > 5 * 5) {
					if (Math.abs(diffX) > Math.abs(diffY)) {
						if (diffX < 0) {
							d = 'l';
						} else {
							d = 'r';
						}
					} else {
						if (diffY < 0) {
							d = 'u';
						} else {
							d = 'd';
						}
					}
				}
				if (d == direction) {
					callback();
				}
			};
			element.addEventListener('touchend', touchEnd);
			
			var callbacks = {
				touchStart: touchStart,
				touchMove:  touchMove,
				touchEnd:   touchEnd
			};
			
			util.swipeEvents[element] = this.swipeEvents[element] || {};
			util.swipeEvents[element][direction] = callbacks;
		})();
	},
	
	// supprime un evenements swipe
	removeSwipe: function(element, direction) {
		var callbacks = this.swipeEvents[element][direction];
		element.removeEventListener('touchstart', callbacks.touchStart);
		element.removeEventListener('touchmove',  callbacks.touchMove);
		element.removeEventListener('touchend',   callbacks.touchEnd);
		delete this.swipeEvents[element][direction];
	},
	
	// retire un element de l'arbre html sans le supprimer
	detach: function(element) {
		element.parentNode.removeChild(element);
	},
	
	// deplace un element vers un nouveau parent
	moveTo: function(element, newParent) {
		this.detach(element);
		newParent.appendChild(element);
	},
	
	// retourne si le navigateur est chrome pour la trace
	isChrome: function() {
		return navigator.userAgent.toLowerCase().indexOf('chrome') > -1;
	}

};


