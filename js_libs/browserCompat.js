/**
 * The codes dealing with browsers
 *
 */
 
/*  Func: Get the version of IE
	Return:
		@ Is IE: <NUM> the version of IE
		@ Not IE: NaN
*/
function getIEVersion() {
	var rv = -1; // Return value assumes failure.
	if (navigator.appName == 'Microsoft Internet Explorer') {
		var ua = navigator.userAgent;
		var re = new RegExp("MSIE ([0-9]{1,}[\.0-9]{0,})");
		if (re.exec(ua) != null) {
			rv = +(RegExp.$1);
		}
	}
	return (rv === -1) ? NaN : rv;
}

/*	Func: Get the windows's width and height
	Return: {
		<NUM> windowWidth : the width of the client window in px. If unable to find, then -1.
		<NUM> windowHeight : the height of the client window in px. If unable to find, then -1.
	}
*/
function getWindowWH() {
		
	if(window.innerWidth) {
	
		return {
			windowWidth : window.innerWidth,
			windowHeight: window.innerHeight
		};
		
	} else if (document.documentElement.offsetHeight) {
	
		return {
			windowWidth : document.documentElement.offsetWidth, 
			windowHeight : document.documentElement.offsetHeight
		};
		
	} else if (document.body.offsetHeight) {
	
		return {
			windowWidth : document.body.offsetWidth, 
			windowHeight : document.body.offsetHeight
		};
		
	} else if (document.documentElement.clientHeight) {
	
		return {
			windowWidth : document.documentElement.clientWidth, 
			windowHeight : document.documentElement.clientHeight
		};
		
	} else if (document.body.clientHeight) {
	
		return {
			windowWidth : document.body.clientWidth, 
			windowHeight : document.body.clientHeight
		};
		
	}
	
	return {
		windowWidth : -1,
		windowHeight: -1
	};
}

/*	Func:
		Get the document's scrolling info
	Retunr:
		<OBJ> {
			<NUM> top, left, width, height: the document's scrolling top/left/height/width info
		}
*/		
function getDocScrollInfo () {
	var top = left = width = height = 0;
	
	if (document.documentElement && document.documentElement.scrollTop) {
		top = document.documentElement.scrollTop;
		left = document.documentElement.scrollLeft;
		width = document.documentElement.scrollWidth;
		height = document.documentElement.scrollHeight;
	} else if (document.body) {
		top = document.body.scrollTop;
		left = document.body.scrollLeft;
		width = document.body.scrollWidth;
		height = document.body.scrollHeight;
	}
	
	return { top : top, left : left, width : width, height : height };
}

/*	Func:
		Get the computed style value
	Arg:
		<ELM> elem = the DOM elem
		<STR> name = the style name
	Return:
		@ OK: <STR> the computed style
		@ NG: null
*/
function getComputedStyle(elem, name) {
	var v = null;

	if (window.getComputedStyle) {

		v = window.getComputedStyle(elem)[name] || null;

	} else if (elem.currentStyle) { // Hack for IE...Reference from the jQuery

		v = elem.currentStyle && elem.currentStyle[name]

		var left,
			rsLeft,
			style = elem.style;

		// Avoid setting v to empty string here
		// so we don't default to auto
		if ( v == null && style && style[name] ) {
			v = style[ name ];
		}

		// From the awesome hack by Dean Edwards
		// http://erik.eae.net/archives/2007/07/27/18.54.15/#comment-102291

		// If we're not dealing with a regular pixel number
		// but a number that has a weird ending, we need to convert it to pixels
		// but not position css attributes, as those are proportional to the parent element instead
		// and we can't measure the parent instead because it might trigger a "stacking dolls" problem

		// Remember the original values
		left = style.left;
		rsLeft = elem.runtimeStyle && elem.runtimeStyle.left;

		// Put in the new values to get a computed value out
		if ( rsLeft ) {
			elem.runtimeStyle.left = elem.currentStyle.left;
		}
		style.left = name === "fontSize" ? "1em" : v;
		v = style.pixelLeft + "px";

		// Revert the changed values
		style.left = left;
		if ( rsLeft ) {
			elem.runtimeStyle.left = rsLeft;
		}

	}

	return v;
}

/*	Func:
		From John Resig.
		Mitigate the differences of the event obj between browsers. Use this function in the event handler.
	Arg:
		<OBJ> event = the event obj
	Return:
		<OBJ> the normalized event obj
*/
function normalizeEvt(event) {

	function returnTrue() { return true; } 	
	function returnFalse() { return false; }
	
	if (!event || !event.stopPropagation) {
	
		var old = event || window.event;
		
		// Clone the old object so that we can modify the values
		event = {};
		for (var prop in old) { 
			event[prop] = old[prop];
		}
		
		// The event occurred on this element
		if (!event.target) {
			event.target = event.srcElement || document;
		}
		
		// Handle which other element the event is related to
		event.relatedTarget = event.fromElement === event.target ?
		event.toElement :
		event.fromElement;
		
		// Stop the default browser action
		if (!event.preventDefault) {
		
			event.preventDefault = function () {
				
				event.returnValue = false; // Support IE
				
				event.defaultPrevented = true;
				
				return false; // Mimic the legacy approach
			}
			
			event.defaultPrevented = false;
		}
			
		// Stop the event from bubbling
		if (!event.stopPropagation) {
			
			event.stopPropagation = function () {
				event.cancelBubble = true; // Support IE
			}
		}
		
		// Stop the event from bubbling and executing other handlers
		if (!event.stopImmediatePropagation) {
			
			event.stopImmediatePropagation = function () {
				// This mediation method only can stop from propagating further on but can't stop listeners attached to the same element for the same event type
				// However this is the best we can go for.
				// If we wanted one "real" solution, we would have to make a huge modification on the DOM event(start from add/removeEventListener).
				// And a huge modification is not what we want here.
				event.stopPropagation();
			}
		}
		
		// Handle mouse position
		if (event.clientX != null) {
		
			var doc = document.documentElement, body = document.body;
			
			event.pageX = event.clientX +
						  (doc && doc.scrollLeft || body && body.scrollLeft || 0) -
						  (doc && doc.clientLeft || body && body.clientLeft || 0);
			event.pageY = event.clientY +
						  (doc && doc.scrollTop || body && body.scrollTop || 0) -
						  (doc && doc.clientTop || body && body.clientTop || 0);
		}
		
		// Handle key presses
		event.which = event.charCode || event.keyCode;
		
		// Fix button for mouse clicks:
		// 0 == left; 1 == middle; 2 == right
		if (event.button != null) {
			event.button =  event.button & 1 ?
							0 : event.button & 4 ?
							1 : event.button & 2 ? 
							2 : 0;
		}
	}
	
	return event; 
}

