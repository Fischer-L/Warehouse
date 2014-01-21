/*	Func:
		To build the different style clock on the canvas element
	Properties:
		[ Private ]
		<OBJ> _CONST = the table of the constants
		<OBJ> _math = the obj handling some math operation
	Nested Classes:
		[ Private ]
		> _cls_Coord: The class representing (x, y) coordinate
			* Properties:
					[ Public ]
					<NUM> x = the X axis coordinate
					<NUM> y = the Y axis coordinate
		> _cls_Drawer: The class in charge of drawing the clock on the canvas
		> _cls_Clock: The class representing the clock
	Methods:
		[ Private ]
		> _buildSwissClock: Build the swiss style clock
		[ Public ]
		> build: Build one clock on the canvas element
*/
var clockBuilder = (function () {
	
	var _CONST = {
			swissClock : "swiss",
			colorClock : "color_circles",
			electricClock : "electric_clock"
		};
	
	/*	Methods:
			[ Public ]
			> d2r: Convert the degree to the radians
			> r2d: Convert the radians to the degree
			> t2d: Convert the time to the degree in the circle
			> getCoordByRadians: Get the coordinate based on the circle's radians and radius. The origin of the cricle is (0, 0)
	*/
	var _math = {	
			/*	Arg:
					<NUM> degree = degree
				Return:
					<NUM> radians
			*/
			
			d2r : function (degree) {
				return degree * Math.PI / 180;
			},
			
			/*	Arg:
					<NUM> radians = radians
				Return:
					<NUM> degree
			*/
			r2d : function (radians) {
				return radians * 180 / Math.PI;
			},
			
			/*	Arg:
					<STR> timeBase = "hour", "minute", "second"
					<NUM> t = the time. Refer to Date instance's getHours/getMinutes/getSeconds for the valid value
				Return:
					<NUM> the degree. When the hous is 3 and the minute/second is 15, the degree is 0, and increasing clockwise.
			*/
			t2d : function (timeBase, t) {
				
				var degree = null;
				
				if (timeBase === "hour" && 0 <= t && t <= 11) {
					
					// Because the degree 0 is at the hour 3, offset the hour to take the 3 as 0
					if (t < 3) { // Special treatment for the hour below the hour 3
						t += 12;
					}
					t -= 3;
					
					degree = 30 * t;
					
				} else if (
					(timeBase === "minute" || timeBase === "second") && 0 <= t && t <= 59
				) {
					
					if (t < 15) {
						t += 60;
					}
					t -= 15;
					
					degree = 6 * t;
				}
				
				return degree;
			},
			
			/*	Arg:
					<NUM> radians = the radians
					<NUM> radius = the radius of the circle
				Return:
					<OBJ> the instance of this::_cls_Coord
			*/
			getCoordByRadians : function (radians, radius) {
				return {
					x : Math.cos(radians) * radius,
					y : Math.sin(radians) * radius
				};
			}
		};
	
	/*	Properties:
			[ Public ]
			<ELM> cvs = the canvas element on which the clock is being drawn
			<OBJ> ctx = the 2D context of this::cvs
		Methods:
			[ Public ]
			> drawTimeMarks: Draw the clock's time marks. Shall be implement by the different clock styles while instantiating.
			> drawHands: Draw the clock hands to indicating the time. Shall be implement by the different clock styles while instantiating.
			> clearAll: Clear the canvas
			> drawLine: Draw one line
			> rotateByTime: Rotate the canvas' X axis into vertical based on the current hour or minute or second
	*/
	var _cls_Drawer = function (canvas) {
		
		this.cvs = canvas;
		
		this.ctx = this.cvs.getContext("2d");
		
		this.drawTimeMarks = function () {}
		
		this.drawHands = function () {}
		
	}; {
		/*
		*/
		_cls_Drawer.prototype.clearAll = function () {
			this.ctx.clearRect(0, 0, 99999, 99999);
		}
		
		/*	Arg:
				<OBJ> srcCoord = the line's source coordinate. The instance of this::_cls_Coord
				<OBJ> dstCoord = the line's destination coordinate. The instance of this::_cls_Coord
		*/
		_cls_Drawer.prototype.drawLine = function (srcCoord, dstCoord) {
			
			this.ctx.save();
			
			this.ctx.beginPath();
			this.ctx.moveTo(srcCoord.x, srcCoord.y);
			this.ctx.lineTo(dstCoord.x, dstCoord.y);
			this.ctx.stroke();
			
			this.ctx.restore();
		}
		
		/*	Arg:
				<STR> timeBase = "hour", "minute", "second"
				<DAT> date = the time on which is based for rotating the canvas				
		*/
		_cls_Drawer.prototype.rotateByTime = function (timeBase, date) {
		
			var hh = date.getHours() % 12,
				mm = date.getMinutes(),
				ss = date.getSeconds();
				
			this.ctx.translate(this.cvs.width/2, this.cvs.height/2);
			
			switch (timeBase.toLowerCase()) {
				case "hour":			
					d = -90 // Rotate the X axis into vertical. Let the X axis be the hr hand
					  + hh * 30 // Rotate the hr hand to point to its hr indicator
					  + 30 * (mm / 60); // Rotate the hr hand a little bit more acoording the current minute
					this.ctx.rotate(_math.d2r(d));
				break;
				
				case "minute":
					d = -90 // Rotate the X axis into vertical. Let the X axis be the mm hand
					  + 6 * mm; // Rotate the mm hand to point to its mm indicator
					this.ctx.rotate(_math.d2r(d));
				break;
				
				case "second":
					d = -90 // Rotate the X axis into vertical. Let the X axis be the ss hand
					  + 6 * ss; // Rotate the ss hand to point to its ss indicator
					this.ctx.rotate(_math.d2r(d));
				break;
			}
		}
	};
	
	/*	Properties:
			[ Private ]
			<DAT> __now = the current time
			<NUM> __timer = the handle to the setInterval call
			<OBJ> __dr = the instance of this::_cls_Drawer
		Methods:
			[ Public ]
			> tick: Let the clock start ticking
			> stop: Stop the clock
	-----------------------------------------------------
		Arg:
			> drawer = the instance of this::_cls_Drawer
	*/
	var _cls_Clock = function (drawer) {
		
		var __now,
		
			__timer,
			
			__dr = drawer;
		
		/*	Arg:
				<DAT> [date] = the starting time. If not given, would now. In order to unify the hour/minute/second's value, use the Date instance to store these values. And the year/month/day value in the Date instance could be useful in the future.
		*/
		this.tick = function (date) {
			
			__now = (date instanceof Date) ? date : new Date;
			
			__timer = setInterval(function () {
				__now = new Date(__now.getTime() + 1000);
				__dr.clearAll();
				__dr.drawTimeMarks();
				__dr.drawHands(__now);				
			}, 1000);
		}
		
		/*
		*/
		this.stop = function () {
			if (__timer) {
				clearInterval(__timer);
			}
		}
		
	};
			
	/*	Arg:
			> canvas = refer to the constructor of this::_cls_Drawer
		Return:
			<OBJ> the instance of this::_cls_Clock
	*/
	var _buildSwissClock = function (canvas) {
		
		var __dr = new _cls_Drawer(canvas); {
			
			__dr.styles = {};
			__dr.styles.baseColor = "#171717";
			__dr.styles.radius = __dr.cvs.width / 2;
			__dr.styles.majorTimeMark = { // The mark which has to represent hour
				length : __dr.styles.radius * 0.22,
				lineWidth : __dr.styles.radius * 0.2 * 0.35
			};
			__dr.styles.minorTimeMark = {
				length : __dr.styles.majorTimeMark.length * 0.4,
				lineWidth : __dr.styles.majorTimeMark.lineWidth * 0.2
			};
			__dr.styles.hrHand = {
				longLen : __dr.styles.radius * 0.65,
				shortLen : __dr.styles.radius *  0.25,
				lineWidth : __dr.styles.majorTimeMark.lineWidth
			};
			__dr.styles.mmHand = {
				longLen : __dr.styles.radius - __dr.styles.minorTimeMark.length,
				shortLen : __dr.styles.hrHand.shortLen,
				lineWidth : __dr.styles.majorTimeMark.lineWidth
			};
			__dr.styles.ssHand = {
				longLen : __dr.styles.radius * 0.68,
				shortLen : __dr.styles.hrHand.shortLen * 1.32,
				lineWidth : __dr.styles.minorTimeMark.lineWidth + 1,
				circleRadius : __dr.styles.minorTimeMark.lineWidth * 5,
				color : "#e61919"
			};
			
			__dr.drawTimeMarks = function () {
				
				var i,
					d,
					r,
					srcCoord,
					dstCoord,
					lineWidth,
					strokeStyle;
					
				this.ctx.save();
				
				this.ctx.translate(this.cvs.width/2, this.cvs.height/2);
				this.ctx.strokeStyle = this.styles.baseColor;
				
				for (i = 0; i < 60; i++) {
				
					d = 6 * i;
					
					r = _math.d2r(d);
					
					if (0 === i % 5) {
						
						lineWidth = this.styles.majorTimeMark.lineWidth;
						srcCoord = _math.getCoordByRadians(r, this.styles.radius);
						dstCoord = _math.getCoordByRadians(r, this.styles.radius - this.styles.majorTimeMark.length);
						
					} else {
						
						lineWidth = this.styles.minorTimeMark.lineWidth;
						srcCoord = _math.getCoordByRadians(r, this.styles.radius);
						dstCoord = _math.getCoordByRadians(r, this.styles.radius - this.styles.minorTimeMark.length);
					}
					
					// Draw the indicators
					this.ctx.lineWidth = lineWidth;
					this.drawLine(srcCoord, dstCoord);
				}
				
				this.ctx.restore();
			}
			
			__dr.drawHands = function (date) {
				
				var srcCoord = {},
					dstCoord = {};
				
				this.ctx.save();
				
					this.rotateByTime("hour", date);
					this.ctx.lineWidth = this.styles.hrHand.lineWidth;
					this.ctx.strokeStyle = this.styles.baseColor;
					
					srcCoord.y = 0;
					srcCoord.x = this.styles.hrHand.longLen;
					dstCoord.y = 0;
					dstCoord.x = -this.styles.hrHand.shortLen;
					this.drawLine(srcCoord, dstCoord);				
					
				this.ctx.restore();	
				
				this.ctx.save();
				
					this.rotateByTime("minute", date);
					this.ctx.lineWidth = this.styles.mmHand.lineWidth;
					this.ctx.strokeStyle = this.styles.baseColor;
					
					srcCoord.y = 0;
					srcCoord.x = this.styles.mmHand.longLen;
					dstCoord.y = 0;
					dstCoord.x = -this.styles.mmHand.shortLen;
					this.drawLine(srcCoord, dstCoord);				
					
				this.ctx.restore();		
				
				this.ctx.save();
				
					this.rotateByTime("second", date);
					this.ctx.lineWidth = this.styles.ssHand.lineWidth;
					this.ctx.strokeStyle = this.ctx.fillStyle = this.styles.ssHand.color;
					
					srcCoord.y = 0;
					srcCoord.x = this.styles.ssHand.longLen;
					dstCoord.y = 0;
					dstCoord.x = -this.styles.ssHand.shortLen;
					this.drawLine(srcCoord, dstCoord);
					
					// Add one little circle in the tip of the secnod hand
					this.ctx.beginPath();
					this.ctx.arc(
						srcCoord.x,
						srcCoord.y,
						this.styles.ssHand.circleRadius,
						_math.d2r(0),
						_math.d2r(360)
					);
					this.ctx.fill();
					
					// The center points of the hands
					this.ctx.beginPath();
					this.ctx.arc(
						0,
						0,
						this.ctx.lineWidth,
						_math.d2r(0),
						_math.d2r(360)
					);
					this.ctx.fill();
					
				this.ctx.restore();	
			}			
		}
		
		return new _cls_Clock(__dr);
	};
	
	return {
		/*	Arg:
				<STR> style = the style of clock to build. The valid styles including "swiss", "color_circles", electric_clock
				<ELM> canvas = the canvas element on which the clock is being drawn
			Return:
				@ OK: <OBJ> the clock obj(instance of this::_cls_Clock) with the requested style
				@ NG: null
		*/
		build : function (style, canvas) {
			
			var clk = null;
			
			if (canvas.width !== canvas.height) {
				canvas.width = canvas.height;
			}
			
			switch (style) {
				case _CONST.swissClock:		
					clk = _buildSwissClock(canvas);
				break;
				
				case _CONST.colorClock:
					// TODO: add later
				break;
				
				case _CONST.electricClock:
					// TODO: add later
				break;
			}
			
			return clk;
		}
	}
}());