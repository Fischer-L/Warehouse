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
	var removedClasses = [],
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

/*	Properties:
		[ Private ]
		<ARR> _xhrFactories = the available XHR factories
	Method:
		[ Public ]
		> getXHR : Get the XHR obj for use
       		> send : function (method, url, data, okCallback, errCallback, useXML, async) : Send a xhr, default is asynchronous
       		> sendSync : function (method, url, data, useXML) : Send a synchronous xhr.
*/
var xhr = (function () {
	var 
	_xhrFactories = [
	    function () {return new XMLHttpRequest();},
	    function () {return new ActiveXObject("Msxml2.XMLHTTP");},
	    function () {return new ActiveXObject("Msxml3.XMLHTTP");},
	    function () {return new ActiveXObject("Microsoft.XMLHTTP");}
        ];
return {
   /*  Return:
       	      @ OK: <OBJ> the XHR obj
       	      @ NG: null
   */
   getXHR : function () {
       var xhr = null;
       
       while (_xhrFactories.length > 0) {
           try {
           	xhr = _xhrFactories[0];
           	break;
           } catch (e) {
           	_xhrFactories.shift(); // Kick out the useless factory
           }
       }
       
       return xhr;
   },
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
        var xhr = this.getXHR();
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

/*	Func:
		A master debug mode controller class.
	Properties:
		[ Private ]
		<BOO> _flag_masterDBG = the master debug flag. If being set to true or false, would override all local debug mode flags. If undefined, would allow all local debug mode controllers to take controls.
		<CLS> _cls_Local_DBG = the local debug mode controller class.
	Methods:
		[ Public ]
		<FN> newLocDBG = new one instance of this::_cls_Local_DBG
*/
var cls_Master_DBG = (function () {
	
	/*	Properties:
			[ Private ]
			<STR> __tag = the tag always prepended before logs
			<BOO> __flag_locDBG = the local debig mode flag
		Methods:
			[ Public ]
			> isDBG : Tell the debug mode
			> prependTag : prepend this::__tag before logging msg
			> test : Execute the testing behavior function if under the DBG mode
			> log, warn, error = Equal to call console.log/warn/error but only works under the debug mode on.
		-----------------------------------
		Constructor:
			Arg:
				> dbg = refer to this::__flag_locDBG
	*/
	function _cls_Local_DBG(dbg, tag) {
	
		var
		__tag = tag || null,
		__flag_locDBG = !!dbg;
		
		/*	Return:
				@ ON: true
				@ OFF: false
		*/
		this.isDBG = function () {			
			return (_flag_masterDBG === true || _flag_masterDBG === false) ? _flag_masterDBG : __flag_locDBG;
		}
		/*	Arg:
				<ARR|ARGS> the function's hidden arguments or array
			Return:
				<ARR> the new array
		*/
		this.prependTag = function (args) {
			if (!(args instanceof Array)) args = Array.prototype.slice(args);
			
			args[0] = __tag + " :: " + args[0];
		
			return args;
		}
	}		
			_cls_Local_DBG.prototype.log = function () {			
				if (this.isDBG()) return window.log.apply(window, this.prependTag(arguments));
			}
			
			_cls_Local_DBG.prototype.warn = function () {			
				if (this.isDBG()) return window.warn.apply(window, this.prependTag(arguments));
			}
			
			_cls_Local_DBG.prototype.error = function () {			
				if (this.isDBG()) return window.error.apply(window, this.prependTag(arguments));
			}
			
			_cls_Local_DBG.prototype.test = function (behavior) {			
				if (this.isDBG() && typeof behavior === "funciton") behavior();
			}
	
	var _flag_masterDBG;
	
	/*	Arg:
			> dbg = refer to this::_flag_masterDBG
	*/
	function cls_Master_DBG(dbg) {
		_flag_masterDBG = (dbg === undefined) ? undefined : !!dbg;
	}
			/*	Arg:
					> dbg = refer to this::_cls_Local_DBG
				Return:
					<OBJ> this::_cls_Local_DBG
			*/
			cls_Master_DBG.prototype.newLocDBG = function (dbg) {
				return new _cls_Local_DBG(dbg);
			}
	
	return cls_Master_DBG;			
}());
