/** Copyright © 2015 SAP SE or an affiliate company. All rights reserved.**/

jQuery.sap.require("sap.ui.core.format.DateFormat");
define(function() {
	var compareDate = function(date1, date2) {
		try {
			if (!date1 || !date2) {
				return -1;
			}
			var dayDiff = Math.floor((date1.getTime() - date2.getTime()) / (1000 * 60 * 60 * 24));
			return dayDiff;
		} catch (e) {
			return 0;
		}
	};

	return {

		parseDate: function(sDate, sStyle) {
			try {
				if (!sDate || sDate === "0" || sDate === 0) {
					return null;
				}
				var oDateFormat = sap.ui.core.format.DateFormat.getDateTimeInstance({style: sStyle});
				var d = oDateFormat.parse(sDate, false, true);
				return d;
			} catch (e) {
				return null;
			}
		},
		
        
        //**
        // sStyle: "full", "long", "medium", "short"
        //
		formatDate: function(date, sStyle) {
		    var sResult = "";
		    var oDate = null;
		    if (["full", "long", "medium", "short"].indexOf(sStyle) === -1) {
		        sStyle = "medium";
		    }
			try {
				if (!date || date === "0") {
				    return "";
				}
				oDate = Date.parse(date);
				if (isNaN(oDate)) {
				    throw "Invalid Date";
				}
                var oDateFormat = sap.ui.core.format.DateFormat.getDateTimeInstance({style: sStyle});
			    sResult = oDateFormat.format(new Date(oDate));
			} catch (e) {
				return "Invalid Date";
			}
			return sResult;
		},

		/**
		 *
		 * @param date1
		 * @param date2
		 * @returns {Boolean}
		 */
		isDateEqual: function(date1, date2) {
			return (compareDate(date1, date2) === 0);
		},

		/**
		 *
		 * @param date1
		 * @param date2
		 * @returns 0 equal, > 0 greater, < 0 less
		 */
		compareDate: function(date1, date2) {
			return compareDate(date1, date2);
		}
	};
});