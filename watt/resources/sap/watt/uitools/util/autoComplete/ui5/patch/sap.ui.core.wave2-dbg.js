/**
 * Defines a controller class or creates an instance of an already defined controller class.
 *
 * When a name and a controller implementation object is given, a new controller class
 * of the given name is created. The members of the implementation object will be copied
 * into each new instance of that controller class (shallow copy).
 * <b>Note</b>: as the members are shallow copied, controller instances will share all object values.
 * This might or might not be what applications expect.
 *
 * If only a name is given, a new instance of the named Controller class is returned.
 *
 * @param {string} sName The Controller name
 * @param {object} [oControllerImpl] An object literal defining the methods and properties of the Controller
 * @return {void | sap.ui.core.mvc.Controller} void or the new controller instance, depending on the use case
 * @public
 * @function
 * @name sap.ui.controller
 */

/**
 * Retrieve the {@link sap.ui.core.Core SAPUI5 Core} instance for the current window.
 * @return {sap.ui.core.Core} the API of the current SAPUI5 Core instance.
 * @public
 * @function
 * @name sap.ui.getCore
 */ 

/**
 * Returns the event bus.
 * @return {sap.ui.core.EventBus} the event bus
 * @since 1.8.0
 * @function
 * @public
 * @name sap.ui.core.Core.prototype.getEventBus
 */

/**
 * Adds an event registration for the given object and given event name.
 * 
 * The channel "sap.ui" is reserved by th UI5 framework. An application might listen to events on this channel but is not allowed to publish own events there.
 *
 * @param {string}
 *            [sChannelId] The channel of the event to subscribe for. If not given the default channel is used.
 * @param {string}
 *            sEventId The identifier of the event to subscribe for
 * @param {function}
 *            fnFunction The function to call, when the event occurs. This function will be called on the
 *            oListener-instance (if present) or on the event bus-instance. This functions might have the following parameters: sChannelId, sEventId, oData.
 * @param {object}
 *            [oListener] The object, that wants to be notified, when the event occurs
 * @return {sap.ui.core.EventBus} Returns <code>this</code> to allow method chaining
 * @public
 * @function
 * @name sap.ui.core.EventBus.prototype.subscribe
 */

/**
 * Removes an event registration for the given object and given event name.
 *
 * The passed parameters must match those used for registration with {@link #subscribe } beforehand!
 *
 * @param {string}
 *            [sChannelId] The channel of the event to unsubscribe from. If not given the default channel is used.
 * @param {string}
 *            sEventId The identifier of the event to unsubscribe from
 * @param {function}
 *            fnFunction The function to call, when the event occurs.
 * @param {object}
 *            [oListener] The object, that wants to be notified, when the event occurs
 * @return {sap.ui.core.EventBus} Returns <code>this</code> to allow method chaining
 * @public
 * @function
 * @name sap.ui.core.EventBus.prototype.unsubscribe
 */

/**
 * Fires the given event and notifies all listeners. Listeners must not change the content of the event.
 * 
 * The channel "sap.ui" is reserved by the UI5 framework. An application might listen to events 
 * on this channel but is not allowed to publish own events there.
 *
 * @param {string}
 *            [sChannelId] The channel of the event; if not given the default channel is used
 * @param {string}
 *            sEventId The identifier of the event
 * @param {object}
 * 			  [oData] the parameter map
 * @public
 * @function
 * @name sap.ui.core.EventBus.prototype.publish
 */

/**
 * Cancel bubbling of the event.
 * @public
 * @function
 */