/*	Func: Mitigate the addEventListener & attachEvent methods
	Arg:
		<ELM> elem = the DOM elem into which the event is being added
		<STR> evt = the event name, as per the normal addEventListener method
		<FN> eHandle = the event handle
	Return:
		<FN> The handle to the event handler (Use this for removing event).
*/
function addEvt(elem, evt, eHandle) {

	function proxyHandle(e) {
		return eHandle.call(elem, normalizeEvt(e)); // Utilize the Warehouse.utilities.browserCompat.normalizeEvt
	};
	
	if (elem.addEventListener) {
		elem.addEventListener(evt, proxyHandle);
	} else if (elem.attachEvent) { // The IE 8 case
		elem.attachEvent("on" + evt, proxyHandle);
	}
	
	return proxyHandle;
}

/*	Func: Mitigate the removeEventListener & detachEvent methods
	Arg: Refer to addEvt
*/
function rmEvent(elem, evt, eHandle) {
	if (elem.removeEventListener) {
		elem.removeEventListener(evt, eHandle);
	} else if (elem.detachEvent) { // The IE 8 case
		elem.detachEvent("on" + evt, eHandle);
	}
}

/*	Func:
		Strictly compare two variables
	Arg:
		<*> a, b = the variable to compare
	Return:
		@ Equal: true
		@ Not equal: false
*/
function is(a, b) { // Ref : React.js

	// NaN
	if (a !== a) return b !== b;
	
	// +-0
	if (a === 0 && b === 0) return 1/a === 1/b;
	
	return a === b;
}

/*	Arg:
		<*> v = the value to test
	Return:
		@ OK: true
		@ NG: false
*/
function isStr(v) {
	return (typeof v === "string") || (v instanceof String);
}

/*	Func:
		This is to check if value could be used as number so values like "1" or " 3.14" would be valid in checking
	Arg:
		<*> v = the value to test
	Return:
		@ OK: true
		@ NG: false
*/
function isNum(v) {
	return !isNaN(parseFloat(v)) && isFinite(v);
}

/*	Arg:
		<*> target = the target to test
	Return:
		@ OK: true
		@ NG: false
*/
function isFunc(target) {
	return (typeof target == "function");
}

/*	Arg:
		<*> target = the target to test
	Return:
		@ OK: true
		@ NG: false
*/		
function isObj(target) {
	return (target instanceof Object);
}

/*	Arg:
		<*> target = the target to test
	Return:
		@ OK: true (text node is counted as well)
		@ NG: false
*/		
function isHTMLElem(target) {
	return (   target
			&& typeof target == "object"
			&& typeof target.nodeType == "number"
			&& (target.nodeType === 1 || target.nodeType === 3)
		   );
}

/*	Arg:
		<*> target = the target to test
	Return:
		@ OK: true
		@ NG: false
*/	
function isArr(target) {
	return (target instanceof Array);
}

/*	Arg:
		<*> target = the target to test
	Return:
		@ OK: true
		@ NG: false
*/	
function isDate(target) {
	return (target instanceof Date);
}

/*
 * The prototype chain
 */
if(!Array.prototype.forEach){Array.prototype.forEach=function(callback,thisArg){var T,k;if(this==null){throw new TypeError(" this is null or not defined");}var O=Object(this);var len=O.length>>>0;if(typeof callback!=="function"){throw new TypeError(callback+" is not a function");}if(thisArg){T=thisArg}k=0;while(k<len){var kValue;if(k in O){kValue=O[k];callback.call(T,kValue,k,O)}k++}}}
if(!Array.prototype.indexOf){Array.prototype.indexOf=function(searchElement,fromIndex){if(this===undefined||this===null){throw new TypeError('"this" is null or not defined');}var length=this.length>>>0;fromIndex=+fromIndex||0;if(Math.abs(fromIndex)===Infinity){fromIndex=0}if(fromIndex<0){fromIndex+=length;if(fromIndex<0){fromIndex=0}}for(;fromIndex<length;fromIndex++){if(this[fromIndex]===searchElement){return fromIndex}}return-1}}
if (!String.prototype.trim) {String.prototype.trim=function(){var ws=/\s/,str=this.replace(/^\s\s*/,''),i=str.length;while(ws.test(str.charAt(--i)));return str.slice(0,i+1);}}
 
