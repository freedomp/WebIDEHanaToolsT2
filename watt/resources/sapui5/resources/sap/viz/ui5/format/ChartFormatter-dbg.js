/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

(c) Copyright 2009-2015 SAP SE. All rights reserved
 */


sap.ui.define(['sap/ui/core/format/NumberFormat',
    'sap/ui/core/format/DateFormat',
    'sap/ui/core/format/FileSizeFormat'],
    function(NumberFormat, DateFormat, FileSizeFormat) {
    "use strict";

    var semicolon = ":";
    var ChartFormatter = function () {
        if (this.caller != this.getInstance) {
            throw new Error("This object cannot be instantiated");
        }
        this.formatFunctions = [];
        this._updatePatternTable();
        this._locale = sap.ui.getCore().getConfiguration().getLanguage();

        // The following function is for CVOM info time Axis label level format
        // for internal use. These does not expose to end user.
        // We will use UI5 standard time combination formatter when UI5 implements
        // them in the coming wave.
        this.formatFunctions["hh:mm"] = this._getCVOMHourMinuteFormatter.bind(this);
        this.formatFunctions["hh:00"] = this._getCVOMHourZeroFormatter.bind(this);
        this.formatFunctions["hh:mm:ss"] = this._getCVOMHMSFormatter.bind(this);
        this.formatFunctions["ss''"] = this._getCVOMSecondFormatter.bind(this);
        this.formatFunctions["MMM"] = this._getCVOMMonthFormatter.bind(this);
        this.formatFunctions["d"] = this._getCVOMDayFormater.bind(this);
        this.formatFunctions["MMM d"] = this._getCVOMMonthDayFormatter.bind(this);
        this.formatFunctions["MMM d, yyyy"] = this._getCVOMYearMonthDayFormatter.bind(this);

        // The following function is for datalabel of CVOM percent chart and heatmap.
        // These does not expose to end user.
        this.formatFunctions["0.0%"] = this._getCVOMPercentFormatter.bind(this);
        this.formatFunctions["0.0"] = this._getCVOMShortFloatFormatter.bind(this);
    };

    // Default formatting functions
    ChartFormatter.DefaultPattern = {
        SHORTINTEGER: "ShortInteger", //e.g. 234M
        STANDARDINTEGER: "StandardInteger", // e.g. 234,234,234
        STANDARDFLOAT: "StandardFloat", //e.g. 2,342,234.234
        LONGFLOAT: "LongFloat", //e.g. 2.342234234 million
        PERCENT: "Percent", //e.g. value 0.1688 formated value 16.88%
        CURRENCY: "Currency", //e.g value 123456789.123456789 formated value 123,456,789.12
     
        // In first version only support below date format
        MEDIUMYEAR: "MediumYear", //e.g. 2015
        QUARTER: "Quarter", //e.g. Q3
        MEDIUMMONTH: "MediumMonth", //e.g. Aug
        WEEK: "Week", //e.g. CW35
        MEDIUMDAY: "MediumDay", //e.g. 01
        MEDIUMHOUR: "MediumHour", //e.g. 18
        MEDIUMMINUTE: "MediumMinute", //e.g. 18
        MEDIUMSECOND: "MediumSecond", //e.g. 59
        YEARMONTHDAY: "YearMonthDay", //e.g. Aug 28, 2015
        //////////////////////////////////////////////////
     
        BINARYFILESIZE: "BinaryFileSize", //1 Kibibyte = 1024 Byte
        DECIMALFILESIZE: "DecimalFileSize", //1 Kilobyte = 1000 Byte
    };

    ChartFormatter.prototype._updatePatternTable = function () {
        this.formatFunctions["ShortInteger"] = this._getShortIntegerFormatter();
        this.formatFunctions["StandardInteger"] = this._getStandardIntegerFormatter();
        this.formatFunctions["StandardFloat"] = this._getStandardFloatFormatter();
        this.formatFunctions["LongFloat"] = this._getLongFloatFormatter();
        this.formatFunctions["Percent"] = this._getPercentFormatter();
        this.formatFunctions["Currency"] = this._getCurrencyFormatter();
        this.formatFunctions["MediumYear"] = this._getMediumYearFormatter();
        this.formatFunctions["MediumMonth"] = this._getMediumMonthFormatter();
        this.formatFunctions["MediumDay"] = this._getMediumDayFormatter();
        this.formatFunctions["MediumHour"] = this._getMediumHourFormatter();
        this.formatFunctions["MediumMinute"] = this._getMediumMinuteFormatter();
        this.formatFunctions["MediumSecond"] = this._getMediumSecondFormatter();
        this.formatFunctions["YearMonthDay"] = this._getYearMonthDayFormatter();
        this.formatFunctions["BinaryFileSize"] = this._getBinaryFileSizeFormatter();
        this.formatFunctions["DecimalFileSize"] = this._getDecimalFileSizeFormatter();
        this.formatFunctions["Quarter"] = this._getQuarterFormatter();
        this.formatFunctions["Week"] = this._getWeekFormatter();
    };

    ChartFormatter.getInstance = function () {
        if (!this.instance) {
            this.instance = new ChartFormatter();
        }
        return this.instance;
    };

    ChartFormatter.prototype.format = function (value, pattern) {
        if (pattern) {
            var currentLocale = sap.ui.getCore().getConfiguration().getLanguage();
            if (this._locale !== currentLocale) {
                this._locale = currentLocale;
                this._updatePatternTable();
            }
            if (!jQuery.isArray(value) && isNaN(value)) {
                return value;
            }
            if (this.formatFunctions[pattern]) {
                return this.formatFunctions[pattern](value);
            }
        }
        return value;
    };

    // ----
    ChartFormatter.prototype._getShortIntegerFormatter = function () {
        var numberFormatter = NumberFormat.getIntegerInstance({style: 'short'});
        return numberFormatter.format.bind(numberFormatter);
    };

    ChartFormatter.prototype._getStandardIntegerFormatter = function () {
        var numberFormatter = NumberFormat.getIntegerInstance({style: 'Standard'});
        return numberFormatter.format.bind(numberFormatter);
    };

    ChartFormatter.prototype._getStandardFloatFormatter = function () {
        var numberFormatter = NumberFormat.getFloatInstance({style: 'Standard'});
        return numberFormatter.format.bind(numberFormatter);
    };

    ChartFormatter.prototype._getLongFloatFormatter = function () {
        var numberFormatter = NumberFormat.getFloatInstance({style: 'long'});
        return numberFormatter.format.bind(numberFormatter);
    };

    ChartFormatter.prototype._getPercentFormatter = function () {
        var numberFormatter = NumberFormat.getPercentInstance({style: 'precent'});
        return numberFormatter.format.bind(numberFormatter);
    };

    ChartFormatter.prototype._getCurrencyFormatter = function () {
        var numberFormatter = NumberFormat.getCurrencyInstance({style: 'currency'});
        return numberFormatter.format.bind(numberFormatter);
    };

    ChartFormatter.prototype._getMediumYearFormatter = function () {
        var dateFormatter = DateFormat.getDateTimeInstance({pattern: 'yyyy'});
        return dateFormatter.format.bind(dateFormatter);
    };

    ChartFormatter.prototype._getMediumMonthFormatter = function () {
        var dateFormatter = DateFormat.getDateTimeInstance({pattern: 'MMM'});
        return dateFormatter.format.bind(dateFormatter);
    };

    ChartFormatter.prototype._getMediumDayFormatter = function () {
        var dateFormatter = DateFormat.getDateTimeInstance({pattern: 'dd'});
        return dateFormatter.format.bind(dateFormatter);
    };

    ChartFormatter.prototype._getMediumHourFormatter = function () {
        var dateFormatter = DateFormat.getDateTimeInstance({pattern: 'HH'});
        return dateFormatter.format.bind(dateFormatter);
    };

    ChartFormatter.prototype._getMediumMinuteFormatter = function () {
        var dateFormatter = DateFormat.getDateTimeInstance({pattern: 'mm'});
        return dateFormatter.format.bind(dateFormatter);
    };

    ChartFormatter.prototype._getQuarterFormatter = function () {
        var dateFormatter = DateFormat.getDateInstance({pattern: "qqq"});
        return dateFormatter.format.bind(dateFormatter);
    };

    ChartFormatter.prototype._getWeekFormatter = function () {
        var dateFormatter = DateFormat.getDateInstance({pattern: "www"});
        return dateFormatter.format.bind(dateFormatter);
    };

    ChartFormatter.prototype._getCVOMHourMinuteFormatter = function (value) {
        return this.formatFunctions["MediumHour"](value)
            + semicolon + this.formatFunctions["MediumMinute"](value);
    };

    ChartFormatter.prototype._getCVOMHourZeroFormatter = function (value) {
        return this.formatFunctions["MediumHour"](value) + semicolon + "00";
    };

    ChartFormatter.prototype._getCVOMHMSFormatter = function (value) {
        return this.formatFunctions["MediumHour"](value) +
            semicolon +
            this.formatFunctions["MediumMinute"](value) +
            semicolon +
            this.formatFunctions["MediumSecond"](value);
    };

    ChartFormatter.prototype._getCVOMSecondFormatter = function (value) {
        return this.formatFunctions["MediumSecond"](value) + "''";
    };

    ChartFormatter.prototype._getCVOMMonthFormatter = function (value) {
        return this.formatFunctions["MediumMonth"](value);
    };

    ChartFormatter.prototype._getCVOMDayFormater = function (value) {
        return this.formatFunctions["MediumDay"](value);
    };

    ChartFormatter.prototype._getCVOMMonthDayFormatter = function (value) {
        return this.formatFunctions["MediumMonth"](value)
            + " " + this.formatFunctions["MediumDay"](value);
    };

    ChartFormatter.prototype._getCVOMYearMonthDayFormatter = function (value) {
        return this.formatFunctions["YearMonthDay"](value);
    };

    ChartFormatter.prototype._getMediumSecondFormatter = function () {
        var dateFormatter = DateFormat.getDateTimeInstance({pattern: 'ss'});
        return dateFormatter.format.bind(dateFormatter);
    };

    ChartFormatter.prototype._getYearMonthDayFormatter = function () {
        var dateFormatter = DateFormat.getDateInstance({style: 'medium'});
        return dateFormatter.format.bind(dateFormatter);
    };

    ChartFormatter.prototype._getCVOMPercentFormatter = function (value) {
        var numberFormatter = NumberFormat.getPercentInstance({style: 'precent', maxFractionDigits: 1});
        return numberFormatter.format(value);
    };

    ChartFormatter.prototype._getCVOMShortFloatFormatter = function (value) {
        var numberFormatter = NumberFormat.getIntegerInstance({style: 'short', maxFractionDigits: 1});
        return numberFormatter.format(value);
    };

    ChartFormatter.prototype._getBinaryFileSizeFormatter = function () {
        var fileSizeFormatter = FileSizeFormat.getInstance({binaryFilesize: true});
        return fileSizeFormatter.format.bind(fileSizeFormatter);
    };

    ChartFormatter.prototype._getDecimalFileSizeFormatter = function () {
        var fileSizeFormatter = FileSizeFormat.getInstance({binaryFilesize: false});
        return fileSizeFormatter.format.bind(fileSizeFormatter);
    };

    ChartFormatter.prototype.registerCustomFormatter = function (pattern, formatter) {
        this.formatFunctions[pattern] = formatter;
    };

    return ChartFormatter;
}, true);

