(function (win) {
"use strict";

win.stocks = {

	parseSource: function () {
		var list = {
			buy: this._parseSourceList("listBuy"),
			sell: this._parseSourceList("listSell")
		};
		return JSON.stringify(list);
	},

	_parseSourceList: function (tableID) {
		var dataArray = [];
		var table = document.getElementById(tableID);
		var trs = table.querySelectorAll("tbody > tr");
		for (var i = 0; i < trs.length - 1; ++i) {
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
		this._analyze(
			monthlyList.buy, 
			weeklyList.buy, 
			weeklyList.sell, 
			dailyList.buy, 
			dailyList.sell
		);
	},

	_analyze: function (monthlyBuyArray, weeklyBuyArray, weeklySellArray, dailyBuyArray, dailySellArray) {
		var monthlyReport = this.generateMonthlyReport(
			this.createMapFromArray(monthlyBuyArray),
			this.createMapFromArray(weeklyBuyArray),
			this.createMapFromArray(weeklySellArray),
			this.createMapFromArray(dailyBuyArray),
			this.createMapFromArray(dailySellArray)
		);
		var weeklylyReport = this.generateWeeklyReport(
			this.createMapFromArray(weeklyBuyArray),
			this.createMapFromArray(dailyBuyArray),
			this.createMapFromArray(dailySellArray)
		);
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
		div.appendChild(monthlyReport);
		div.appendChild(weeklylyReport);
		document.body.appendChild(div);
	},

	generateMonthlyReport: function (monthlyBuySide, weeklyBuySide, weeklySellSide, dailyBuySide, dailySellSide) {
		var table = this._createMonthlyTable();
		for (let [agency, monData] of monthlyBuySide) {
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

	generateWeeklyReport: function (weeklyBuySide, dailyBuySide, dailySellSide) {
		var table = this._createWeeklyTable();
		for (let [agency, weekData] of weeklyBuySide) {
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

	_createWeeklyTable: function () {
		var div = document.createElement("DIV");
		div.innerHTML = this._weeklylyTmplt;

		var table = div.querySelector("table");
		table.appendStock = function (agency, weekGap, weekPrice, dayGap, dayPrice) {
			var tr = document.createElement("TR");
			tr.innerHTML = `
				<td style="padding: 5px 20px;">${agency}</td>
				<td style="padding: 5px 20px;">${weekGap}</td>
				<td style="padding: 5px 20px; border-right: 1px dotted #555;">${weekPrice}</td>
				<td style="padding: 5px 20px;">${dayGap}</td>
				<td style="padding: 5px 20px; border-right: 1px dotted #555;">${dayPrice}</td>
				<td style="padding: 5px 20px;" class="weekDayRatio"></td>
			`;
			win.stocks._formatRatioCell(tr, ".weekDayRatio", weekGap, dayGap);
			this.appendChild(tr);
		};
		return table;
	},

	_createMonthlyTable: function () {
		var div = document.createElement("DIV");
		div.innerHTML = this._monthlyTmplt;

		var table = div.querySelector("table");
		table.appendStock = function (agency, monGap, monPrice, weekGap, weekPrice, dayGap, dayPrice) {
			var tr = document.createElement("TR");
			tr.innerHTML = `
				<td style="padding: 5px 20px;">${agency}</td>
				<td style="padding: 5px 20px;">${monGap}</td>
				<td style="padding: 5px 20px; border-right: 1px dotted #555;">${monPrice}</td>
				<td style="padding: 5px 20px;">${weekGap}</td>
				<td style="padding: 5px 20px; border-right: 1px dotted #555;">${weekPrice}</td>
				<td style="padding: 5px 20px; border-right: 1px dotted #555;" class="monWeekRatio"></td>
				<td style="padding: 5px 20px;">${dayGap}</td>
				<td style="padding: 5px 20px; border-right: 1px dotted #555;">${dayPrice}</td>
				<td style="padding: 5px 20px; border-right: 1px dotted #555;" class="weekDayRatio"></td>
				<td style="padding: 5px 20px;" class="monDayRatio"></td>
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
				ratio = -1 * shortTermGap / longTermGap;
			} else if (longTermGap < 0 && shortTermGap > 0) {
				color = "red";
				ratio = -1 * (shortTermGap - longTermGap) / longTermGap;
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
				<th style="text-align:center;">週日買賣超%</th>
			</thead>
			<tbody>
			</tbody>
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
				<th style="text-align:center;">月週買賣超%</th>
				<th style="text-align:center;">日買賣超</th>
				<th style="text-align:center;">日均價</th>
				<th style="text-align:center;">週日買賣超%</th>
				<th style="text-align:center;">月日買賣超%</th>
			</thead>
			<tbody>
			</tbody>
		</table>
	`
};

})(window);
