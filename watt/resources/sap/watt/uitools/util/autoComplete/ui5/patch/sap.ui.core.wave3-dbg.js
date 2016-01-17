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

/**
 * Creates a subclass of class sap.ui.app.Application with name <code>sClassName</code>
 * and enriches it with the information contained in <code>oClassInfo</code>.
 *
 * <code>oClassInfo</code> might contain three kinds of informations:
 * <ul>
 * <li><code>metadata:</code> an (optional) object literal with metadata about the class.
 * The information in the object literal will be wrapped by an instance of {@link sap.ui.base.Metadata Metadata}
 * and might contain the following information
 * <ul>
 * <li><code>interfaces:</code> {string[]} (optional) set of names of implemented interfaces (defaults to no interfaces)</li>
 * <li><code>publicMethods:</code> {string[]} (optional) list of methods that should be part of the public
 * facade of the class</li>
 * <li><code>abstract:</code> {boolean} (optional) flag that marks the class as abstract (purely informational, defaults to false)</li>
 * <li><code>final:</code> {boolean} (optional) flag that marks the class as final (defaults to false)</li>
 * </ul>
 * Subclasses of sap.ui.app.Application can enrich the set of supported metadata (e.g. see {@link sap.ui.core.Element.extend}).
 * </li>
 *
 * <li><code>constructor:</code> a function that serves as a constructor function for the new class.
 * If no constructor function is given, the framework creates a default implementation that delegates all
 * its arguments to the constructor function of the base class.
 * </li>
 *
 * <li><i>any-other-name:</i> any other property in the <code>oClassInfo</code> is copied into the prototype
 * object of the newly created class. Callers can thereby add methods or properties to all instances of the
 * class. But be aware that the given values are shared between all instances of the class. Usually, it doesn't
 * make sense to use primitive values here other than to declare public constants.
 * </li>
 *
 * </ul>
 *
 * The prototype object of the newly created class uses the same prototype as instances of the base class
 * (prototype chaining).
 *
 * A metadata object is always created, even if there is no <code>metadata</code> entry in the <code>oClassInfo</code>
 * object. A getter for the metadata is always attached to the prototype and to the class (constructor function)
 * itself.
 *
 * Last but not least, with the third argument <code>FNMetaImpl</code> the constructor of a metadata class
 * can be specified. Instances of that class will be used to represent metadata for the newly created class
 * and for any subclass created from it. Typically, only frameworks will use this parameter to enrich the
 * metadata for a new class hierarchy they introduce (e.g. {@link sap.ui.core.Element.extend Element}).
 *
 * @param {string} sClassName name of the class to be created
 * @param {object} [oClassInfo] structured object with informations about the class
 * @param {function} [FNMetaImpl] constructor function for the metadata object. If not given, it defaults to sap.ui.base.Metadata.
 * @return {function} the created class / constructor function
 * @public
 * @static
 * @name sap.ui.app.Application.extend
 * @function
 */
 
 /**
 * Creates a subclass of class sap.ui.core.UIComponent with name <code>sClassName</code>
 * and enriches it with the information contained in <code>oClassInfo</code>.
 *
 * <code>oClassInfo</code> might contain three kinds of informations:
 * <ul>
 * <li><code>metadata:</code> an (optional) object literal with metadata about the class.
 * The information in the object literal will be wrapped by an instance of {@link sap.ui.base.Metadata Metadata}
 * and might contain the following information
 * <ul>
 * <li><code>interfaces:</code> {string[]} (optional) set of names of implemented interfaces (defaults to no interfaces)</li>
 * <li><code>publicMethods:</code> {string[]} (optional) list of methods that should be part of the public
 * facade of the class</li>
 * <li><code>abstract:</code> {boolean} (optional) flag that marks the class as abstract (purely informational, defaults to false)</li>
 * <li><code>final:</code> {boolean} (optional) flag that marks the class as final (defaults to false)</li>
 * </ul>
 * Subclasses of sap.ui.core.UIComponent can enrich the set of supported metadata (e.g. see {@link sap.ui.core.Element.extend}).
 * </li>
 *
 * <li><code>constructor:</code> a function that serves as a constructor function for the new class.
 * If no constructor function is given, the framework creates a default implementation that delegates all
 * its arguments to the constructor function of the base class.
 * </li>
 *
 * <li><i>any-other-name:</i> any other property in the <code>oClassInfo</code> is copied into the prototype
 * object of the newly created class. Callers can thereby add methods or properties to all instances of the
 * class. But be aware that the given values are shared between all instances of the class. Usually, it doesn't
 * make sense to use primitive values here other than to declare public constants.
 * </li>
 *
 * </ul>
 *
 * The prototype object of the newly created class uses the same prototype as instances of the base class
 * (prototype chaining).
 *
 * A metadata object is always created, even if there is no <code>metadata</code> entry in the <code>oClassInfo</code>
 * object. A getter for the metadata is always attached to the prototype and to the class (constructor function)
 * itself.
 *
 * Last but not least, with the third argument <code>FNMetaImpl</code> the constructor of a metadata class
 * can be specified. Instances of that class will be used to represent metadata for the newly created class
 * and for any subclass created from it. Typically, only frameworks will use this parameter to enrich the
 * metadata for a new class hierarchy they introduce (e.g. {@link sap.ui.core.Element.extend Element}).
 *
 * @param {string} sClassName name of the class to be created
 * @param {object} [oClassInfo] structured object with informations about the class
 * @param {function} [FNMetaImpl] constructor function for the metadata object. If not given, it defaults to sap.ui.base.Metadata.
 * @return {function} the created class / constructor function
 * @public
 * @static
 * @name sap.ui.core.UIComponent.extend
 * @function
 */

