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

/*  Desc:
      Since the value of one element's class may be seperated by \n or \t,
      this function makes sure the class value is seperated by " " only
    Arg:
      <STR|ELM> target = element or value of one element's class
    Return:
      @ OK: <STR> The string value of class attribute which is definitely seperated by " "
      @ No class to trim: null
*/
function trimClass(target) {
  
  var c = "";
  
  if (browserCompat.js::isHTMLElem(target)) {
    c = elem.getAttribute("class") || "";
  } else if (browserCompat.js::isStr(target)) {
    c = target;
  }
  
  return c !== ""
         ? c.replace(/[\n\t]/g, " ")
         : null;
}

/*	Desc: Find out if the specified CSS classes exist in the target element's className attribute
    Arg:
      <STR|ELM> target = the test target, could be the dom element or the value of dom element class attribute
      <STR|ARR> className = classes to test in a string seperated by " " or in an array
    Return:
      @ Having all className being tested : true
      @ Otherwise: false
*/
function hasClass(target, className) {
  
  var classes = trimClass(target);
    
  if (classes) {
    
    className = browserCompat.js::isStr(className) ? className.split(" ") : className;
    
    if (browserCompat.js::isArr(className)) {
      
      var i, c, has;
      
      classes = " " + classes + " ";      
			
			for (i = className.length - 1; i >= 0 ; --i) {
        
        c = className[i];
        
				if (browserCompat.js::isStr(c)) {
          
          c = " " + c + " ";
          
          has = classes.search(c);
          
          if (!has) break;
				}
			}
    }
  }
  
  return has;
}

/*	Desc: Add some CSS classes into one element's className attribute. If already exist, then no op.
    Arg:
      <ELM> elem = the target element which is being added classes
      <STR|ARR> newClasses = the new classes to add, if multiple, seperated by " " or put in an array
    Return:
      @ OK: <ARR> the newly added classes in an array
      @ NG: false
*/
function addClass(elem, newClasses) {
  
  var addeds = [];
  
  newClasses = browserCompat.js::isStr(newClasses) ? newClasses.split(" ") : newClasses;
  
  if (browserCompat.js::isArr(newClasses) && browserCompat.js::isHTMLElem(elem)) {
    
    var i, c, classes = trimClass(elem);
    
    for (i = newClasses.length - 1; i >= 0 ; --i) {
      
      c = newClasses[i];
      
      if (browserCompat.js::isStr(c)) {
        
        if (!hasClass(classes, c)) {
          
          classes += " " + c;
          
          addeds.push(c);
        }
      }
    }
  }

  if (addeds.length > 0) {
    
    elem.setAttribute("class", classes.trim());
    
    return addeds;
  }
  return false;
}

