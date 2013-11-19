var util = {

	getClasses: function(element) {
		return element.className.split(' ');
	},

	hasClass: function(element, class_) {
		return this.getClasses(element).indexOf(class_) != -1;
	},

	addClass: function(element, class_) {
		var classes = this.getClasses(element);
		if (!this.hasClass(element, class_)) {
			classes.push(class_);
			element.className = classes.join(' ');
		}
	},

	removeClass: function(element, class_) {
		var classes = this.getClasses(element);
		var index = classes.indexOf(class_);
		if (index != -1) {
			classes.splice(index, 1);
			element.className = classes.join(' ');
		}
	},
	
	detach: function(element) {
		element.parentNode.removeChild(element);
	},
	
	moveTo: function(element, newParent) {
		this.detach(element);
		newParent.appendChild(element);
	}

};