/**
 * Get the metadata
 * 
 * @return {object} oMetadata
 * @public
 * @name sap.ui.base.ManagedObject#getMetadata
 * @function
 */

/**
 * Bind a property to the model.
 * The Setter for the given property will be called with the value retrieved
 * from the data model.
 * This is a generic method which can be used to bind any property to the
 * model. A managed object may flag properties in the metamodel with
 * bindable="bindable" to get typed bind methods for a property.
 *
 * @param {string} sName the name of the property
 * @param {object} oBindingInfo the binding information
 *
 * @return {sap.ui.base.ManagedObject} reference to the instance itself
 * @public
 * @name sap.ui.base.ManagedObject#bindProperty
 * @function
 */

/**
 * Bind an aggregation to the model.
 * 
 * The bound aggregation will use the given template, clone it for each item
 * which exists in the bound list and set the appropriate binding context.
 * This is a generic method which can be used to bind any aggregation to the
 * model. A managed object may flag aggregations in the metamodel with
 * bindable="bindable" to get typed bind<i>Something</i> methods for those aggregations.
 *
 * @param {string} sName the aggregation to bind
 * @param {object} oBindingInfo the binding info
 *
 * @return {sap.ui.base.ManagedObject} reference to the instance itself
 * @public
 * @name sap.ui.base.ManagedObject#bindAggregation
 * @function
 */

/**
 * Constructs an URL to load the module with the given name and file type (suffix).
 *
 * Searches the longest prefix of the given module name for which a registration
 * exists (see {@link jQuery.sap.registerModulePath}) and replaces that prefix
 * by the registered URL prefix.
 *
 * The remainder of the module name is appended to the URL, replacing any dot with a slash.
 *
 * Finally, the given suffix (typically a file name extension) is added (unconverted).
 *
 * The returned name (without the suffix) doesn't end with a slash.
 *
 * @param {string} sModuleName
 * @param {string} sSuffix
 *
 * @return {string} The returned name (without the suffix) doesn't end with a slash.
 * @public
 * @static
 * @function
 */
jQuery.sap.getModulePath = function(sModuleName, sSuffix) {
	return getResourcePath(ui5ToRJS(sModuleName), sSuffix);
};

