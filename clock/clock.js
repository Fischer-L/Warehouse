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
		> _buildColorClock: Build the color circle style clock
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
					@OK: <NUM> the degree. When the hous is 3 and the minute/second is 15, the degree is 0, and increasing clockwise.
					@NG: null
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
	
	/*	Arg:
			> canvas = refer to the constructor of this::_cls_Drawer
		Return:
			<OBJ> the instance of this::_cls_Clock
	*/
	var _buildColorClock = function (canvas) {
		
		var __dr = new _cls_Drawer(canvas); {
			
			__dr.styles = {}; {
				__dr.styles.colorScheme = 0; // the lighter color
				__dr.styles.colorTable = [
					  // lighter           // lightest           // normal
					[ "rgb(255, 64, 64)",  "rgb(255, 115, 115)", "rgb(255, 0, 0)" ], // Degree 0
					[ "rgb(255, 90, 64)",  "rgb(255, 134, 115)", "rgb(255, 35, 0)" ],
					[ "rgb(255, 110, 64)", "rgb(255, 148, 115)", "rgb(255, 61, 0)" ],
					[ "rgb(255, 126, 64)", "rgb(255, 160, 115)", "rgb(255, 83, 0)" ],
					[ "rgb(255, 139, 64)", "rgb(255, 170, 115)", "rgb(255, 100, 0)" ],
					[ "rgb(255, 150, 64)", "rgb(255, 178, 115)", "rgb(255, 116, 0)" ],
					[ "rgb(255, 160, 64)", "rgb(255, 186, 115)", "rgb(255, 129, 0)" ],
					[ "rgb(255, 169, 64)", "rgb(255, 192, 115)", "rgb(255, 140, 0)" ],
					[ "rgb(255, 177, 64)", "rgb(255, 198, 115)", "rgb(255, 151, 0)" ],
					[ "rgb(255, 184, 64)", "rgb(255, 203, 115)", "rgb(255, 161, 0)" ],
					[ "rgb(255, 191, 64)", "rgb(255, 208, 115)", "rgb(255, 170, 0)" ],
					[ "rgb(255, 198, 64)", "rgb(255, 213, 115)", "rgb(255, 179, 0)" ],
					[ "rgb(255, 204, 64)", "rgb(255, 218, 115)", "rgb(255, 187, 0)" ],
					[ "rgb(255, 210, 64)", "rgb(255, 222, 115)", "rgb(255, 195, 0)" ],
					[ "rgb(255, 216, 64)", "rgb(255, 227, 115)", "rgb(255, 203, 0)" ],
					[ "rgb(255, 222, 64)", "rgb(255, 231, 115)", "rgb(255, 211, 0)" ], // Degree 90
					[ "rgb(255, 228, 64)", "rgb(255, 235, 115)", "rgb(255, 219, 0)" ], 
					[ "rgb(255, 235, 64)", "rgb(255, 240, 115)", "rgb(255, 228, 0)" ],
					[ "rgb(255, 241, 64)", "rgb(255, 245, 115)", "rgb(255, 236, 0)" ],
					[ "rgb(255, 248, 64)", "rgb(255, 250, 115)", "rgb(255, 245, 0)" ],
					[ "rgb(255, 255, 64)", "rgb(255, 255, 115)", "rgb(255, 255, 0)" ],
					[ "rgb(239, 253, 63)", "rgb(243, 253, 114)", "rgb(233, 251, 0)" ],
					[ "rgb(225, 251, 63)", "rgb(232, 251, 113)", "rgb(213, 248, 0)" ],
					[ "rgb(212, 250, 62)", "rgb(222, 250, 112)", "rgb(195, 245, 0)" ],
					[ "rgb(199, 248, 62)", "rgb(212, 248, 112)", "rgb(177, 241, 0)" ],
					[ "rgb(185, 247, 62)", "rgb(201, 247, 111)", "rgb(159, 238, 0)" ],
					[ "rgb(170, 245, 61)", "rgb(190, 245, 110)", "rgb(139, 234, 0)" ],
					[ "rgb(152, 242, 61)", "rgb(176, 242, 109)", "rgb(116, 230, 0)" ],
					[ "rgb(131, 240, 60)", "rgb(160, 240, 108)", "rgb(88, 224, 0)" ],
					[ "rgb(101, 236, 59)", "rgb(137, 236, 106)", "rgb(52, 216, 0)" ],
					[ "rgb(57, 230, 57)",  "rgb(103, 230, 103)", "rgb(0, 204, 0)" ], // Degree 180
					[ "rgb(55, 222, 106)", "rgb(100, 222, 137)", "rgb(0, 189, 57)" ],
					[ "rgb(54, 217, 134)", "rgb(98, 217, 156)",  "rgb(0, 179, 88)" ],
					[ "rgb(53, 213, 157)", "rgb(96, 213, 172)",  "rgb(0, 171, 111)" ],
					[ "rgb(52, 209, 178)", "rgb(94, 209, 186)",  "rgb(0, 163, 131)" ],
					[ "rgb(51, 204, 204)", "rgb(92, 204, 204)",  "rgb(0, 153, 153)" ], 
					[ "rgb(57, 174, 207)", "rgb(97, 183, 207)",  "rgb(5, 125, 159)" ],
					[ "rgb(61, 154, 209)", "rgb(100, 168, 209)", "rgb(9, 105, 162)" ],
					[ "rgb(64, 138, 210)", "rgb(103, 158, 210)", "rgb(12, 90, 166)" ],
					[ "rgb(67, 125, 212)", "rgb(106, 148, 212)", "rgb(15, 77, 168)" ],
					[ "rgb(70, 113, 213)", "rgb(108, 140, 213)", "rgb(18, 64, 171)" ], 
					[ "rgb(73, 101, 214)", "rgb(111, 131, 214)", "rgb(21, 51, 173)" ],
					[ "rgb(76, 87, 216)",  "rgb(114, 121, 216)", "rgb(25, 36, 177)" ],
					[ "rgb(85, 77, 216)",  "rgb(120, 114, 216)", "rgb(34, 25, 178)" ],
					[ "rgb(96, 75, 216)",  "rgb(128, 112, 216)", "rgb(46, 22, 177)" ],
					[ "rgb(106, 72, 215)", "rgb(135, 110, 215)", "rgb(57, 20, 175)" ], // Degree 270
					[ "rgb(116, 70, 215)", "rgb(142, 109, 215)", "rgb(67, 18, 174)" ],
					[ "rgb(125, 68, 214)", "rgb(149, 107, 214)", "rgb(78, 16, 174)" ],
					[ "rgb(135, 66, 214)", "rgb(156, 106, 214)", "rgb(88, 14, 173)" ],
					[ "rgb(146, 64, 213)", "rgb(164, 104, 213)", "rgb(100, 12, 171)" ],
					[ "rgb(159, 62, 213)", "rgb(173, 102, 213)", "rgb(113, 9, 170)" ],
					[ "rgb(175, 59, 212)", "rgb(185, 100, 212)", "rgb(129, 6, 169)" ],
					[ "rgb(196, 55, 211)", "rgb(200, 97, 211)",  "rgb(151, 2, 167)" ],
					[ "rgb(216, 54, 196)", "rgb(216, 97, 201)",  "rgb(177, 0, 155)" ],
					[ "rgb(224, 56, 173)", "rgb(224, 101, 187)", "rgb(193, 0, 135)" ],
					[ "rgb(230, 57, 155)", "rgb(230, 103, 175)", "rgb(205, 0, 116)" ],
					[ "rgb(235, 59, 139)", "rgb(235, 106, 164)", "rgb(214, 0, 98)" ],
					[ "rgb(239, 60, 123)", "rgb(239, 108, 154)", "rgb(223, 0, 79)" ],
					[ "rgb(244, 61, 107)", "rgb(244, 110, 143)", "rgb(233, 0, 58)" ],
					[ "rgb(249, 62, 88)",  "rgb(249, 112, 131)", "rgb(243, 0, 33)" ] // Degree 354
				];
				__dr.styles.majorMarkRadius = __dr.cvs.width * 0.5 * 0.115;
				__dr.styles.majorMarkTexts = [
					"3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "1", "2" // Start from the degree 0, so start from 3
				];
				__dr.styles.majorMarkFontSize = __dr.styles.majorMarkRadius * 1; // In px
				__dr.styles.majorMarkFont = __dr.styles.majorMarkFontSize + 'px bold Helvatica, sans-serif';
				__dr.styles.majorMarkColor = "#fff";
				__dr.styles.clockRadius = __dr.cvs.width * 0.5 - __dr.styles.majorMarkRadius;
				__dr.styles.hrHand = {
					lineWidth : __dr.styles.majorMarkRadius * 0.55,
					length : __dr.styles.clockRadius * 0.6,
					lineCap : "round"
				};
				__dr.styles.mmHand = {
					lineWidth : __dr.styles.hrHand.lineWidth,
					length : __dr.styles.clockRadius * 0.75,
					lineCap : "round"
				};
				__dr.styles.ssHand = {
					lineWidth : __dr.styles.hrHand.lineWidth * 0.5,
					length : __dr.styles.clockRadius * 0.77,
					lineCap : "round"
				};
				__dr.styles.mmClockCenter = {
					radius : __dr.styles.mmHand.lineWidth * 0.9
				};
				__dr.styles.ssClockCenter = {
					radius : __dr.styles.ssHand.lineWidth * 1.15
				};
				__dr.styles.ssClockTip = {
					outerRadius : __dr.styles.ssClockCenter.radius * 1.8,
					innerRadius : __dr.styles.ssClockCenter.radius * 1,
				};
			}
			
			__dr.drawTimeMarks = function () {
			
				var i,
					r,
					coord,
					markText;
			
				this.ctx.save();
				
				this.ctx.translate(this.cvs.width/2, this.cvs.height/2);

				for (i = 0; i < 60; i++) {
					
					r = _math.d2r(6 * i);

					if (0 === i % 5) {
						coord = _math.getCoordByRadians(r, this.styles.clockRadius);
						
						// Make the color circle time marks
						this.ctx.save();

							this.ctx.fillStyle = this.styles.colorTable[i][this.styles.colorScheme];

							this.ctx.beginPath();						
							this.ctx.arc(
								coord.x,
								coord.y,
								this.styles.majorMarkRadius,
								_math.d2r(0),
								_math.d2r(360)
							);
							this.ctx.fill();

						this.ctx.restore();

						// Make the time mark texts in the circle time marks
						this.ctx.save();

							this.ctx.fillStyle = __dr.styles.majorMarkColor;
							this.ctx.font = __dr.styles.majorMarkFont;
							
							markText = this.styles.majorMarkTexts[i/5];
							
							// Adjust the (x, y) coordinate of the text
							if (   markText === "10"
								|| markText === "11"
								|| markText === "12"
							) {
								coord.x = coord.x - this.styles.majorMarkFontSize * 0.62;
							} else {
								coord.x = coord.x - this.styles.majorMarkFontSize * 0.29;						
							}
							coord.y = coord.y + this.styles.majorMarkFontSize * 0.36;	
							
							this.ctx.fillText(markText, coord.x, coord.y);

						this.ctx.restore();
					}
				}
				
				this.ctx.restore();
			}
						
			__dr.drawHands = function (date) {
				
				var i,
					tTypes,
					tStyles,
					tDegrees,
					hh = date.getHours() % 12,
					mm = date.getMinutes(),
					ss = date.getSeconds(),		
					srcCoord = {},					
					dstCoord = {
						x : 0, y : 0
					};
				
				this.ctx.save();				
					// Draw the hour hand
					tStyles = this.styles.hrHand;
					tDegrees = _math.t2d("hour", hh);
					
					this.rotateByTime("hour", date);
					this.ctx.lineCap = tStyles.lineCap;
					this.ctx.lineWidth = tStyles.lineWidth;
					this.ctx.strokeStyle = this.styles.colorTable[tDegrees / 6][this.styles.colorScheme]; // Makr hour/minute/second hand's color equal to the current hour/minute/second's color
					
					srcCoord.y = 0;
					srcCoord.x = tStyles.length;
					this.drawLine(srcCoord, dstCoord);
				this.ctx.restore();	
				
				this.ctx.save();
					
					tDegrees = _math.t2d("minute", mm);
					
					// Draw the minute hand
					this.ctx.save();
						tStyles = this.styles.mmHand;
						
						this.rotateByTime("minute", date);
						this.ctx.lineCap = tStyles.lineCap;
						this.ctx.lineWidth = tStyles.lineWidth;
						this.ctx.strokeStyle = this.styles.colorTable[tDegrees / 6][this.styles.colorScheme]; // Makr hour/minute/second hand's color equal to the current hour/minute/second's color
						
						srcCoord.y = 0;
						srcCoord.x = tStyles.length;
						this.drawLine(srcCoord, dstCoord);
					this.ctx.restore();	
					
					// Draw the clock center on the minute hand
					this.ctx.save();	
						tStyles = this.styles.mmClockCenter;
						
						this.ctx.translate(this.cvs.width/2, this.cvs.height/2);
						this.ctx.fillStyle = this.styles.colorTable[tDegrees / 6][this.styles.colorScheme]; // Makr the center's of minute/second hand color equal to the current minute/second's color
						this.ctx.beginPath();
						this.ctx.arc(
							0,
							0,
							tStyles.radius,
							_math.d2r(0),
							_math.d2r(360)
						);
						this.ctx.fill();
					this.ctx.restore();	
					
				this.ctx.restore();	
				
				this.ctx.save();
					
					tDegrees = _math.t2d("minute", ss);
					
					// Draw the second hand and the tip of the second hand
					this.ctx.save();
						this.rotateByTime("second", date);
						this.ctx.strokeStyle = this.ctx.fillStyle = this.styles.colorTable[tDegrees / 6][this.styles.colorScheme]; // Makr hour/minute/second hand's color equal to the current hour/minute/second's color
						
						// the second hand
						tStyles = this.styles.ssHand;
						srcCoord.y = 0;
						srcCoord.x = tStyles.length;
						dstCoord.y = 0;
						dstCoord.x = -tStyles.length * 0.2;
						this.ctx.lineCap = tStyles.lineCap;
						this.ctx.lineWidth = tStyles.lineWidth;
						this.drawLine(srcCoord, dstCoord);
						
						// the tip of the second hand
						tStyles = this.styles.ssClockTip;
						this.ctx.beginPath();
						this.ctx.arc(
							srcCoord.x,
							srcCoord.y,
							tStyles.outerRadius,
							_math.d2r(0),
							_math.d2r(360)
						);
						this.ctx.fill();
						
						this.ctx.fillStyle = "#fff";
						this.ctx.beginPath();
						this.ctx.arc(
							srcCoord.x,
							srcCoord.y,
							tStyles.innerRadius,
							_math.d2r(0),
							_math.d2r(360)
						);
						this.ctx.fill();
						
					this.ctx.restore();	
					
					// Draw the clock center on the second hand
					this.ctx.save();	
						tStyles = this.styles.ssClockCenter;
						
						this.ctx.translate(this.cvs.width/2, this.cvs.height/2);
						this.ctx.fillStyle = this.styles.colorTable[tDegrees / 6][this.styles.colorScheme]; // Makr the center's of minute/second hand color equal to the current minute/second's color
						this.ctx.beginPath();
						this.ctx.arc(
							0,
							0,
							tStyles.radius,
							_math.d2r(0),
							_math.d2r(360)
						);
						this.ctx.fill();
					this.ctx.restore();	
					
				this.ctx.restore();	
			}
		}
		
		return new _cls_Clock(__dr);
	}
	
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
					clk = _buildColorClock(canvas);
				break;
				
				case _CONST.electricClock:
					// TODO: add later
				break;
			}
			
			return clk;
		}
	}
}());