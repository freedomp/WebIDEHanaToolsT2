// Copyright (c) 2015 SAP SE, All Rights Reserved

/**
 * Main module for the RequireJS Loader
 */

/*eslint-disable max-params*/
define(
    [
        "converttohdbcds/ConvertToHdi",
        "converttohdbcds/Converter",
        "converttohdbcds/Log"
    ],
    function (ConvertToHdi, Converter, Log) {
        "use strict";

        function displayMessages(messages, displayFun) {
            var hasErrors = false;
            for( var i = 0; i< messages.length; ++i) {
                var message = messages[i];
                if (message.type === "ERROR") {
                    hasErrors = true;
                }
                var text = message.message[0];
                for ( var j = 1; j < message.message.length; j++) {
                    text = text.replace('{' + (j - 1) + '}', message.message[j]);
                }
                displayFun(message, text);
            }
            return hasErrors;
        }

        return {
            ConvertToHdi: ConvertToHdi,
            Converter: Converter,
            Log: Log,
            displayMessages: displayMessages
        };
    }
);
