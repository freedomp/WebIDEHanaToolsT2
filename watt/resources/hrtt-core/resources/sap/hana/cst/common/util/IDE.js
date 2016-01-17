/** Copyright © 2015 SAP SE or an affiliate company. All rights reserved.**/

IDE = {

    configObject: {
        "Logger": {}
    },
    systemInfo: {
        "username": "SYSTEM"
    },

    subscribers: {},

    // Pub/Sub Handler
    subscribe: function(type, callback, scope) {
        if (this.hasSubscriber(type, callback, scope)) {
            //joe    Logger.info("The subscribe '" + type + "' already existed...");
            return;
        }

        var i;
        var args = [];
        var numOfArgs = arguments.length;
        for (i = 0; i < numOfArgs; i++) {
            args.push(arguments[i]);
        }
        args = args.length > 3 ? args.splice(3, args.length - 1) : [];
        if (typeof this.subscribers[type] != "undefined") {
            this.subscribers[type].push({
                scope: scope,
                callback: callback,
                args: args
            });
        } else {
            this.subscribers[type] = [{
                scope: scope,
                callback: callback,
                args: args
            }];
        }
    },

    unsubscribe: function(type, scope) {
        if (typeof this.subscribers[type] != "undefined") {
            var numOfCallbacks = this.subscribers[type].length;
            var newArray = [];
            for (var i = 0; i < numOfCallbacks; i++) {
                var subscriber = this.subscribers[type][i];
                if (subscriber.scope == scope) {

                } else {
                    newArray.push(subscriber);
                }
            }
            this.subscribers[type] = newArray;
        }
    },

    hasSubscriber: function(type, callback, scope) {
        if (typeof this.subscribers[type] != "undefined") {
            var numOfCallbacks = this.subscribers[type].length;
            if (callback === undefined && scope === undefined) {
                return numOfCallbacks > 0;
            }
            for (var i = 0; i < numOfCallbacks; i++) {
                var subscriber = this.subscribers[type][i];
                if (subscriber.scope == scope && subscriber.callback == callback) {
                    return true;
                }
            }
        }
        return false;
    },

    publish: function(type, target) {
        var numOfSubscribers = 0,
            i, numOfCallbacks, subscriber, concatArgs;
        var event = {
            type: type,
            target: target
        };
        var args = [];
        var numOfArgs = arguments.length;
        for (i = 0; i < numOfArgs; i++) {
            args.push(arguments[i]);
        }
        args = args.length > 2 ? args.splice(2, args.length - 1) : [];
        args = [event].concat(args);
        if (typeof this.subscribers[type] != "undefined") {
            numOfCallbacks = this.subscribers[type].length;
            for (i = 0; i < numOfCallbacks; i++) {
                subscriber = this.subscribers[type][i];
                if (subscriber && subscriber.callback) {
                    concatArgs = args.concat(subscriber.args);
                    subscriber.callback.apply(subscriber.scope, concatArgs);
                    numOfSubscribers += 1;
                }
            }
        }
    },

    getMessages: function() {
        var str = "",
            type,
            numOfCallbacks,
            i,
            subscriber;

        for (type in this.subscribers) {
            numOfCallbacks = this.subscribers[type].length;
            for (i = 0; i < numOfCallbacks; i++) {
                subscriber = this.subscribers[type][i];
                str += subscriber.scope && subscriber.scope.className ? subscriber.scope.className : "anonymous";
                str += " subscribed for '" + type + "'\n";
            }
        }
        return str;
    }

}