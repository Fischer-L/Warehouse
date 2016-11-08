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
			monthlyList.sell, 
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
		var table = this.createMonthlyTable();
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
		var table = this.createWeeklyTable();
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

	createWeeklyTable: function () {
		var div = document.createElement("DIV");
		div.innerHTML = this._weeklylyTmplt;

		var table = div.querySelector("table");
		table.appendStock = function (agency, weekGap, weekPrice, dayGap, dayPrice) {
			var tr = document.createElement("TR");
			tr.innerHTML = `
				<td style="padding: 5px 20px;">${agency}</td>
				<td style="padding: 5px 20px;">${weekGap}</td>
				<td style="padding: 5px 20px;">${weekPrice}</td>
				<td style="padding: 5px 20px;">${dayGap}</td>
				<td style="padding: 5px 20px;">${dayPrice}</td>
				<td style="padding: 5px 20px;" class="weekDayRatio"></td>
			`;
			var td;
			var weekDayRatio = (dayGap !== " " && weekGap !== " ") ? dayGap / weekGap : " ";
			if (weekDayRatio !== " ") {
				td = tr.querySelector(".weekDayRatio");
				td.innerHTML = weekDayRatio * 100.0;
				td.style.color = dayGap > 0 ? "red" : "green";
			}
			this.appendChild(tr);
		};
		return table;
	},

	createMonthlyTable: function () {
		var div = document.createElement("DIV");
		div.innerHTML = this._monthlyTmplt;

		var table = div.querySelector("table");
		table.appendStock = function (agency, monGap, monPrice, weekGap, weekPrice, dayGap, dayPrice) {
			var tr = document.createElement("TR");
			tr.innerHTML = `
				<td style="padding: 5px 20px;">${agency}</td>
				<td style="padding: 5px 20px;">${monGap}</td>
				<td style="padding: 5px 20px;">${monPrice}</td>
				<td style="padding: 5px 20px;">${weekGap}</td>
				<td style="padding: 5px 20px;">${weekPrice}</td>
				<td style="padding: 5px 20px;" class="monWeekRatio"></td>
				<td style="padding: 5px 20px;">${dayGap}</td>
				<td style="padding: 5px 20px;">${dayPrice}</td>
				<td style="padding: 5px 20px;" class="weekDayRatio"></td>
				<td style="padding: 5px 20px;" class="monDayRatio"></td>
			`;
			var td;
			var monWeekRatio = (monGap !== " " && weekGap !== " ") ? weekGap / monGap : " ";
			if (monWeekRatio !== " ") {
				td = tr.querySelector(".monWeekRatio");
				td.innerHTML = monWeekRatio * 100.0;
				td.style.color = weekGap > 0 ? "red" : "green";
			}
			var weekDayRatio = (dayGap !== " " && weekGap !== " ") ? dayGap / weekGap : " ";
			if (weekDayRatio !== " ") {
				td = tr.querySelector(".weekDayRatio");
				td.innerHTML = weekDayRatio * 100.0;
				td.style.color = dayGap > 0 ? "red" : "green";
			}
			var monDayRatio = (dayGap !== " " && monGap !== " ") ? dayGap / monGap : " ";
			if (monDayRatio !== " ") {
				td = tr.querySelector(".monDayRatio");
				td.innerHTML = monDayRatio * 100.0;
				td.style.color = dayGap > 0 ? "red" : "green";
			}
			this.appendChild(tr);
		};
		return table;
	},

	_weeklylyTmplt:`
		<table style="margin: 20px;">
			<caption>Weekly - Daily</caption>
			<thead>
				<th>券商</th>
				<th>週買賣超</th>
				<th>週均價</th>
				<th>日買賣超</th>
				<th>日均價</th>
				<th>週日買賣超%</th>
			</thead>
			<tbody>
			</tbody>
		</table>
	`,

	_monthlyTmplt:`
		<table style="margin: 20px;">
			<caption>Monthly - Weekly - Daily</caption>
			<thead>
				<th>券商</th>
				<th>月買賣超</th>
				<th>月均價</th>
				<th>週買賣超</th>
				<th>週均價</th>
				<th>月週買賣超%</th>
				<th>日買賣超</th>
				<th>日均價</th>
				<th>週日買賣超%</th>
				<th>月日買賣超%</th>
			</thead>
			<tbody>
			</tbody>
		</table>
	`
};

})(window);
