/*  Func:
 *		Operate the cookies
 *  Methods:
 *      Public:
 *      > set : Set the cookie
 *      > get :  Get the specified cookie value
 *      > list : List all the cookies in the obj of { name : value, ... }
 *		> remove : Delete the cookie
 */
var cookies = {
    /*  Arg:
     *      <STR> name = the cookie name
     *      <STR|NUM> value = the cookie value
     *      <NUM> [expires] = the days of the cookie's life
     *      <STR> [path] = a path that must exist in the requested resource
	 *		<STR> [domain] = the domain
     *      <BOO> [secure] = true | false; transmitted over secure protocol as https or not
     *  Return:
	 *		@ OK: true
	 *		@ NG: false
     */
    set : function (name, value, expires, path, domain, secure) {
		
		if (typeof name != "string" || (typeof value != "string" && typeof value != "number")) {
			return false;
		}
	
        var cookie = encodeURIComponent(name) + "=" + encodeURIComponent(value);
        
        if (typeof expires === "number") {
            var expdate = new Date();
            expdate.setDate(expdate.getDate() + expires);
            cookie += ";expires=" + expdate.toUTCString();
        }
        
        if (typeof path == "string") {
			cookie += ";path=" + path;
		}
        
        if (typeof domain === "string") {
            cookie += ";domain=" + domain;
        }
        
        if (secure === true) {
            cookie += ";secure";
        }
        
        document.cookie = cookie;
        return true;
    },
    /*  Arg:
     *      <STR> name = the cookie name
     *  Return:
     *      @ Find: <STR> the cookie value
     *      @ Find nothing: null
     */
    get : function (name) {
        var value = null,
		    cookies = this.list();
		if (cookies instanceof Object) { 
			value = cookies[name] ? cookies[name] : null;
		}
        return value;
    },
    /*  Arg: n/a
     *  Return:
     *      @ OK: <OBJ> a object with the cookie name as key and the cookie value as value
     *      @ No cookie: null
     */
    list : function () {
        var cookies = null;
        
		if (document.cookie) {
			var i, 
				tmpCookie,
				cookie_array = document.cookie.split(";"),
				trim = function (str) {
					str = str.replace(/^\s\s*/, '');
					var ws = /\s/,
						i = str.length;
					while (ws.test(str.charAt(--i)));
					return str.slice(0, i + 1);
				};
			
            cookies = {};			
            for (i = 0; i < cookie_array.length; i++) {
                tmpCookie = cookie_array[i].split("=");
				tmpCookie[0] = decodeURIComponent(trim(tmpCookie[0]));
				tmpCookie[1] = decodeURIComponent(trim(tmpCookie[1]));
                cookies[tmpCookie[0]] = tmpCookie[1];
            }
		}
		
        return cookies;
    },
	/*	Arg:
	*		<STR> name = the name of cookie to delete
     *      <STR> [path] = a path that must exist in the requested resource
	 *		<STR> [domain] = the domain
	*	Return: n/a
	*/
	remove : function (name, path, domain) {
		this.set(name, "", -365, path, domain);
	}
};