/*	Desc: Remove some CSS classes from one element's className attribute. If not exist, then no op.
    Arg:
      <ELM> elem = the target element whose classes are being removed
      <STR|ARR> className = the classes to remove, if multiple, seperated by " " or put in an array
    Return:
      @ OK: <ARR> the removed classes in an array
      @ NG: false
*/
function removeClass(elem, className) {

  var removeds = [];

  className = browserCompat.js::isStr(className) ? className.split(" ") : className;
  
  if (browserCompat.js::isArr(className) && browserCompat.js::isHTMLElem(elem)) {
    
    var classes = trimClass(elem);
    
    if (classes) {
      
      var i, c, classes = trimClass(elem);
      
      for (i = className.length - 1; i >= 0 ; --i) {
      
        c = className[i];
        
        if (hasClass(classes, c)) {
          
          classes = classes.replace(" " + c + " ", " ");
          
          removeds.push(c);
        }
      }
    }
  }
  
  if (removeds.length > 0) {
      
    elem.setAttribute("class", classes.trim());
    
    return removeds;
  }
  return false;
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
   *      <STR> method = "post" | "get"
   *      <STR> url = the target url of the scsvr
   *      <STR> data = the arguments and data to pass to the scsvr
   *      <FN> [okCallback] = the callback to call in asycn mode when succeeding. The 1st ar would be the response
   *      <FN> [errCallback] = the callback to call in asycn mode when failing. The 1st arg would be an Error obj with error reason
   *      <OBJ> [configs] = {
   *               <BOO> [async] = true (default) | false; use the asynchronous request or not
   *               <BOO> [useXML] = true | false; use the xhr.reponseXML instead of hr.reponseText
   *            }
   *   Return:
   *      > For the async mode:
   *          No return but call the okCallback or errCallback
   *      > For the sync mode :
   *          @ OK: <STR> the xhr response
   *          @ NG (including the unknow method): <Error> an Error obj with error reason 
   */
  send : function (method, url, data, okCallback, errCallback, configs) {
  
    var async,  xhr = this.getXHR();    
    
    if (typeof okCallback !== "function") okCallback = function () {};
    if (typeof errCallback !== "function") errCallback = function () {};
    
    if (!(configs instanceof Object)) configs = {};    
    async = (configs.async === false) ? false : true;
    
    if (async === true) { // Handle the response and register the callbacks for the asynchronous request    
      
      xhr.onreadystatechange = function () {
        
        try {

          if (xhr.readyState == 4) {
            
            if (xhr.status == 200) {
              
              var response = configs.useXML ? xhr.responseXML : xhr.responseText;
              
              okCallback(response);
              
            } else if (400 <= xhr.status && xhr.status < 600) {
              
              errCallback(new Error("HTTP status : " + xhr.status));
              
            } else {
              // IE will return a status 12000+ on some sort of connection failure,
              // so we return a blank error
              // http://msdn.microsoft.com/en-us/library/aa383770%28VS.85%29.aspx
              callback(new Error("Unknown IE error"));            
            }            
          }
          
        } catch (e) {
          // Firefox may error out while accessing the request members if there is a network error
          // https://github.com/jquery/jquery/blob/a938d7b1282fc0e5c52502c225ae8f0cef219f0a/src/ajax/xhr.js#L111
           errCallback(e);
        }
      }      
    }
    
    try {  // Send the xhr
      switch (method.toLowerCase()) {
      
        case "get":
            url = url + "?" + data;
            data = null;
            xhr.open(method, url, async);
        break;
        
        case "post":
            xhr.open(method, url, async);
            xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
        break;
        
        default:
          var e = new Error("Unknown method " + method);
          if (async) {
            errCallback(e);
            return;
          }
          return e;
      }
      xhr.send(data);
      
    } catch (e) { // Sending using the normal xmlhttprequest object didn't work, try XDomainRequest
    
      if (async && typeof XDomainRequest == "function") {
        
        try {
        
          xhr = new XDomainRequest();
          
          xhr.onprogress = function() {};
          
          xhr.ontimeout = function() {
            callback(new Error("XDomainRequest timeout"));
          };
          
          xhr.onerror = function() {
            callback(new Error("XDomainRequest error"));
          };
          
          xhr.onload= function(args) {
            okCallback(xhr.responseText);
          };
          
          xhr.open(method, url);
          
          xhr.send(data);
          
        catch (err) {
          errCallback(err);
        }
      } else {
        
        return new Error(e);
      }
    }

    // To handle the synchronous request
    if (async === false) {
      if (xhr.readyState == 4 && xhr.status == 200) {
        return configs.useXML ? xhr.responseXML : xhr.responseText;
      } else { 
        return new Error("HTTP status : " + xhr.status);
      }
    }
  },

  /*   Arg: refer to this.sendXHR
   *   Return: refer to the sync mode of this.sendXHR.
  */
  sendSync : function (method, url, data, configs) {
    
    if (!(configs instanceof Object)) configs = {};
    
    configs.async = false;
    
    return this.send(method, url, data, null, null, configs);
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