/**
 * Returns the value(s) of the URI parameter with the given name sName.
 *
 * If the boolean parameter bAll is <code>true</code>, an array of string values of all
 * occurrences of the URI parameter with the given name is returned. This array is empty
 * if the URI parameter is not contained in the windows URL.
 *
 * If the boolean parameter bAll is <code>false</code> or is not specified, the value of the first
 * occurrence of the URI parameter with the given name is returned. Might be <code>null</code>
 * if the URI parameter is not contained in the windows URL.
 *
 * @param {string} sName The name of the URI parameter.
 * @param {boolean} [bAll=false] Optional, specifies whether all or only the first parameter value should be returned.
 * @return {string|array} The value(s) of the URI parameter with the given name
 * @SecSource {return|XSS} Return value contains URL parameters
 *
 * @function
 * @name jQuery.sap.util.UriParameters.prototype.get
 * @public
 */

/**
 * @class A Logger class
 * @param {string} sDefaultComponent
 * @name jQuery.sap.log.Logger
 * @constructor
 * @since 1.1.2
 * @public
 */

/**
 * A Logging API for JavaScript.
 *
 * Provides methods to manage a client-side log and to create entries in it. Each of the logging methods
 * {@link jQuery.sap.log.#debug}, {@link jQuery.sap.log.#info}, {@link jQuery.sap.log.#warning},
 * {@link jQuery.sap.log.#error} and {@link jQuery.sap.log.#fatal} creates and records a log entry,
 * containing a timestamp, a log level, a message with details and a component info.
 * The log level will be one of {@link jQuery.sap.log.Level} and equals the name of the concrete logging method.
 *
 * By using the {@link jQuery.sap.log#setLevel} method, consumers can determine the least important
 * log level which should be recorded. Less important entries will be filtered out. (Note that higher numeric
 * values represent less important levels). The initially set level depends on the mode that UI5 is running in.
 * When the optimized sources are executed, the default level will be {@link jQuery.sap.log.Level.ERROR}.
 * For normal (debug sources), the default level is {@link jQuery.sap.log.Level.DEBUG}.
 *
 * All logging methods allow to specify a <b>component</b>. These components are simple strings and
 * don't have a special meaning to the UI5 framework. However they can be used to semantically group
 * log entries that belong to the same software component (or feature). There are two APIs that help
 * to manage logging for such a component. With <code>{@link jQuery.sap.log.getLogger}(sComponent)</code>,
 * one can retrieve a logger that automatically adds the given <code>sComponent</code> as component
 * parameter to each log entry, if no other component is specified. Typically, JavaScript code will
 * retrieve such a logger once during startup and reuse it for the rest of its lifecycle.
 * Second, the {@link jQuery.sap.log.Logger#setLevel}(iLevel, sComponent) method allows to set the log level
 * for a specific component only. This allows a more fine granular control about the created logging entries.
 * {@link jQuery.sap.log.Logger.getLevel} allows to retrieve the currently effective log level for a given
 * component.
 *
 * {@link jQuery.sap.log#getLog} returns an array of the currently collected log entries.
 *
 * Furthermore, a listener can be registered to the log. It will be notified whenever a new entry
 * is added to the log. The listener can be used for displaying log entries in a separate page area,
 * or for sending it to some external target (server).
 *
 * @author SAP SE
 * @since 0.9.0
 * @name jQuery.sap.log
 * @extends jQuery.sap.log.Logger
 * @namespace
 * @public
 */

