/*
 * RequireJS module with API:
 * <ul>
 * <li>AdtFreezerFactory.createFreezer, createPrototypeFreezer
 * <li>Freezer and its methods
 * <li>PrototypeFreezer and its methods
 * </ul>
 */
define( //Define this module as requireJS module and its dependencies to other requireJS modules
    [ ],
    function () {

        "use strict"; //$NON-NLS-1$

        var defaultFreezer = new Freezer();
        var prototypeFreezer = new PrototypeFreezer();

        function AdtFreezerFactory(){

            this.createFreezer = function(settings){
                var freezer = new Freezer(settings);
                defaultFreezer.makeImmutable(freezer);
                return freezer;
            };

            this.createPrototypeFreezer = function(settings){
                var freezer = new PrototypeFreezer(settings);
                defaultFreezer.makeImmutable(freezer);
                return freezer;
            };
        }
        prototypeFreezer.makeImmutable(AdtFreezerFactory.prototype);

        /**
         * The Freezer has the task to make a given object or function immutable (for ever, i.e. it cannot be undone).
         * It is created with certain settings controlling its behavior:
         * <br>
         *     settings.freezeDeeply
         *     settings.freezeInheritedProperties
         *     settings.freezeFunctions
         * <br>
         * If the settings or one of its components is missing, then the default-values (true) are used.
         * @param settings
         */
        function Freezer(settings) {

            var that = this; // Prevent that someone calls public methods with call/apply and overwrites the this-reference used in the public method

            // Ensure preconditions
            if (!Object.freeze || !Object.isFrozen) {
                this.makeImmutable = function () {
                    return false; // no chance, the browser version is too old and does not support ECMA Script 5
                };
                return;
            }
            var correctedSettings; // do not change the argument, it's owned by the caller
            if (!settings) {
                correctedSettings = {freezeDeeply: true, freezeInheritedProperties: true, freezeFunctions: true};
            } else {
                correctedSettings = settings;
                if (typeof settings.freezeDeeply !== "boolean") {
                    correctedSettings.freezeDeeply = true;
                }
                if (typeof settings.freezeInheritedProperties !== "boolean") {
                    correctedSettings.freezeInheritedProperties = true;
                }
                if (typeof settings.freezeFunctions !== "boolean") {
                    correctedSettings.freezeFunctions = true;
                }
            }

            /**
             * The method makes the given <code>argument</code> immutable according to the settings .
             * @param argument
             * @returns {boolean} Returns <code>true</code> in case the given <code>argument</code> could be made
             * immutable without any failures or if no operation is possible due to the type of the <code>argument</code>
             */
            this.makeImmutable = function (argument) {

                if (argument === null || (typeof argument !== "object" && !(typeof argument === "function" && correctedSettings.freezeFunctions))) {
                    return true; // no op
                }
                try {
                    if (!Object.isFrozen(argument)) {
                        Object.freeze(argument);
                    }
                    var result = true;
                    if (correctedSettings.freezeDeeply) {
                        var propertyValue;
                        for (var propertyName in argument) {
                            if (argument.hasOwnProperty(propertyName) || correctedSettings.freezeInheritedProperties) {
                                propertyValue = argument[propertyName];
                                result = result && that.makeImmutable(propertyValue);
                            }
                        }
                    }
                } catch (e) {
                    result = false; // failure
                }
                return result;
            };
        }
        prototypeFreezer.makeImmutable(Freezer.prototype);

        /**
         * The PrototypeFreezer has the task to make immutable a given prototype:
         * <ul>
         *     <li> it makes the prototype itself immutable
         *     <li> it makes the properties (own objects and functions) of the prototype immutable (1 level)
         * </ul>
         * Disclaimer:<br>
         * The PrototypeFreezer intentionally does neither deeply freeze all the prototypes on the prototype chain
         * nor freeze inherited properties, because we cannot expect all those prototypes and properties
         * to belong to our area and that they shall be frozen. If some of those prototypes or properties shall be
         * made immutable, then the caller has to do it explicitly.
         * @constructor
         */
        function PrototypeFreezer(settings) {

            // Ensure preconditions
            if (!Object.freeze || !Object.isFrozen) {
                this.makeImmutable = function () {
                    return false; // no chance, the browser version is too old and does not support ECMA Script 5
                };
                return;
            }

            // Settings for freezing the prototype itself are predefined
            var shallowFreezer = new Freezer({freezeDeeply: false, freezeInheritedProperties: false, freezeFunctions: true});
            // Settings for freezing the properties are given as argument
            var propertiesFreezer = new Freezer(settings);

            /**
             * Caution: The caller has to ensure that the argument is a prototype.
             * @param prototype
             */
            this.makeImmutable = function (prototype) {

                if (prototype === null || typeof prototype !== "object") {
                    return true; // no op
                }
                try {
                    var result = shallowFreezer.makeImmutable(prototype);
                    var propertyValue;
                    for (var propertyName in prototype) {
                        if (prototype.hasOwnProperty(propertyName)) {
                            propertyValue = prototype[propertyName];
                            result = result && propertiesFreezer.makeImmutable(propertyValue);
                        } // else: inherited properties have to be made immutable in the respective prototype explicitly
                    }
                } catch (e) {
                    result = false; // failure
                }
                return result;
            };
        }
        prototypeFreezer.makeImmutable(PrototypeFreezer.prototype);

        var factory = new AdtFreezerFactory();
        defaultFreezer.makeImmutable(factory);

        return factory;
    }
);
