(function(scope) {
    // Define sap.galilei.gravity
	var sap = scope.sap;
	if (sap) {
		var galilei = sap.galilei;
		if (galilei) {
			var gravity = galilei.gravity;
			if (!gravity) {
                galilei.gravity = {};
			} 
		} else {
			sap.galilei = {gravity: {}};
		}
	} else {
		scope.sap = {galilei: {gravity: {}}};
	}
}(this));

sap.galilei.gravity.beget = function(base, extensions) {
        var F = function() {}; // Create a temporary constructor function
        var prop;
        F.prototype = base; // Set base object (which you want to clone) as
							// the function's prototype
        var obj = new F(); // Invoke the constructor, yielding a new object
							// which inherits from this object
        obj.constructor = F;  
        
        // If supplied, cycle though all own properties of the extensions
		// object and assign them to the new object
        if (extensions) {
                for (prop in extensions) {
                        if (extensions.hasOwnProperty(prop)) {
                                obj[prop] = extensions[prop];
                        }
                }
        }
        
        return obj;
};

/**
 * 
 * @return
 */
(function setUpLogging() {
	var enabled = true;
    var loggers = {};
    var currentLogLevel = log4javascript.Level.ALL;

    this.sap.galilei.gravity.getLogger = function (name) {
        var logger;
        if (loggers[name]) {
            return loggers[name];
        } else {
            if (typeof(Envjs) !== "undefined") {
                logger = {
                    info: function(msg) {
                        if (enabled) {
                           java.lang.System.out.println("[INFO] " + name + " - " + msg);
                        }
                    },
                
                    debug: function(msg) {
                        if (enabled) {
                            java.lang.System.out.println("[DEBUG] " + name + " - " + msg);                 
                        }
                    },
                
                    warn: function(msg) {
                        if (enabled) {
                            java.lang.System.out.println("[WARN]  " + name + " - " + msg);                 
                        }
                    },
                
                    error: function(msg) {
                        if (enabled) {
                            java.lang.System.err.println("[ERROR] " + name + " - " + msg);                 
                        }
                    },
                
                    fatal: function(msg) {
                        if (enabled) {
                            java.lang.System.err.println("[FATAL] " + name + " - " + msg);                 
                        }
                    }
                };
            } else {
                logger = log4javascript.getLogger(name);
                var appender = new log4javascript.BrowserConsoleAppender();
                logger.setLevel(currentLogLevel);
                log4javascript.setEnabled(true);
                var layout = new log4javascript.PatternLayout("%d{HH:mm:ss} %-5p %c - %m%n");
                appender.setLayout(layout);
                logger.addAppender(appender);
            }
        }
        loggers[name]= logger;
        return logger;
        
    };    
    
    if (typeof(Envjs) !== "undefined") {
        // we have to fix up the console, it is broken!
        sap.galilei.gravity.log = {
                info: function(msg) {
                    if (enabled) {
                        java.lang.System.out.println(msg);
                    }
                },

                debug: function(msg) {
                    if (enabled) {
                        java.lang.System.out.println(msg);
                    }
                },

                warn: function(msg) {
                    if (enabled) {
                        java.lang.System.out.println(msg);
                    }
                },

                error: function(msg) {
                    if (enabled) {
                        java.lang.System.err.println(msg);
                    }
                },

                fatal: function(msg) {
                    if (enabled) {
                        java.lang.System.err.println(msg);
                    }
                }
        };
    } else {
        sap.galilei.gravity.log = this.sap.galilei.gravity.getLogger("Gravity");
    }

    /**
	 * start logging
	 */
    this.sap.galilei.gravity.startLogging = function () {
        if (typeof(Envjs) !== "undefined") {
            enabled = true;
        } else {
            log4javascript.setEnabled(true);
        }
    };
    
    /**
	 * stop logging
	 */
    sap.galilei.gravity.stopLogging = function () {
        if (typeof(Envjs) !== "undefined") {
            enabled = false;
        } else {
            log4javascript.setEnabled(false);
        }
    };
    
    sap.galilei.gravity.setLogLevel = function (logLevel) {
        var level = logLevel.toUpperCase();
        if (typeof (level)!== 'string') {
            throw "level should be a string with one of the following values: 'info', 'warn', 'error', 'none'";
        }
        if (log4javascript.Level[level]) {
            currentLogLevel = log4javascript.Level[level];
        }
        for (var logger in loggers) {
            if (loggers.hasOwnProperty(logger)) {
                loggers[logger].setLevel(currentLogLevel);
            }
        }
    };
}());



