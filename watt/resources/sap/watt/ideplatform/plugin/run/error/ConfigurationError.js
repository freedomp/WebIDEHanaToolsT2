define([], function() {
    var ConfigurationError = function(sMessage) {
        this.name = "ConfigurationError";
        this.message = sMessage;
        this.stack = (new Error()).stack;
    };
    
    ConfigurationError.prototype = Object.create(Error.prototype);
    ConfigurationError.prototype.constructor = ConfigurationError;
    
    return ConfigurationError;
});
