define([], 
function () {
    "use strict";
    var beautify =
    {
        _beautifiers : {},
        configure : function(mConfig) {
            var beautifiers = mConfig.beautifier || [];
            var that = this;
            beautifiers.forEach(function(beautifier) {
                if (beautifier) {
                    var fileExtensions = beautifier.fileExtensions || [];
                    for (var i = 0; i < fileExtensions.length; i++) {
                        var extension = fileExtensions[i];
                        if (!extension) {
                            that.context.service.log.warn(that.context.service.beautifierProcessor.getProxyMetadata().getName(),
                            "Invalid extension configured for beautifier " + beautifier.name + ".this beautifier will be ignored.",
                            [ "user" ]).done();
                        }
                        if (!that._beautifiers[extension]) {
                            that._beautifiers[extension] = beautifier.service;
                        } else {
                            that.context.service.log.warn(that.context.service.beautifierProcessor.getProxyMetadata().getName(),
                            "Beautifier for file of type " + extension + "already defined. Beautifier " + beautifier.name + " will be ignored.",
                            [ "user" ]).done();
                        }
                    }
                }
            });
        },
        beautify: function(aContent, aFileExtension, aSettings) {
            var concreteBeautifierService = this._beautifiers[aFileExtension];
		    if (concreteBeautifierService) {
	            return concreteBeautifierService.beautify(aContent, aSettings);
		    }
            return Q(aContent);
        },
        hasBeautifierForFileExtension: function(aFileExtension) {
            var concreteBeautifierService = this._beautifiers[aFileExtension];
            return !(concreteBeautifierService === null || concreteBeautifierService === undefined);
        },
        getBeautifiedExtentions: function(){
           var aExtentions = [];
           try {
               for (var key in this._beautifiers){
                   if (this._beautifiers.hasOwnProperty(key)){
                       aExtentions.push(key);
                   }
               }
           }catch (err) {
                this.context.service.log.error(this.context.service.beautifierProcessor.getProxyMetadata().getName(), "configuration variable object not initialized properly", ["user"]).done();
           }
           return aExtentions;
        }
    };

    return beautify;
});