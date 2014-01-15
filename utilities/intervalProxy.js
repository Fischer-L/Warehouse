/*	Func:
		The calls to the setInterval function may bring impacts(refer to http://stackoverflow.com/questions/729921/settimeout-or-setinterval), so basically calling the setTimeout is much "polite".
		Here creating one interval-setting proxy to mimic the setInterval calls with the setTimeout function.
	Properties:
		[ Private ]
		<OBJ> _tasks = the table storing the interval tasks
	Methods:
		[ Public ]
		> exist : Find if the task has been set
		> set: Set one task to execute periodically, like the call to the setInterval
		> clear : Clear one task, like call to the clearInterval
*/
var intervalProxy = (function () {
		/*	Properties:
				[ Public ]
				<NUM> length = the number of the task packages
				<OBJ> The task packages = {
						<NUM> handle = the handle of the setTimeout,
						<FN> task = the task to run every millisec,
						<NUM> ms = the time interval in millisec
						<FN> proxy = the recursive function achieves the interval tasking
					}
		*/
		var _tasks = {};
			_tasks.length = 0;
	
	return {
		
		/*   Arg:
		        <NUM> tHandle = the handle to the interval task
		     Return:
		        @ Find the task: true
		        @ Find nothing: false
		*/
		exist : function (tHandle) {
			return !!_tasks[tHandle];
		},
		
		/*   Arg:
		        <FN> task = a task(funciton) to do
		        <NUM> millisec = the time interval in milliseconds
		     Return:
		        @ OK: <NUM> The handle to the interval task. Use it to clear the interval task.
		        @ NG: false
		*/
		set : function (task, millisec) {
			if (typeof task === "function" && typeof millisec == "number" && millisec > 0) {
				
				var tHandle = _tasks.length;
				
				_tasks[tHandle] = {
					handle : undefined,
					ms : millisec,
					task : task,
					proxy : function () {
					
						var that = this;
						
						that.task();
						
						// Here use the recursive solution to achieve the interval tasking with the setTimeout function, instead of the setInterval function 
						that.handle = setTimeout(
							function () { that.proxy.call(that); },
							that.ms
						);
					}
				};
				
				// Why take the parent obj as the 1st arg is becasue "this" would point to the Window in the setTimeout function. We got to take this work around to remember it.
				_tasks[tHandle].handle = setTimeout(
					function () { _tasks[tHandle].proxy.call(_tasks[tHandle]); },
					_tasks[tHandle].ms
				);
				
				_tasks.length++;
				
				return tHandle;
			}
			return false;
		},
		
		/*	Arg:
				<NUM> tHandle = the handle to the interval task
			Return:
		        @ OK: true
		        @ Nothing to clear: false
		*/
		clear : function (tHandle) {
			if (this.exist(tHandle) ) { 
				clearTimeout(_tasks[tHandle].handle);
				_tasks[tHandle] = null;
				delete _tasks[tHandle];
				return true;
			}
			return false;
		}
}}());
