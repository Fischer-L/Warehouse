/**
 * Stuff that are often used
 *
 */
 
/*	Func:
		Format string. Fox example, formaStr("{0} can {1}.", "Bird", "fly") returns "Bird can fly"
	Arg:
		<STR> The 1st arg is the base string to format
		<STR|NUM> The rest of args are values supplied into the base string
	Return:
		<STR> The formatted string
*/
formaStr = function () { // From : http://jsfiddle.net/joquery/9KYaQ/

	// The string containing the format items (e.g. "{0}")
	// will and always has to be the first argument.
	var theString = arguments[0];
	
	// start with the second argument (i = 1)
	for (var i = 1; i < arguments.length; i++) {
		// "gm" = RegEx options for Global search (more than one instance)
		// and for Multiline search
		var regEx = new RegExp("\\{" + (i - 1) + "\\}", "gm");
		theString = theString.replace(regEx, arguments[i]);
	}
	
	return theString;
};

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

/*	Method:
		[ Public ]
       		> send : function (method, url, data, okCallback, errCallback, useXML, async) : Send a xhr, default is asynchronous
       		> sendSync : function (method, url, data, useXML) : Send a synchronous xhr.
*/
var xhr = (function () {
return {    
   /*   Arg:
    *       <STR> method = "post" | "get"
    *       <STR> url = the target url of the scsvr
    *       <STR> data = the arguments and data to pass to the scsvr
    *       <FN> [okCallback] = the callback to call when succeeding
    *       <FN> [errCallback] = the callback to call when failing
    *       <BOO> [useXML] = true | false; use the xhr.reponseXML instead of hr.reponseText
    *       <BOO> [async] (default: true) = true | false; use the asynchronous request or not
    *   Return:
    *       >   For the async mode :
    *            -  OK: true by default | depending on the okCallback
    *            -  NG(including the unknow method): false by default | denpending on the errCallback
    *       >   For the sync mode :
    *            -  OK: the xhr response
    *            -  NG(including the unknow method): false
    */
    send : function (method, url, data, okCallback, errCallback, useXML, async) {
        // Innitailize the Ajax request first
        var xhr = window.XMLHttpRequest ? new XMLHttpRequest() : new ActiveXObject("Microsoft.XMLHTTP");
        async = (async === false) ? false : true;
		
        // Register the callbacks for the asynchronous request
        if (async === true) {
            okCallback = (typeof okCallback === "function") ? okCallback : 
					function (response) { return true; } // If no okCallback inputed, take the stadard function.
            errCallback = (typeof errCallback === "function") ? errCallback :
                    function () { return false; } // The same reason as the okCallback above
            
            xhr.onreadystatechange = function () {
                if (xhr.readyState == 4) {
                    if (xhr.status == 200) {
						var response = (useXML) ? xhr.responseXML : xhr.responseText;
						return okCallback(response);
                    } else { return errCallback(); }
                }
            }
        }
        // Send the xhr
        switch (method.toLowerCase() ) {
            case "get":
                url = url + "?" + data;
                data = null;
                xhr.open(method, url, async);
            break;
            case "post":
                xhr.open(method, url, async);
                xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
            break;
            default: return false;
        }
        xhr.send(data);
        
        // To handle the synchronous request
        if (async === false) {
            if (xhr.readyState == 4 && xhr.status == 200) {
				return (useXML) ? xhr.responseXML : xhr.responseText;
            } else { return false; }
        }
   },
   
   /*   Arg: refer to this.sendXHR
    *   Return: refer to the sync mode of this.sendXHR.
    */
   sendSync : function (method, url, data, useXML) {
        return this.sendXHR(method, url, data, null, null, useXML, false);
    }
}}());