/**
 * Returns a {@link jQuery.sap.log.Logger} for the given component.
 *
 * The method might or might not return the same logger object across multiple calls.
 * While loggers are assumed to be light weight objects, consumers should try to
 * avoid redundant calls and instead keep references to already retrieved loggers.
 *
 * The optional second parameter <code>iDefaultLogLevel</code> allows to specify 
 * a default log level for the component. It is only applied when no log level has been 
 * defined so far for that component (ignoring inherited log levels). If this method is 
 * called multiple times for the same component but with different log levels, 
 * only the first call one might be taken into account.
 * 
 * @param {string} sComponent Component to create the logger for
 * @param {int} [iDefaultLogLevel] a default log level to be used for the component, 
 *   if no log level has been defined for it so far.
 * @return {jQuery.sap.log.Logger} A logger for the component.
 * @public
 * @static
 * @since 1.1.2
 * @name jQuery.sap.log.getLogger
 * @function
 */

/**
 * Returns the logged entries recorded so far as an array.
 *
 * Log entries are plain JavaScript objects with the following properties
 * <ul>
 * <li>timestamp {number} point in time when the entry was created
 * <li>level {int} LogLevel level of the entry
 * <li>message {string} message text of the entry
 * </ul>
 *
 * @return {object[]} an array containing the recorded log entries
 * @public
 * @static
 * @since 1.1.2
 * @name jQuery.sap.log.getLogEntries
 * @function
 */

/**
 * Allows to add a new LogListener that will be notified for new log entries.
 * The given object must provide method <code>onLogEntry</code> and can also be informed
 * about <code>onDetachFromLog</code> and <code>onAttachToLog</code>
 * @param {object} oListener The new listener object that should be informed
 * @return {jQuery.sap.log} The global logger
 * @public
 * @static
 * @name jQuery.sap.log.addLogListener
 * @function
 */

/**
 * Allows to remove a registered LogListener.
 * @param {object} oListener The new listener object that should be removed
 * @return {jQuery.sap.log} The global logger
 * @public
 * @static
 * @name jQuery.sap.log.removeLogListener
 * @function
 */

/**
 * Constructor for a new ODataMetadata.
 *
 * @param {string} sMetadataURI
 * @param {object} mParams
 * 
 * @class
 * Implementation to access oData metadata
 *
 * @author SAP SE
 * @version 1.22.4
 *
 * @constructor
 * @public
 * @name sap.ui.model.odata.ODataMetadata
 * @extends sap.ui.base.EventProvider
 */

/**
 * Creates a new subclass of class sap.ui.model.odata.ODataMetadata with name <code>sClassName</code>
 * and enriches it with the information contained in <code>oClassInfo</code>.
 *
 * For a detailed description of <code>oClassInfo</code> or <code>FNMetaImpl</code>
 * see {@link sap.ui.base.Object.extend Object.extend}.
 *
 * @param {string} sClassName name of the class to be created
 * @param {object} [oClassInfo] object literal with informations about the class
 * @param {function} [FNMetaImpl] alternative constructor for a metadata object
 * @return {function} the created class / constructor function
 * @public
 * @static
 * @name sap.ui.model.odata.ODataMetadata.extend
 * @function
 */

/**
 * Checks whether metadata is available
 * 
 * @public
 * @returns {boolean} returns whether metadata is already loaded
 * @name sap.ui.model.odata.ODataMetadata#isLoaded
 * @function
 */

