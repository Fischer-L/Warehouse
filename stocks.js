(function (win) {
"use strict";

win.stocks = {

	calculateAvg: function () {
		var t  = document.querySelector("table.solid_1_padding_3_1_tbl");
		var foreignRow = t.querySelectorAll("tr")[1];
		var totalRow = t.querySelectorAll("tr")[4];
		var avgParams = [ // [ td index, days ]
			[ 1, 3 ], [ 2, 5 ], [ 4, 21 ], [ 5, 60 ]
		];

		[ foreignRow, totalRow ].forEach(row => {
			var avgs = [];
			for (let [ i, days ] of avgParams) {
				let bought = row.querySelectorAll("td")[i].querySelector("font").textContent;
				bought = parseInt(bought.replace(/,/g, ''));
				avgs.push(bought/days);
			}
			console.log(avgs);
		});
	},

	parseSource: function () {
		var list = {
			buy: this._parseSourceList("listBuy"),
			sell: this._parseSourceList("listSell")
		};
		return JSON.stringify(list);
	},

	parseMon: function () {
		this._monList = {
			buy: this._parseSourceList("listBuy"),
			sell: this._parseSourceList("listSell")
		};
	},

	parseWeek: function () {
		this._weekList = {
			buy: this._parseSourceList("listBuy"),
			sell: this._parseSourceList("listSell")
		};
	},

	parseDay: function () {
		this._dayList = {
			buy: this._parseSourceList("listBuy"),
			sell: this._parseSourceList("listSell")
		};
	},

	_parseSourceList: function (tableID) {
		var dataArray = [];
		var table = document.getElementById(tableID);
		var trs = table.querySelectorAll("tbody > tr");
		for (var i = 0, j = 25; i < trs.length - 1 && j > 0; ++i, --j) {
			var data = {};
			var tr = trs[i];
			var tds = tr.querySelectorAll("td");
			data.agency = tds[0].querySelector("span").innerHTML;
			data.buy = parseInt(tds[1].innerHTML);
			data.sell = parseInt(tds[2].innerHTML);
			data.gap = parseInt(tds[3].innerHTML);
			data.price = parseFloat(tds[4].innerHTML);
			dataArray.push(data);
		}
		return dataArray;
	},

	analyze: function (monthlyList, weeklyList, dailyList) {
		if (!monthlyList && !weeklyList && !dailyList) {
			monthlyList = this._monList;
			weeklyList = this._weekList;
			dailyList = this._dayList;
		}
		this._analyze(
			monthlyList.buy, 
			monthlyList.sell, 
			weeklyList.buy, 
			weeklyList.sell, 
			dailyList.buy, 
			dailyList.sell
		);
	},

	autoAnalyze: function () {
		var self = this;
		var e = new Event("change");
		var select = document.getElementById("selectDaysInterval");
		this._monList = null;
		this._weekList = null;
		this._dayList = null;
		(new Promise(function (res) {
			select.selectedIndex = 4;
			select.dispatchEvent(e);
			setTimeout(mon, 1100);
			function mon() {
				self.parseMon();
				if (self._monList.buy.length == 0) {
					setTimeout(mon, 1100);
				} else {
					console.log("Mon res", self._monList.buy.length);
					res();
				}
			}
		})).then(function () {
			return new Promise(function (res) {
				select.selectedIndex = 2;
				select.dispatchEvent(e);
				setTimeout(week, 1100);
				function week() {
					self.parseWeek();
					if (self._weekList.buy.length == 0) {
						setTimeout(week, 1100);
					} else {
						console.log("Week res", self._weekList.buy.length);
						res();
					}
				}

			});
		}).then(function () {
			return new Promise(function (res) {
				var b = document.getElementById("btnDaysDefine");
				b.click();
				setTimeout(day, 1100);
				function day() {
					self.parseDay();
					if (self._dayList.buy.length == 0) {
						setTimeout(day, 1100);
					} else {
						console.log("Day res", self._dayList.buy.length);
						res();
					}
				}
			});
		}).then(function () {
			self.analyze();
		});
	},

	_analyze: function (monthlyBuyArray, monthlySellArray, weeklyBuyArray, weeklySellArray, dailyBuyArray, dailySellArray) {
		var	monthlyBuySide  = this.createMapFromArray(monthlyBuyArray),
			monthlySellSide = this.createMapFromArray(monthlySellArray),
			weeklyBuySide   = this.createMapFromArray(weeklyBuyArray),
			weeklySellSide  = this.createMapFromArray(weeklySellArray),
			dailyBuySide    = this.createMapFromArray(dailyBuyArray),
			dailySellSide   = this.createMapFromArray(dailySellArray);
		var div = document.createElement("DIV");
		div.style = `
			background: #fff;
			position: absolute;
			top: 0;
			left: 0;
			z-index: 9999;
			width: 100%;
			height: 1000%;
		`;
		div.appendChild(this.generateMonthlyReport(
			"Buy",
			monthlyBuySide,
			weeklyBuySide,
			weeklySellSide,
			dailyBuySide,
			dailySellSide
		));
		div.appendChild(this.generateWeeklyReport(
			"Buy",
			weeklyBuySide,
			dailyBuySide,
			dailySellSide
		));
		div.appendChild(this.generateMonthlyReport(
			"Sell",
			monthlySellSide,
			weeklyBuySide,
			weeklySellSide,
			dailyBuySide,
			dailySellSide
		));
		div.appendChild(this.generateWeeklyReport(
			"Sell",
			weeklySellSide,
			dailyBuySide,
			dailySellSide
		));
		document.body.appendChild(div);
	},

	generateMonthlyReport: function (side, monthlySide, weeklyBuySide, weeklySellSide, dailyBuySide, dailySellSide) {
		var table = this._createMonthlyTable(side);
		for (let [agency, monData] of monthlySide) {
			var monGap = " ", monPrice = " ", weekGap = " ", weekPrice = " ", dayGap = " ", dayPrice = " ";

			monGap = monData.gap;
			monPrice = monData.price;

			var weekData = weeklyBuySide.get(agency) || weeklySellSide.get(agency);
			if (weekData) {
				weekGap = weekData.gap;
				weekPrice = weekData.price;
			}

			var dayData = dailyBuySide.get(agency) || dailySellSide.get(agency);
			if (dayData) {
				dayGap = dayData.gap;
				dayPrice = dayData.price;
			}

			table.appendStock(agency, monGap, monPrice, weekGap, weekPrice, dayGap, dayPrice);
		}
		return table;
	},

	generateWeeklyReport: function (side, weeklySide, dailyBuySide, dailySellSide) {
		var table = this._createWeeklyTable(side);
		for (let [agency, weekData] of weeklySide) {
			var weekGap = " ", weekPrice = " ", dayGap = " ", dayPrice = " ";

			weekGap = weekData.gap;
			weekPrice = weekData.price;

			var dayData = dailyBuySide.get(agency) || dailySellSide.get(agency);
			if (dayData) {
				dayGap = dayData.gap;
				dayPrice = dayData.price;
			}

			table.appendStock(agency, weekGap, weekPrice, dayGap, dayPrice);
		}
		return table;
	},

	createMapFromArray: function (dataArray) {
		var map = new Map();
		for (let data of dataArray) map.set(data.agency, data);
		return map;	
	},

	_createWeeklyTable: function (side) {
		var div = document.createElement("DIV");
		div.innerHTML = this._weeklylyTmplt;

		var table = div.querySelector("table");
		table.appendStock = function (agency, weekGap, weekPrice, dayGap, dayPrice) {
			var tr = document.createElement("TR"); 
			var bg = this.querySelectorAll("tr").length == 6 ? "background: pink;" : "";
			tr.innerHTML = `
				<td style="padding: 5px 20px; ${bg}">${agency}</td>
				<td style="padding: 5px 20px; ${bg}">${weekGap}</td>
				<td style="padding: 5px 20px; ${bg} border-right: 1px dotted #555;">${weekPrice}</td>
				<td style="padding: 5px 20px; ${bg}">${dayGap}</td>
				<td style="padding: 5px 20px; ${bg} border-right: 1px dotted #555;">${dayPrice}</td>
				<td style="padding: 5px 20px; ${bg}" class="weekDayRatio"></td>
			`;
			win.stocks._formatRatioCell(tr, ".weekDayRatio", weekGap, dayGap);
			this.appendChild(tr);
		};
		var caption = table.querySelector("caption");
		caption.innerHTML = side + " : " + caption.innerHTML;
		return table;
	},

	_createMonthlyTable: function (side) {
		var div = document.createElement("DIV");
		div.innerHTML = this._monthlyTmplt;

		var table = div.querySelector("table");
		table.appendStock = function (agency, monGap, monPrice, weekGap, weekPrice, dayGap, dayPrice) {
			var tr = document.createElement("TR");
			var bg = this.querySelectorAll("tr").length == 6 ? "background: pink;" : "";
			tr.innerHTML = `
				<td style="padding: 5px 20px; ${bg}">${agency}</td>
				<td style="padding: 5px 20px; ${bg}">${monGap}</td>
				<td style="padding: 5px 20px; ${bg} border-right: 1px dotted #555;">${monPrice}</td>
				<td style="padding: 5px 20px; ${bg}">${weekGap}</td>
				<td style="padding: 5px 20px; ${bg} border-right: 1px dotted #555;">${weekPrice}</td>
				<td style="padding: 5px 20px; ${bg} border-right: 1px dotted #555;" class="monWeekRatio"></td>
				<td style="padding: 5px 20px; ${bg}">${dayGap}</td>
				<td style="padding: 5px 20px; ${bg} border-right: 1px dotted #555;">${dayPrice}</td>
				<td style="padding: 5px 20px; ${bg} border-right: 1px dotted #555;" class="weekDayRatio"></td>
				<td style="padding: 5px 20px; ${bg}" class="monDayRatio"></td>
			`;
			var arr = [
				[".monWeekRatio", monGap, weekGap],
				[".weekDayRatio", weekGap, dayGap],
				[".monDayRatio", monGap, dayGap]
			];
			for (let [css, longTermGap, shortTermGap] of arr) {
				win.stocks._formatRatioCell(tr, css, longTermGap, shortTermGap);
			}

			this.appendChild(tr);
		};
		var caption = table.querySelector("caption");
		caption.innerHTML = side + " : " + caption.innerHTML;
		return table;
	},

	_formatRatioCell: function (tr, css, longTermGap, shortTermGap) {
		if (longTermGap !== " " && shortTermGap !== " ") {
			var td, ratio, color;
			if (longTermGap > 0 && shortTermGap > 0) {
				color = "red";
				ratio = shortTermGap / longTermGap;
			} else if (longTermGap > 0 && shortTermGap < 0) {
				color = "green";
				ratio = -1 * shortTermGap / (longTermGap - shortTermGap);
			} else if (longTermGap < 0 && shortTermGap > 0) {
				color = "red";
				ratio = -1 * shortTermGap / (longTermGap - shortTermGap);
			} else if (longTermGap < 0 && shortTermGap < 0) {
				color = "green";
				ratio = shortTermGap / longTermGap;
			}

			td = tr.querySelector(css);
			td.style.color = color;
			td.innerHTML = ratio * 100.0;
		}
	},

	_weeklylyTmplt:`
		<table style="margin: 20px;">
			<caption>Weekly - Daily</caption>
			<thead>
				<th style="text-align:center;">券商</th>
				<th style="text-align:center;">週買賣超</th>
				<th style="text-align:center;">週均價</th>
				<th style="text-align:center;">日買賣超</th>
				<th style="text-align:center;">日均價</th>
				<th style="text-align:center;">日週買賣超%</th>
			</thead>
		</table>
	`,

	_monthlyTmplt:`
		<table style="margin: 20px;">
			<caption>Monthly - Weekly - Daily</caption>
			<thead>
				<th style="text-align:center;">券商</th>
				<th style="text-align:center;">月買賣超</th>
				<th style="text-align:center;">月均價</th>
				<th style="text-align:center;">週買賣超</th>
				<th style="text-align:center;">週均價</th>
				<th style="text-align:center;">週月買賣超%</th>
				<th style="text-align:center;">日買賣超</th>
				<th style="text-align:center;">日均價</th>
				<th style="text-align:center;">日週買賣超%</th>
				<th style="text-align:center;">日月買賣超%</th>
			</thead>
		</table>
	`
};

})(window);
