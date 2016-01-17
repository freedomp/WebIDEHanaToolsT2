// Copyright (c) 2015 SAP SE, All Rights Reserved
define(
    [
    ],
    function () {
        "use strict";

        var ERROR = "ERROR";
        var WARNING = "WARNING";
        var INFO = "INFO";
        var CATEGORY = "CDS_MIGRATION";

//        Message = {
//            type: mc.ERROR,
//            message: ['Foo {0} ', “bar”],
//        category: mc.VIEW_MIGRATION,
//            id: mc.VIEW_MIGRATION + '_1',
//            file: path.join(context.config.directories['xs1-src'], fileObj.RunLocation)
//    }

        function Log() {
            this.messages = [];
        }

        Log.prototype.getMessages = function () {
            return this.messages;
        };

        Log.prototype.log = function (id, msgs) {
            this.messages.push( {type:INFO, id: CATEGORY + '_' + id, category:CATEGORY, message:msgs} );
        };

        Log.prototype.warn = function (id, msgs) {
            this.messages.push( {type:WARNING, id:CATEGORY + '_' + id, category:CATEGORY, message:msgs} );
        };

        Log.prototype.error = function (id, msgs) {
            this.messages.push( {type:ERROR, id:CATEGORY + '_' + id, category:CATEGORY, message:msgs} );
        };

        return Log;
    }
);

