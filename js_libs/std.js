/**
 * Stuff that are often used
 *
 */

/*	Func:
		Find out if the specified CSS classes exist in the target element's className attribute
	Arg:
		<STR|ELM> target = the test target, could be the class of dom element or the dom element
		<STR|ARR> className = classes to test in a string seperated by " " or in an array
	Return:
		@ Having: true
		@ Not having: false
*/
function hasClass(target, className) {
	var has = false,
		elemClass = this.isHTMLElem(target) ? target.className : target;
	
	if (typeof elemClass == "string" && elemClass) {
		
		className = (typeof className == "string") ? className.split(" ") : className;
		
		if (className instanceof Array) {
		
			has = true;
			elemClass = " " + elemClass + " ";	
			
			for (var i = 0; i < className.length; i++) {
				if (typeof className[i] == "string") {
					if (elemClass.search(" " + className[i] + " ") < 0) {
						has = false;
						break;
					}
				}
			}
		}
	}
	return has;
}

/*	Func:
		Add some CSS classes into one element's className attribute
	Arg:
		<ELM> elem = the target element which is being added classes
		<STR|ARR> newClasseses = the new classes to add, if multiple, seperated by " " or put in an array
	Return:
		@ OK: the newly added classes in an array
		@ NG: false
*/
function addClass(elem, newClasses) {
	var addedClasses = [],
		thisClass = elem.className;
		
	newClasses = this.isStr(newClasses) ? newClasses.split(" ") : newClasses;
	
	if (this.isArr(newClasses)) {
		for (var i = 0, j = newClasses.length; i < j; i++) {
			if (!this.hasClass(thisClass, newClasses[i]) ) {
				thisClass += " " + newClasses[i];
				addedClasses.push(newClasses[i]);
			}
		}
	}
	
	if (addedClasses.length > 0) {
		elem.className = thisClass.trim();
		return addedClasses;
	} else {
		return false;
	}
}

/*	Func:
		Remove some CSS classes from one element's className attribute
	Arg:
		<ELM> elem = the target element whose classes are being removed
		<STR|ARR> classes = the classes to remove, if multiple, seperated by " " or put in an array
	Return:
		@ OK: the removed classes in an array
		@ NG: false
*/
function removeClass(elem, classes) {
	var removedClasses = [];
		thisClass = " " + elem.className + " ";
	
	classes = this.isStr(classes) ? classes.split(" ") : classes;
	
	if (this.isArr(classes)) {
		for (var i = 0, j = classes.length; i < j; i++) {
			if (this.hasClass(thisClass, classes[i]) ) {
				thisClass = thisClass.replace(" " + classes[i] + " ", " ");
				removedClasses.push(classes[i]);
			}
		}
	}

	if (removedClasses.length > 0) {
		elem.className = thisClass.trim();
		return removedClasses;
	} else {
		return false;
	}
}

/*	Func:
		Scroll the viewport to the target element
	Args:
		<ELM> target = the target element to which we want to scroll
		<NUM> duration = the duration for scrolling
*/
var scrollTo = (function () {
	
		var _timer = null,
			
			_scrollingInterval = 13,
			
			_scrollingPosFactor = (-Math.cos(p*Math.PI)/2) + 0.5;
			
		
		function _cleanTimer() {
			if (_timer !== null) {
				clearInterval(_timer);
				_timer = null;			
			}
		}
		
		function _getDocScrollInfo () {
			// Call the Warehouse.utilities.browserCompat.getDocScrollInfo
		}
		
		function _getComputedStyle(elem, name) {
			// Call the Warehouse.utilities.browserCompat.getComputedStyle
		}
		
		function _isHTMLElem(target) [
			// Call the Warehouse.utilities.browserCompat.isHTMLElem
		}
		
	return function (target, duration) {
		
		if (   !_isHTMLElem(target)
			|| typeof duration != "number"
			|| isNaN(duration)
			|| duration <= 0
		) {
			return;
		}
		
		_cleanTimer();
		
		var scroller = {};
				
		scroller.target_pos = {
			top : target.getBoundingClientRect().top - 50,
			left : target.getBoundingClientRect().left
		};		
		
		scroller.info = _getDocScrollInfo();
		
		scroller.begin_time = (new Date).getTime();
		
		scroller.step = function (){
		
			var t = (new Date).getTime(),
				p = (t - scroller.begin_time) / duration;
				
			if(p >= 1){
			
				_cleanTimer();
				
				setTimeout(
					function () {
						window.scrollTo(scroller.target_pos.left, scroller.target_pos.top);
					},
					_scrollingInterval
				);
				
			} else{
			
				window.scrollTo(
					_scrollingPosFactor * (scroller.target_pos.left - scroller.info.left) + scroller.info.left,
					_scrollingPosFactor * (scroller.target_pos.top - scroller.info.top) + scroller.info.top
				);				
			}
		}		
		
		_timer = setInterval(scroller.step, _scrollingInterval);
	}
}());