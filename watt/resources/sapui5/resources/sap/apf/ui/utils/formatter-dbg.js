/*!
 * SAP APF Analysis Path Framework
 * 
 * (c) Copyright 2012-2014 SAP SE. All rights reserved
 */
/**
 * @class utils
 * @name utils
 * @memberOf sap.apf.ui.utils
 * @description holds utility functions used by UI5ChartHelper and representations 
 */
jQuery.sap.declare("sap.apf.ui.utils.formatter");
/**
 * @class formatter
 * @name formatter
 * @memberOf sap.apf.ui.utils
 * @param oFormatterArgs - getEventCallback, getTextNotHtmlEncoded
 * @param {sap.apf.core.Metadata} metadata
 * @param {array} dataResponse
 * @description holds utility functions used by UI5ChartHelper and  representations 
 */
sap.apf.ui.utils.formatter = function(oFormatterArgs, metadata, dataResponse) {
	var self = this;
	//metadata is either the the sap.apf.core.entityTypeMetadata or only the particular metadata of the property(Currently in case of facet filters)
	this.metadata = metadata;
	this.dataResponse = dataResponse;
	/**
	 * @memberOf sap.apf.ui.utils.formatter
	 * @method getPropertyMetadata
	 * @returns the metadata of the property passed
	 */
	this.getPropertyMetadata = function(fieldName) {
		if (this.metadata && this.metadata.getPropertyMetadata) {
			return this.metadata.getPropertyMetadata(fieldName);
		}
		return this.metadata;
	};
	/**
	 * @memberOf sap.apf.ui.utils.formatter
	 * @method getFormattedValue
	 * @description formats the given value
	 * @returns formatted value according to the type
	 */
	this.getFormattedValue = function(fieldName, originalFieldValue) {
		var formattedFieldValue, yearMetadata, quarterMetadata, dateFromMetadata, yearInfoFromDate, weekMetadata, dateFormat;
		var oMetadata = this.getPropertyMetadata(fieldName);
		if (oMetadata.isCalendarYearMonth) { //calenderYearMonth
			if (originalFieldValue !== null) {
				formattedFieldValue = this.doYearMonthFormat(originalFieldValue);
			} else {
				formattedFieldValue = "";
			}
		} else if (oMetadata.dataType && oMetadata.dataType.type === "Edm.DateTime") { //dateTime
			if (originalFieldValue !== null) {
				dateFormat = new Date(parseInt(originalFieldValue.slice(6, originalFieldValue.length - 2), 10));
				dateFormat = dateFormat.toLocaleDateString();
				if (dateFormat === "Invalid Date") {
					formattedFieldValue = "-";
				} else {
					formattedFieldValue = dateFormat;
				}
			} else {
				formattedFieldValue = "-";
			}
		} else if (oMetadata.unit) { //unit for currency
			if (originalFieldValue !== null) {
				var currencyMetadata = self.getPropertyMetadata(oMetadata.unit);
				if (currencyMetadata.semantics === "currency-code") {
					var precision = this.dataResponse[0][oMetadata.scale];
					originalFieldValue = parseFloat(originalFieldValue).toFixed(precision).toString();
					var store = originalFieldValue.split(".");
					var amountValue = parseFloat(store[0]).toLocaleString();
					var sample = 0.1;
					sample = sample.toLocaleString();
					if (amountValue.split(sample.substring(1, 2)).length > 1) {
						amountValue = amountValue.split(sample.substring(1, 2))[0];
					}
					amountValue = amountValue.concat(sample.substring(1, 2), store[1]);
					formattedFieldValue = amountValue;
				} else {
					formattedFieldValue = originalFieldValue;
				}
			} else {
				formattedFieldValue = "-";
			}
		} else if (oMetadata.isCalendarDate) {
			if (originalFieldValue !== null) {
				yearMetadata = originalFieldValue.substr(0, 4);
				var monthMetadata = parseInt(originalFieldValue.substr(4, 2), 10) - 1;
				var dateMetadata = originalFieldValue.substr(6, 2);
				dateFormat = new Date(yearMetadata, monthMetadata, dateMetadata);
				dateFormat = dateFormat.toLocaleDateString();
				if (dateFormat === "Invalid Date") {
					formattedFieldValue = "-";
				} else {
					formattedFieldValue = dateFormat;
				}
			} else {
				formattedFieldValue = "-";
			}
		} else if (oMetadata.isCalendarYearQuarter) {
			if (originalFieldValue !== null) {
				yearMetadata = originalFieldValue.substr(0, 4);
				quarterMetadata = originalFieldValue.substr(4, 1);
				dateFromMetadata = new Date(yearMetadata);
				yearInfoFromDate = dateFromMetadata.getFullYear();
				var quarterInfo;
				quarterInfo = "Q" + quarterMetadata;
				var formattedYearQuarter = quarterInfo + " " + yearInfoFromDate;
				formattedFieldValue = formattedYearQuarter;
			} else {
				formattedFieldValue = "";
			}
		} else if (oMetadata.isCalendarYearWeek) {
			if (originalFieldValue !== null) {
				yearMetadata = originalFieldValue.substr(0, 4);
				weekMetadata = originalFieldValue.substr(4, 2);
				dateFromMetadata = new Date(yearMetadata);
				yearInfoFromDate = dateFromMetadata.getFullYear();
				var weekInfo;
				weekInfo = "CW" + weekMetadata;
				var formattedYearWeek = weekInfo + " " + yearInfoFromDate;
				formattedFieldValue = formattedYearWeek;
			} else {
				formattedFieldValue = "";
			}
		} else { //default value
			if (originalFieldValue === null) {
				formattedFieldValue = "null";
			} else {
				formattedFieldValue = originalFieldValue;
			}
		}
		// application formatter callback
		var metadataObject = jQuery.extend({}, this.getPropertyMetadata(fieldName));
		formattedFieldValue = this._applyCustomFormatting(metadataObject, fieldName, originalFieldValue, formattedFieldValue);
		return formattedFieldValue;
	};
	/**
	 * @memberOf sap.apf.ui.utils.formatter
	 * @method doYearMonthFormat
	 * @param fieldValue
	 * @description yearMonth formatting 
	 */
	this.doYearMonthFormat = function(fieldValue) {
		var jan = oFormatterArgs.getTextNotHtmlEncoded("month-1-shortName");
		var feb = oFormatterArgs.getTextNotHtmlEncoded("month-2-shortName");
		var mar = oFormatterArgs.getTextNotHtmlEncoded("month-3-shortName");
		var apr = oFormatterArgs.getTextNotHtmlEncoded("month-4-shortName");
		var may = oFormatterArgs.getTextNotHtmlEncoded("month-5-shortName");
		var jun = oFormatterArgs.getTextNotHtmlEncoded("month-6-shortName");
		var jul = oFormatterArgs.getTextNotHtmlEncoded("month-7-shortName");
		var aug = oFormatterArgs.getTextNotHtmlEncoded("month-8-shortName");
		var sep = oFormatterArgs.getTextNotHtmlEncoded("month-9-shortName");
		var oct = oFormatterArgs.getTextNotHtmlEncoded("month-10-shortName");
		var nov = oFormatterArgs.getTextNotHtmlEncoded("month-11-shortName");
		var dec = oFormatterArgs.getTextNotHtmlEncoded("month-12-shortName");
		var monthsArray = [ jan, feb, mar, apr, may, jun, jul, aug, sep, oct, nov, dec ];
		var year = fieldValue.substr(0, 4);
		var month = monthsArray[fieldValue.substr(4, 6) - 1];
		return month + " " + year;
	};
	/**
	 * @memberOf sap.apf.ui.utils.formatter
	 * @method isAmountField
	 * @param fieldName
	 * @description checks if the field is amount field 
	 */
	this.isAmountField = function(fieldName) {
		var isAmntField = false;
		if (this.metadata && this.dataResponse) {
			var oMetadata = this.getPropertyMetadata(fieldName);
			if (oMetadata !== undefined && oMetadata.unit) {
				var currencyMetadata = this.getPropertyMetadata(oMetadata.unit);
				if (currencyMetadata !== undefined && currencyMetadata.semantics === "currency-code") {
					isAmntField = true;
				}
			}
		}
		return isAmntField;
	};
	/**
	 * @method getPrecision
	 * @param fieldName
	 * @description gets the precision for a given fieldName 
	 */
	this.getPrecision = function(fieldName) {
		var oMetadata = this.getPropertyMetadata(fieldName);
		if (oMetadata !== undefined && this.dataResponse !== undefined && this.dataResponse[0] !== undefined) {
			return this.dataResponse[0][oMetadata.scale];
		}
	};
	/**
	 * @method getFormatString
	 * @param measures- measures of chart
	 * @description returns the stringFormat 
	 */
	this.getFormatString = function(measure) {
		var zeroStr = "";
		var sFormatString;
		var fieldName = measure.fieldName;
		var isAmountField = this.isAmountField(fieldName);
		if (isAmountField === true) {
			//check for precision point
			var precision = this.getPrecision(fieldName);
			if (precision !== undefined) {
				for( var i = 0; i < precision; i++) {
					zeroStr = zeroStr + "0";
				}
				sFormatString = "#,#0" + "." + zeroStr;
			} else {
				sFormatString = "";
			}
		} else {
			sFormatString = "";
		}
		return sFormatString;
	};
	/**
	 * @method getFormattedValueForTextProperty
	 * @param {oTextToBeFormatted} - the texts which has to be concatenated 
	 *    oTextToBeFormatted ={
	 *                         text:textField,
	 *                        key:fieldName
	 *                        }
	 * @description returns the concatenated string (e.g. Customer Name(Customer Id) for a text field 
	 */
	this.getFormattedValueForTextProperty = function(fieldName, oTextToBeFormatted) {
		var sFormattedText;
		if (oTextToBeFormatted.key) {
			sFormattedText = oTextToBeFormatted.text + "(" + oTextToBeFormatted.key + ")";
		} else {
			sFormattedText = oTextToBeFormatted.text;
		}
		var metadataObject = jQuery.extend({}, this.getPropertyMetadata(fieldName));
		sFormattedText = this._applyCustomFormatting(metadataObject, fieldName, oTextToBeFormatted.text, sFormattedText);// application formatter callback
		return sFormattedText;
	};
	/**
	 * @private
	 * @method _applyCustomFormatting
	 * @description calls the application specific formatting if it is available
	 */
	this._applyCustomFormatting = function(metadataObject, fieldName, originalFieldValue, formattedFieldValue) {
		var callback = oFormatterArgs.getEventCallback(sap.apf.core.constants.eventTypes.format);
		if (typeof callback === "function") {
			var appFormattedFieldValue = callback.apply(oFormatterArgs, [ metadataObject, fieldName, originalFieldValue, formattedFieldValue ]);
			if (appFormattedFieldValue !== undefined) {
				formattedFieldValue = appFormattedFieldValue;
			}
			if (appFormattedFieldValue === null) {
				formattedFieldValue = "";
			}
		}
		return formattedFieldValue;
	};
	/**
	* @method destroy
	* @description Preparation of the instance for garbage collection 
	*/
	this.destroy = function() {
		self.metadata = null;
		self.dataResponse = null;
	};
};