/** Copyright © 2015 SAP SE or an affiliate company. All rights reserved.**/

define(["./Constants"], function() {
    return {

        onAfterCoreStarted: function() {
            window.console && window.console.log("The catalogsystem Plugin started...");           
        }
    };
});