sap.ui.base.Event.prototype.cancelBubble = function() {

/**
 * Returns the id of the event
 * @return {string} The id of the event
 * @public
 * @function
 */
sap.ui.base.Event.prototype.getId = function() {

/**
 * Returns all parameter values of the event keyed by their names.
 * @return {map} All parameters of the event keyed by name
 * @public
 * @function
 */
sap.ui.base.Event.prototype.getParameters = function() {

/**
 * Returns the value of the parameter with the given sName.
 *
 * @param {string} sName the name of the parameter to return
 * @return {any} the value for the named parameter
 * @public
 * @function
 */
sap.ui.base.Event.prototype.getParameter = function(sName) {

/**
 * Returns the source of the event
 * @return {sap.ui.base.EventProvider} The source of the event
 * @public
 * @function
 */
sap.ui.base.Event.prototype.getSource = function() {

/**
 * Prevent the default action of this event.
 * @public
 * @function
 */
sap.ui.base.Event.prototype.preventDefault = function() {


/**
 * Declares a module as existing.
 *
 * By default, this function assumes that the module will create a JavaScript object
 * with the same name as the module. As a convenience it ensures that the parent
 * namespace for that object exists (by calling jQuery.sap.getObject).
 * If such an object creation is not desired, <code>bCreateNamespace</code> must be set to false.
 *
 * @param {string | object} sModuleName name of the module to be declared
 *                           or in case of an object {modName: "...", type: "..."}
 *                           where modName is the name of the module and the type
 *                           could be a specific dot separated extension e.g.
 *                           <code>{modName: "sap.ui.core.Dev", type: "view"}</code>
 *                           loads <code>sap/ui/core/Dev.view.js</code> and
 *                           registers as <code>sap.ui.core.Dev.view</code>
 * @param {boolean} [bCreateNamespace=true] whether to create the parent namespace
 *
 * @public
 * @static
 * @function
 * @name jQuery.sap.declare
 */

/**
 * Ensures that the given module is loaded and executed before execution of the
 * current script continues.
 *
 * By issuing a call to this method, the caller declares a dependency to the listed modules.
 *
 * Any required and not yet loaded script will be loaded and execute synchronously.
 * Already loaded modules will be skipped.
 *
 * @param {string | string[] | object} sModuleName one or more names of modules to be loaded
 *                              or in case of an object {modName: "...", type: "..."}
 *                              where modName is the name of the module and the type
 *                              could be a specific dot separated extension e.g.
 *                              <code>{modName: "sap.ui.core.Dev", type: "view"}</code>
 *                              loads <code>sap/ui/core/Dev.view.js</code> and
 *                              registers as <code>sap.ui.core.Dev.view</code>
 *
 * @public
 * @static
 * @function
 * @SecSink {0|PATH} Parameter is used for future HTTP requests
 * @name jQuery.sap.require
 */

/**
 * The AppCacheBuster is used to hook into URL relevant functions in jQuery
 * and SAPUI5 and rewrite the URLs with a timestamp segment. The timestamp
 * information is fetched from the server and used later on for the URL
 * rewriting.
 *  
 * @namespace
 * @public
 */
sap.ui.core.AppCacheBuster = {

/**
 * Registers an application. Loads the cachebuster index file from this
 * locations. All registered files will be considered by the cachebuster
 * and the URLs will be prefixed with the timestamp of the index file.
 * 
 * @param {string} base URL of an application providing a cachebuster index file
 * 
 * @function
 * @public
 */
register: function(sBaseUrl) {
	fnRegister(sBaseUrl);
}

/**
 * Converts the given URL if it matches a URL in the cachebuster index. 
 * If not then the same URL will be returned. To prevent URLs from being
 * modified by the application cachebuster you can implement the function
 * <code>sap.ui.core.AppCacheBuster.handleURL</code>. 
 * 
 * @param {string} sUrl any URL
 * @return {string} modified URL when matching the index or unmodified when not
 * 
 * @function
 * @public
 */
convertURL: function(sUrl) {

/**
 * Normalizes the given URL and make it absolute.
 * 
 * @param {string} sUrl any URL
 * @return {string} normalized URL
 * 
 * @function
 * @public
 */
normalizeURL: function(sUrl) {

/**
 * Callback function which can be overwritten to programmatically decide
 * whether to rewrite the given URL or not. 
 * 
 * @param {string} sUrl any URL
 * @return {boolean} <code>true</code> to rewrite or <code>false</code> to ignore 
 * 
 * @function
 * @public
 */
handleURL: function(sUrl) {

/**
 * Internet Explorer browser name.
 * 
 * @see sap.ui.Device.browser#name
 * @name sap.ui.Device.browser.BROWSER#INTERNET_EXPLORER
 * @public
 * @type string
 */
/**
 * Firefox browser name.
 * 
 * @see sap.ui.Device.browser#name
 * @name sap.ui.Device.browser.BROWSER#FIREFOX
 * @public
 * @type string
 */
/**
 * Chrome browser name.
 * 
 * @see sap.ui.Device.browser#name
 * @name sap.ui.Device.browser.BROWSER#CHROME
 * @public
 * @type string
 */
/**
 * Safari browser name.
 * 
 * @see sap.ui.Device.browser#name
 * @name sap.ui.Device.browser.BROWSER#SAFARI
 * @public
 * @type string
 */
/**
 * Android stock browser name.
 * 
 * @see sap.ui.Device.browser#name
 * @name sap.ui.Device.browser.BROWSER#ANDROID
 * @public
 * @type string
 */
 
/**
 * Windows operating system name.
 * 
 * @see sap.ui.Device.os#name
 * @name sap.ui.Device.os.OS#WINDOWS
 * @public
 * @type string
 */
/**
 * MAC operating system name.
 * 
 * @see sap.ui.Device.os#name
 * @name sap.ui.Device.os.OS#MACINTOSH
 * @public
 * @type string
 */
/**
 * Linux operating system name.
 * 
 * @see sap.ui.Device.os#name
 * @name sap.ui.Device.os.OS#LINUX
 * @public
 * @type string
 */
/**
 * iOS operating system name.
 * 
 * @see sap.ui.Device.os#name
 * @name sap.ui.Device.os.OS#IOS
 * @public
 * @type string
 */
/**
 * Android operating system name.
 * 
 * @see sap.ui.Device.os#name
 * @name sap.ui.Device.os.OS#ANDROID
 * @public
 * @type string
 */
/**
 * Blackberry operating system name.
 * 
 * @see sap.ui.Device.os#name
 * @name sap.ui.Device.os.OS#BLACKBERRY
 * @public
 * @type string
 */
/**
 * Windows Phone operating system name.
 * 
 * @see sap.ui.Device.os#name
 * @name sap.ui.Device.os.OS#WINDOWS_PHONE
 * @public
 * @type string
 */