/**
 * Checks whether metadata loading has already failed 
 * 
 * @public
 * @returns {boolean} returns whether metadata request has failed
 * @name sap.ui.model.odata.ODataMetadata#isFailed
 * @function
 */

	/**
	 * Attach event-handler <code>fnFunction</code> to the 'loaded' event of this <code>sap.ui.model.odata.ODataMetadata</code>.
	 *
	 *
	 * @param {object}
	 *            [oData] The object, that should be passed along with the event-object when firing the event.
	 * @param {function}
	 *            fnFunction The function to call, when the event occurs. This function will be called on the
	 *            oListener-instance (if present) or in a 'static way'.
	 * @param {object}
	 *            [oListener] Object on which to call the given function. If empty, the global context (window) is used.
	 *
	 * @return {sap.ui.model.odata.ODataMetadata} <code>this</code> to allow method chaining
	 * @public
	 * @name sap.ui.model.odata.ODataMetadata#attachLoaded
	 * @function
	 */

	/**
	 * Detach event-handler <code>fnFunction</code> from the 'loaded' event of this <code>sap.ui.model.odata.ODataMetadata</code>.
	 *
	 * The passed function and listener object must match the ones previously used for event registration.
	 *
	 * @param {function}
	 *            fnFunction The function to call, when the event occurs.
	 * @param {object}
	 *            oListener Object on which the given function had to be called.
	 * @return {sap.ui.model.odata.ODataMetadata} <code>this</code> to allow method chaining
	 * @public
	 * @name sap.ui.model.odata.ODataMetadata#detachLoaded
	 * @function
	 */

	/**
	 * Attach event-handler <code>fnFunction</code> to the 'failed' event of this <code>sap.ui.model.odata.ODataMetadata</code>.
	 *
	 *
	 * @param {object}
	 *            [oData] The object, that should be passed along with the event-object when firing the event.
	 * @param {function}
	 *            fnFunction The function to call, when the event occurs. This function will be called on the
	 *            oListener-instance (if present) or in a 'static way'.
	 * @param {object}
	 *            [oListener] Object on which to call the given function. If empty, the global context (window) is used.
	 *
	 * @return {sap.ui.model.odata.ODataMetadata} <code>this</code> to allow method chaining
	 * @public
	 * @name sap.ui.model.odata.ODataMetadata#attachFailed
	 * @function
	 */

	/**
	 * Detach event-handler <code>fnFunction</code> from the 'failed' event of this <code>sap.ui.model.odata.ODataMetadata</code>.
	 *
	 * The passed function and listener object must match the ones previously used for event registration.
	 *
	 * @param {function}
	 *            fnFunction The function to call, when the event occurs.
	 * @param {object}
	 *            oListener Object on which the given function had to be called.
	 * @return {sap.ui.model.odata.ODataMetadata} <code>this</code> to allow method chaining
	 * @public
	 * @name sap.ui.model.odata.ODataMetadata#detachFailed
	 * @function
	 */
 
/**
 * Attach event-handler <code>fnFunction</code> to the 'annotationsFailed' event of this <code>sap.ui.model.odata.ODataModel</code>.
 *
 *
 * @param {object}
 *            [oData] The object, that should be passed along with the event-object when firing the event.
 * @param {function}
 *            fnFunction The function to call, when the event occurs. This function will be called on the
 *            oListener-instance (if present) or in a 'static way'.
 * @param {object}
 *            [oListener] Object on which to call the given function. If empty, the global context (window) is used.
 *
 * @return {sap.ui.model.odata.ODataModel} <code>this</code> to allow method chaining
 * @public
 * @name sap.ui.model.odata.ODataModel#attachAnnotationsFailed
 */

/**
 * Detach event-handler <code>fnFunction</code> from the 'annotationsFailed' event of this <code>sap.ui.model.odata.ODataModel</code>.
 *
 * The passed function and listener object must match the ones previously used for event registration.
 *
 * @param {function}
 *            fnFunction The function to call, when the event occurs.
 * @param {object}
 *            oListener Object on which the given function had to be called.
 * @return {sap.ui.model.odata.ODataModel} <code>this</code> to allow method chaining
 * @public
 * @name sap.ui.model.odata.ODataModel#detachAnnotationsFailed
 */

/**
 * Returns the reference to the router instance. The passed controller or view
 * have to be created in the context of a UIComponent to return the router 
 * instance. Otherwise this function will return undefined.
 * You may define the routerClass property in the config section of the routing to make the Component create your router extension.
 * eg: 
 * routing: {
 * 	config: {
 * 		routerClass : myAppNamespace.MyRouterClass
 * 		...
 * }
 * ...
 * @param {sap.ui.core.mvc.View|sap.ui.core.mvc.Controller} either a view or controller
 * @return {sap.ui.core.routing.Router} the router instance
 * @since 1.16.1
 * @public
 * @name sap.ui.core.UIComponent.getRouterFor
 * @function
 * @static
 */