sap.galilei.gravity.compare = function(timestamp, array) {
	if ($.isArray(array)) {
		for (var i=0, ii = Math.max(timestamp.length, array.length); i < ii; i+=1) {
			if ((timestamp[i] || 0) !== (array[i] || 0)) {
				return false;
			}
		}
		return true;
	}
	return false;
};


       
/**
 * compares one time stamp against another time stamp and returns true if
 * and only if the first timestamp is strictly prior to the other, i.e. if all components
 * of the first timestamp are less than or equal the corresponding component of second timestamp
 * and there is one component that is strictly less. Undefined components
 * are interpreted as zero.
 * 
 * @param {Array}
 *            timestamp1
 * @param {Array}
 *            timestamp2 
 * @return true if and only if timestamp1 is strictly prior (excludes equals) to timestamp2;
 */
sap.galilei.gravity.strictlyPrior = function(timestamp1, timestamp2) {
    var i=0; 
    var ii = Math.max(timestamp1.length, timestamp2.length);
    var number_of_components_less_than = 0;

    for (; i < ii; i+=1) {
        if ((timestamp1[i]||0) > (timestamp2[i]||0)) {
            return false;
        } else if ((timestamp1[i]||0) < (timestamp2[i]||0)) {
            // there has to be at least one component of timestamp1
            // that is less than the component of timestamp2
            // therefore we count how often that happens
            number_of_components_less_than += 1;
        }
    }
    return number_of_components_less_than > 0;
};


     
/**
 * compares two time stamps against each another time stamp and returns true if
 * and only if this is strictly prior to the other, i.e. if all components
 * of the first array are less than or equal the corresponding component of
 * array. Undefined components are interpreted as zero.
 * 
 * @param {Array}
 *            timestamp1
 * @param {Array}
 *            timestamp2
 * @return true if and only if timestamp1 is prior (includes equals) to timestamp2;
 */
sap.galilei.gravity.prior = function(array1, array2) {
    if (!$.isArray(array1) || !$.isArray(array2)) {
        return false;
    }
    var i = 0; 
    var ii = Math.max(array1.length, array2.length);
    for (; i < ii; i+=1) {
        if ((array1[i]||0) > (array2[i]||0)) {
            return false;
        } 
    }
    return true;
};



/**
 * compares this time stamp against another time stamp and returns true if
 * and only if both timestamps are equivalent to each other. Undefined components are
 * interpreted as zero.
 * 
 * @param {Array}
 *            timestamp1.
 * @param {Array}
 *            timestamp2    
 * @return true if and only if both timestamps are equivalent;
 */
sap.galilei.gravity.equals = function(timestamp1, timestamp2) {
    var i=0; 
    var ii = Math.max(timestamp1.length, timestamp2.length);

    for (; i < ii; i+=1) {
        if ((timestamp1[i]||0) !== (timestamp2[i]||0)) {
            return false;
        } 
    }
    return true;
};

//sap.galilei.gravity.compare = sap.galilei.gravity.equals;
//function(timestamp, array) {
//    if ($.isArray(array)) {
//        for (var i=0, ii = Math.max(timestamp.length, array.length); i < ii; i+=1) {
//            if ((timestamp[i] || 0) !== (array[i] || 0)) {
//                return false;
//            }
//        }
//        return true;
//    }
//    return false;
//};
