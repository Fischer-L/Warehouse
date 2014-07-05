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
		<NUM> windowWidth : the width of the client window in px. If uable to find, then -1.
		<NUM> windowHeight : the height of the client window in px. If uable to find, then -1.
	}
*/
function getWindowWH() {
	if(window.innerWidth) {
		return {windowWidth : window.innerWidth, windowHeight: window.innerHeight};
	} else if(document.documentElement.clientHeight) {
		return {windowWidth : document.documentElement.clientWidth, windowHeight : document.documentElement.clientHeight};
	} else if(document.body.clientHeight) {
		return {windowWidth : document.body.clientHeight, windowHeight : document.body.clientHeight};
	} else {
		return {windowWidth : -1, windowHeight: -1};
	}
}

/*	Func: Mitigate the differences of the event obj between browsers. Use this function in the event handler.
	Arg:
		<OBJ> e = the event obj
	Return:
		<OBJ> the normalized event obj
*/
function normalizeEvt(e) {
				
	e = e || window.event;
	
	e.target = e.target || e.srcElement;
	
	if (!e.stopPropoagation) {
		e.stopPropoagation = function () {
			this.cancelBubble = true;
		}
	}
	
	if (!e.preventDefault) {
		e.preventDefault = function () {
			this.returnValue = false;
		}
	}
	
	return e;
}

/*	Func: Mitigate the addEventListener & attachEvent methods
	Arg:
		<ELM> elem = the DOM elem into which the event is being added
		<STR> evt = the event name, as per the normal addEventListener method
		<FN> eHandle = the event handle
*/
function addEvt(elem, evt, eHandle) {
	if (elem.addEventListener) {
		elem.addEventListener(evt, eHandle);
	} else if (elem.attachEvent) { // The IE 8 case
		elem.attachEvent("on" + evt, eHandle);
	}
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


/*
 * The prototype chain
 */
if(!Array.prototype.forEach){Array.prototype.forEach=function(callback,thisArg){var T,k;if(this==null){throw new TypeError(" this is null or not defined");}var O=Object(this);var len=O.length>>>0;if(typeof callback!=="function"){throw new TypeError(callback+" is not a function");}if(thisArg){T=thisArg}k=0;while(k<len){var kValue;if(k in O){kValue=O[k];callback.call(T,kValue,k,O)}k++}}}
if(!Array.prototype.indexOf){Array.prototype.indexOf=function(searchElement,fromIndex){if(this===undefined||this===null){throw new TypeError('"this" is null or not defined');}var length=this.length>>>0;fromIndex=+fromIndex||0;if(Math.abs(fromIndex)===Infinity){fromIndex=0}if(fromIndex<0){fromIndex+=length;if(fromIndex<0){fromIndex=0}}for(;fromIndex<length;fromIndex++){if(this[fromIndex]===searchElement){return fromIndex}}return-1}}
if (!String.prototype.trim) {String.prototype.trim = function () {return this.replace(/^\s+|\s+$/g, '');};}
 