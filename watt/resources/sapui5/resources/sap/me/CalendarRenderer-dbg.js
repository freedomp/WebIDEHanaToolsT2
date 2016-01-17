/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

        (c) Copyright 2009-2015 SAP SE. All rights reserved
    
 */
sap.ui.define(['jquery.sap.global', './CalendarDate', 'sap/ui/core/LocaleData', 'sap/ui/core/format/DateFormat', 'sap/ui/core/date/UniversalDate'],
	function(jQuery, CalendarDate, LocaleData, DateFormat, UniversalDate) {
	"use strict";



	/**
	 * @class Calendar renderer.
	 * @static
	 */
	var CalendarRenderer = {
	};

	/**
	 *
	 * @param {object} oRm
	 * @param {sap.m.Calendar} oControl
	 * @private
	 */
	CalendarRenderer.render = function (oRm, oControl) {
		if (!oControl.getVisible()) {
			return;
		}

		oRm.write("<div");
		oRm.writeControlData(oControl);
		oRm.addClass("sapMeCalendar");
		var sClass = "sapMeCalendar" + oControl.getDesign();
		oRm.addClass(sClass);
		oRm.writeClasses();
		var w = oControl.getWidth();
		if (w != undefined) {
			oRm.addStyle("width", w);
			oRm.writeStyles();
		}
		oRm.write(">");

		oRm.renderControl(oControl._oPrevBtn);
		oRm.renderControl(oControl._oNextBtn);

		var bSingleRow = oControl.getSingleRow();

		var iMonths = bSingleRow ? 1 : oControl.getMonthsToDisplay();
		var oNow = new CalendarDate();
		var sNow = oNow.toDateString(); // so it is same time as other dates
		var i;
		if (iMonths === 1) {
			this._renderMonth(oRm, oControl, oControl._oInternalDate.getDateObject(), sNow);
		}else {
			var currentDate = oControl._oInternalDate.getCopyDateObject();
			var iMonthToGoBack = Math.floor(iMonths / 2);
			for (i = 0; i < iMonthToGoBack; i++) { // we go first back in time
				currentDate = CalendarDate.getPreviousMonth(currentDate);
			}
			for (i = 0; i < iMonths; i++) {
				this._renderMonth(oRm, oControl, currentDate, sNow);
				currentDate = CalendarDate.getNextMonth(currentDate);
			}
		}

		oRm.write("</div>"); // sapMeCalendar DIV
	};

	/**
	 * Formats a given date according to a given pattern.
	 *
	 * @param {Date} oDate The date to format
	 * @param {string} sPattern the pattern to use to format the date
	 *
	 * @return {String} The formatted date string
	 *
	 * @private
	 */
	CalendarRenderer._formatDate = function (oDate, sPattern) {
		var dateInstance = DateFormat.getDateTimeInstance({pattern:sPattern});
		return dateInstance.format(oDate);
	};

	/**
	 * Formats a date interval according to the given dates.
	 *
	 * @param {object} oDate1 First date of the interval
	 * @param {object} oDate2 Second date
	 * @param {object} oControl The control being rendered
	 *
	 * @return {string} The formatted date interval string.
	 *
	 * @private
	 * @experimental Since 1.16.4
	 */
	CalendarRenderer._getDateIntervalText = function (oDate1, oDate2, oControl) {
		var orDate1, orDate2;
		if (oDate1.getTime() <= oDate2.getTime()) {
			orDate1 = new Date(oDate1.getTime());
			orDate2 = new Date(oDate2.getTime());
		} else {
			orDate1 = new Date(oDate2.getTime());
			orDate2 = new Date(oDate1.getTime());
		}
		// in enUS: intervalFormat-yMMM-y: "MMM y – MMM y"
		var sIntervalPattern = oControl._getIntervalPattern("yMMM-y");
		var sIntervalSeparator = this._getIntervalSeparator(sIntervalPattern, oControl);

		// split the pattern on the separator => 2 elements in the array, left pattern, right pattern.
		var aPatterns = sIntervalPattern.split(sIntervalSeparator);

		// The potential whitespaces (trimmed earlier) around the separator are in the patterns in the array.
		return this._formatDate(orDate1, aPatterns[0]) + sIntervalSeparator + this._formatDate(orDate2, aPatterns[1]);
	};

	/**
	 * Only for Fiori2/wave2 use, until the official implementation is available.
	 *
	 * @deprecated This will most likely return an invalid date string for the Islamic calendar.
	 * Since Arabic is not supported in Fiori2, I've been coerced into coding it.
	 *
	 * @param {Date} oDate The date to format using this pattern (EN shown here): "MMM y"
	 * @param {Object} oControl The control being rendered.
	 *
	 * @return {string} The formatted date with month and year, as a string.
	 *
	 * @private
	 */
	CalendarRenderer._getMonthAndYear = function (oDate, oControl) {
		var sPattern = oControl._getIntervalPattern("yMMM-y");
		var sIntervalSeparator = this._getIntervalSeparator(sPattern, oControl);
		var aPatterns = sPattern.split(sIntervalSeparator);

		return this._formatDate(oDate, aPatterns[0]);
	};

	CalendarRenderer._getIntervalSeparator = function (sPattern, oControl) {
		// intervalFormatFallback: "{0} – {1}"
		var sFallbackPattern = oControl._getIntervalPattern("");

		// The separator that looks like -, but is in fact String.fromCharCode(8211), might be something else in other languages.
		// Assumption: this character is unique in the format string
		// It's not a "-" in:
		//	  bn          unicode
		//	  es_*        "a el",
		//	  fa          the format looks like it's missing an opening curly bracket,
		//	  fr_be       "au"
		//	  fr_ch       "au"
		//	  ja          tilde
		//	  root        unicode (looks similar to bn)
		//	  zh_Hans_SG  unicode symbol
		//	  sh_Hant     unicode symbol
		var sIntervalSeparator = sFallbackPattern.replace("{0}", "").replace("{1}", "").trim();

		// CSS 0120061532 0001225837 2014
		if (oControl._checkLanguageRegion("zh", "CN")) {
			// The interval separator found in the fallback pattern is not
			// the one used in the interval pattern, try another one.
			if (sPattern.indexOf(sIntervalSeparator === -1)) {
				// In zh_CN, the "MMM-M" pattern is similar to "LLLxLLL"
				// x represents the character that means "to" in zhCN, it's not the actual character.
				sIntervalSeparator = oControl._getIntervalPattern("MMM-M").replace(/L/g, "").trim();
			}
		}

		return sIntervalSeparator;
	};

	/**
	 *
	 * @param {UniversalDate} currentDate
	 * @param {sap.me.Calendar} oControl The Calendar control
	 * @param {integer} iCurrentDate The current's date day of the month.
	 * @param {boolean} bSingleRow Is the calendar displayed on a single row (true/false)? This changes the format string,
	 * as for a single row, the span of dates displayed may be across 2 different months.
	 * @param {integer} iTotalDays The total number of days displayed.
	 * @returns {string} A formatted string to display the month above the calendar.
	 * @private
	 */
	CalendarRenderer._getMonthTitle = function (currentDate, oControl, iCurrentDate, bSingleRow, iTotalDays) {
		var sMonthTitle = this._getMonthAndYear(currentDate, oControl);

		if (bSingleRow) {
			var tempDate = new UniversalDate(currentDate.getTime());
			tempDate.setDate(tempDate.getDate() + iTotalDays - 1);

			// change the displayed date to be an interval if the month or the year are different
			if (currentDate.getFullYear() !== tempDate.getFullYear() || currentDate.getMonth() !== tempDate.getMonth()) {
				sMonthTitle = this._getDateIntervalText(currentDate, tempDate, oControl);
			}
		}
		return sMonthTitle;
	};

	/**
	 *
	 * @param {object} oRm The render manager.
	 * @param {sap.me.Calendar} oControl The sap.me calendar.
	 * @param {UniversalDate} oMonthDate This date must be cloned! The month to render.
	 * @param {string} sDateNow Today's date (as a toDateString string) so that
	 * it is shown with a border around it if it is in the month being rendered.
	 * @private
	 */
	CalendarRenderer._renderMonth = function (oRm, oControl, oMonthDate, sDateNow) {
		var bSingleRow = oControl.getSingleRow();
		var iFirstDayOffset = oControl.getFirstDayOffset();
		var aWeekDays = oControl.getDays();
		var iWeekDays = aWeekDays.length;
		var iWeeksPerRow = oControl.getWeeksPerRow();
		var iDaysInRow = iWeeksPerRow * iWeekDays;
		var iDayWidth = (100 / iDaysInRow);
		var iDayHeight = oControl.getDayHeight();
		var iMonthWidth = (100 / (bSingleRow ? 1 : oControl.getMonthsPerRow()));

		var oTmpDate = new Date(oMonthDate.getTime());
		var currentDate = new CalendarDate.createDate(oTmpDate.getFullYear(), oTmpDate.getMonth(), oTmpDate.getDate());
		// save the current day in the month
		var iCurrentDate = currentDate.getDate();
		// save the current week day of the date
		var iCurrentDay = currentDate.getDay();

		// go to first day of month
		currentDate.setDate(1);
		var iMonthFirstDay = currentDate.getDay();
		if (iMonthFirstDay < iFirstDayOffset) {
			iMonthFirstDay += 7;
		}
		var iCurrentMonth = currentDate.getMonth();
		var dateForNbOfDaysInThisMonth = new UniversalDate(currentDate.getFullYear(), iCurrentMonth + 1, 0);
		var nbOfDaysInThisMonth = dateForNbOfDaysInThisMonth.getDate();

		var iDaysToGoBack = bSingleRow ? iCurrentDay + 1 - iFirstDayOffset : iCurrentDate + iMonthFirstDay - iFirstDayOffset;

		var nbOfRows = Math.ceil((nbOfDaysInThisMonth + iDaysToGoBack - iCurrentDate) / 7);
		var iTotalDays = bSingleRow ? iDaysInRow : (nbOfRows * 7);

		// default title (in en_US, for instance): MMM y
		var sMonthTitle = this._getMonthTitle(currentDate, oControl, iCurrentDate, bSingleRow, iTotalDays);

		if (bSingleRow) {
			currentDate = oControl._getCalendarFirstDate();
		} else {
			currentDate.setDate(iCurrentDate - iDaysToGoBack + 1);
		}

		oRm.write('<div'); // month div
		oRm.addClass("sapMeCalendarMonth");
		if (!bSingleRow) {
			oRm.addClass("sapMeCalendarMonthNotSingle");
		}
		oRm.writeClasses();
		oRm.addStyle("width", iMonthWidth + "%");
		oRm.writeStyles();
		oRm.write(">");

		oRm.write('<div'); // monthname div
		oRm.addClass("sapMeCalendarMonthName");
		oRm.writeClasses();
		if (oControl.getHideMonthTitles()) {
			oRm.addStyle("visibility", "hidden");
			oRm.writeStyles();
		}
		oRm.write(">");
		oRm.writeEscaped(sMonthTitle);
		oRm.write("</div>"); // monthname


		oRm.write('<div'); // MonthDayNames div
		oRm.addClass("sapMeCalendarMonthDayNames");
		oRm.writeClasses();
		oRm.write(">");

		var i;
		for (i = 0; i < iDaysInRow; i++) {
			var sContent = aWeekDays[(i + iFirstDayOffset) % iWeekDays];
			this._renderDay(oRm, oControl, null, sContent, iDayWidth);
		}

		oRm.write('</div>'); // MonthDayNames div

		oRm.write('<div'); // MonthDays div
		oRm.addClass("sapMeCalendarMonthDays");
		oRm.writeClasses();
		oRm.write(">");

		for (i = 0; i < iTotalDays; i++) { // max days of a month
			var iMonth = currentDate.getMonth();
			var iDayInWeek = currentDate.getDay();
			iCurrentDay = currentDate.getDate();

			var bNotThisMonth = iMonth !== iCurrentMonth;
			oTmpDate = new Date(currentDate.getTime());
			var sId = oTmpDate.toDateString();
			var bIsToday = sId == sDateNow;
			this._renderDay(oRm, oControl, sId, iCurrentDay + "", iDayWidth, iDayHeight, iDayInWeek, bNotThisMonth, bIsToday);

			currentDate.setDate(currentDate.getDate() + 1);
		}

		oRm.write('</div>'); // MonthDays div

		oRm.write('</div>'); // month div
	};

	/**
	 *
	 * @param {object} oRm
	 * @param {object} oControl
	 * @param {string} sId
	 * @param {string} sContent
	 * @param {number} iDayWidth
	 * @param {number} iDayHeight
	 * @param {number} iDayInWeek
	 * @param {boolean} bNotThisMonth
	 * @param {boolean} bIsToday
	 * @private
	 */
	CalendarRenderer._renderDay = function (oRm, oControl, sId, sContent, iDayWidth, iDayHeight, iDayInWeek, bNotThisMonth, bIsToday) {
		oRm.write("<div");
		oRm.addClass("sapMeCalendarMonthDay");

		if (bIsToday) {
			oRm.addClass("sapMeCalendarDayNow");
		}
		if (bNotThisMonth && !oControl.getSingleRow()) {
			oRm.addClass("sapMeCalendarDayNotInCurrentMonth");
		}
		if (typeof iDayInWeek == "number") {
			oRm.addClass("sapMeCalendarWeekDay" + iDayInWeek);
		}
		oRm.writeClasses();
		oRm.addStyle("width", iDayWidth + "%");
		if (iDayHeight) {
			oRm.addStyle("height", iDayHeight + "px");
		}
		oRm.writeStyles();
		if ( sId != null ){
			var sIdWithDashes = sId.replace(/\s/g,"-");
			oRm.writeAttribute('id', oControl.getId() + "-" + sIdWithDashes);
		}
		oRm.write(">");
		oRm.write('<span>');
		oRm.writeEscaped(sContent);
		oRm.write("</span>");
		if ( sId != null ){
			oRm.write('<input type="hidden" value="' + sId + '"></input>');
		}
		oRm.write("</div>");
	};


	return CalendarRenderer;

}, /* bExport= */ true);
