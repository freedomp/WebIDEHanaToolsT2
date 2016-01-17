/*
 * RequireJS module with API:
 * <ul>
 * <li>AdtDiscoveryFactory.getDiscovery
 * <li>public methods of AdtDiscovery, AdtDiscoveryCollectionMember
 * </ul>
 */
define( //Define this module as requireJS module and its dependencies to other requireJS modules
	[ "sap.watt.saptoolsets.fiori.abap.adt.communication/service/AdtRestResource", // This dependency would not be needed, //$NON-NLS-1$
		// if we called AdtRestResourceFactory as WATT service (see below), but ADT is self-contained
		"sap.watt.saptoolsets.fiori.abap.adt.communication/util/AdtCheckUtil",   // AdtCheckUtil shall not be public, //$NON-NLS-1$
		"sap.watt.saptoolsets.fiori.abap.adt.communication/util/AdtUrlUtil",   // AdtCheckUtil shall not be public, //$NON-NLS-1$
		// but WATT / requireJS does still not have a friends-concept, therefore this dependency is ok
		"sap.watt.saptoolsets.fiori.abap.adt.communication/util/AdtFreezerUtil", //$NON-NLS-1$
		"sap.watt.saptoolsets.fiori.abap.adt.compatibility/service/AdtUriTemplate" //$NON-NLS-1$
	], //$NON-NLS-1$

	function (AdtRestResourceFactory, AdtCheckUtil, AdtUrlUtil, AdtFreezerFactory, AdtUriTemplateFactory) {

		"use strict"; //$NON-NLS-1$

		var SWITCH_USE_Q_PROMISE = true; // TODO Feb. 2015, preliminary switch for usages outside WebIDE, used until usage of Q.js is approved for these usages

		// Requirement for caching framework parts: immutable API
		// The single discoveries are retrieved once and then cached and accessed by different applications
		// (use case: a performant web page is used as web location for a longer time and loads on demand
		// all the parts it needs step by step).
		// Especially in JavaScript, it is easy to overwrite functionality, data and - doing so -
		// corrupting the cache contents and disrupting the functionality of other applications also using the discovery.
		// Those problems are hard to investigate and find, especially in test use case on build server ...
		// -> We prevent this problem by makeImmutableing the discovery itself and its cache contents immutable.

		// The freezers make the objects, functions and prototypes immutable, which are accessible by the callers:
		// - defaultFreezer: for objects (especially cache contents) and functions
		// - prototypeFreezer: for prototypes, freezes the prototype and its properties and functions
		var defaultFreezer = AdtFreezerFactory.createFreezer({freezeDeeply: true, freezeInheritedProperties: true, freezeFunctions: true});
		var prototypeFreezer = AdtFreezerFactory.createPrototypeFreezer({freezeDeeply: true, freezeInheritedProperties: true, freezeFunctions: true});

		var testConsole = null;

		/**
		 * Singleton AdtDiscoveryFactory is returned as JS object of the requireJS module.
		 * It is defined as WATT service in plugin.json.
		 */
		function AdtDiscoveryFactory() {

			var cache = new OneLevelCache(); // private cache, not immutable

			// Remark:
			// There is no way to provide a private method to be called in tests, therefore the __test__...methods are public.
			// A small privacy aspect is only ensured by the WATT handling of services:
			// The respective generated proxy-object only provides the API methods described in the respective JSON files.
			this.__test__ResetDiscovery = function () {
				cache = new OneLevelCache();
			};

			this.__test__injectConsole = function (console) { // actually private, but it is needed public for automatic tests
				testConsole = console;
				AdtCheckUtil.__test__injectConsole(testConsole);
			};

			/**
			 * The factory returns an ADT discovery for a given <code>discoveryUrl</code> and
			 * for the page currently loaded in the browser window,
			 * i.e. for the ABAP remote server from which this page is loaded.
			 * <p>
			 * The discovery is either taken from cache or created.
			 * In the later case the discovery content is retrieved via a request from remote server.
			 * </p>
			 * <p>
			 * If a precondition check fails, e.g. in case of illegal arguments, then an exception is thrown:
			 * one error object { message, stack }.
			 * </p>
			 * @param {string} discoveryUrl
			 *            RestResource URL for the specific discovery
			 * @param {object} settings
			 *            optional settings parameter for the discovery,
			 *            e.g. {urlPrefix : "/destinations/my_server_abap_dev"}
			 */
			this.getDiscovery = function (discoveryUrl, settings) {

				AdtCheckUtil.checkStringArgumentIsNotEmpty("AdtDiscoveryFactory.getDiscovery", "discoveryUrl", discoveryUrl); //$NON-NLS-1$ //$NON-NLS-2$

				if (settings && settings.urlPrefix) {
					// Fail-Early-Approach for optional parameter
					AdtCheckUtil.checkStringArgumentIsNotEmpty("AdtDiscoveryFactory.getInstance", "settings.urlPrefix", settings.urlPrefix);
					var hostUrl = AdtUrlUtil.extractHostUrl(discoveryUrl);
					if (typeof hostUrl === "string" && hostUrl !== "") {
						AdtCheckUtil.check(hostUrl === settings.urlPrefix, //
								"AdtDiscovery: The discovery URL " + discoveryUrl + " does not start with the configured URL prefix " + settings.urlPrefix);
					}

					var fullDiscoveryUrl = AdtUrlUtil.ensureLeadingUriPrefix(settings.urlPrefix, discoveryUrl);
				} else {
					fullDiscoveryUrl = discoveryUrl;
				}

				var discovery = cache.get(fullDiscoveryUrl);
				if (!discovery) {
					discovery = new AdtDiscovery(fullDiscoveryUrl);
					defaultFreezer.makeImmutable(discovery);
					cache.add(fullDiscoveryUrl, discovery);
				}

				// WATT integration rules: Each service method has to return a promise.
				// But when the implementation does not return it, then this promise is automatically generated by the respective WATT proxy for the service.
				return discovery;
			};

		}

		/**
		 * URLs for the discoveries of the ADT domain.<br/>
		 * <b>Please use an own namespace for components outside of /sap/bc/adt !!!</b>
		 */
		AdtDiscoveryFactory.prototype.ADT_DISCOVERY_URL = "/sap/bc/adt/discovery"; //$NON-NLS-1$
		AdtDiscoveryFactory.prototype.ADT_CORE_DISCOVERY_URL = "/sap/bc/adt/core/discovery"; //$NON-NLS-1$

		prototypeFreezer.makeImmutable(AdtDiscoveryFactory.prototype);

		// WATT integration:
		// These service-methods are required for the lifecycle of WATT services, but they are optional / it is not necessary to implement them as empty method:
		// - AdtDiscoveryFactory.prototype.init
		// - AdtDiscoveryFactory.prototype.configure

		function AdtDiscovery(discoveryUrl) { // private constructor

			var collectionMembers; // private cache

			// Avoid double requests for getting the discovery document:
			// The promise used for initialization of discovery will fire callbacks for ever,
			// also when those callbacks are registered when the promise has already succeeded / failed.
			var qDiscoveryPromise = null;

			function isInitializingOrInitialized() {
				return qDiscoveryPromise !== null;
			}

			function DiscoveryBuilder(jqueryXml) {

				var ERROR_MESSAGE_PREFIX = "Inconsistent discovery document (" + discoveryUrl + "): ";

				function toArray(list) {

					if (typeof list === "undefined" || list === null || typeof list.length !== "number") {
						return null;
					}
					var array = [];
					for (var i = 0; i < list.length; i++) {
						array[i] = list[i];
					}
					return array;
				}
				
				this.build = function () {

					// Old coding does not work on FireFox: var collections = jqueryXml.find("collection"); //$NON-NLS-1$
					var collections = jQuery("app\\:collection, collection", jqueryXml); //$NON-NLS-1$
					AdtCheckUtil.check(collections && collections !== null, ERROR_MESSAGE_PREFIX + "no collections defined");

					var collectionMembers = new DoubleLevelCache();
					for (var i = 0; i < collections.length; i++) {
						var jqCollection = jQuery(collections[i]);
						var mandatoryData = getMandatoryData(jqCollection); // strict method -> throws CheckError in case of inconsistent document
						var optionalData = getOptionalData(jqCollection); // tolerant method
						if (!optionalData || optionalData === null) {
							continue;
						}

						defaultFreezer.makeImmutable(optionalData.contentTypes); // but not the prototype of contentTypes: array
						defaultFreezer.makeImmutable(optionalData.templateLinks);

						var collectionMember = new AdtDiscoveryCollectionMember(mandatoryData.scheme, mandatoryData.term, mandatoryData.uri,
							optionalData.contentTypes, optionalData.templateLinks, optionalData.templateLinksRaw);
						collectionMembers.add(mandatoryData.scheme, mandatoryData.term, collectionMember);
					}

					// The collection members are computed once and cached, the cache shall be immutable
					collectionMembers.makeImmutable(); // freezes the double level cache content down to the level of the single collection-member object, but not its constructor-parameters (see above)
					return collectionMembers;
				};

				function getMandatoryData(jqCollection) {

					// Old coding does not work on FireFox: var category = jqCollection.find("category")[0]; //$NON-NLS-1$
					var category = jQuery("atom\\:category, category", jqCollection)[0]; //$NON-NLS-1$
					AdtCheckUtil.check(category && category !== null, ERROR_MESSAGE_PREFIX + "category for collection missing");

					// Mandatory data: Get and check scheme and term
					var scheme = jQuery(category).attr("scheme"); //$NON-NLS-1$
					AdtCheckUtil.check(scheme && scheme !== null && scheme.length > 0, ERROR_MESSAGE_PREFIX + "scheme for collection with category " + category + " missing");
					var term = jQuery(category).attr("term"); //$NON-NLS-1$
					AdtCheckUtil.check(term && term !== null && term.length > 0, ERROR_MESSAGE_PREFIX + "term for collection with category " + category + " missing");

					// Mandatory data: Get and check uri
					var uri = jqCollection.attr("href"); //$NON-NLS-1$
					AdtCheckUtil.check(uri && uri !== null && uri.length > 0, ERROR_MESSAGE_PREFIX + "uri for collection with category " + category + " missing");

					return {scheme: scheme, term: term, uri: uri};
				}

				function getOptionalData(jqCollection) {

					var children = jqCollection.children();
					var templateLinks = null;
					var templateLinksRaw = null;
					var contentTypes = []; // array !!! (= {} would introduce object properties)
					var ctIdx = 0;
					for (var childKey in children) {
						if (!children.hasOwnProperty(childKey)) {
							continue;
						}
						if (children[childKey].nodeName === "app:accept") { //$NON-NLS-1$
							// Get and check accepted content type
							// old coding does not work on IE: var contentType = children[childKey].innerHTML;
							var contentType = jQuery(children[childKey]).text();
							if (contentType && contentType.length > 0) {
								contentTypes[ctIdx++] = contentType;
							}

						} else if (children[childKey].nodeName === "adtcomp:templateLinks") { //$NON-NLS-1$
							// Get and check template links
							// - Temporary substitute:
							//   templateLinksRaw were a temporary substitute for the time the template URIs handling is not yet available.
							//   They are still used by the DDL analytical query builder.
							//   Aspects: TemplateList-Array/Object with the single XML elements for the links, not frozen (too expensive data structure).
							// - Firefox specific issue [01.04.2015]: 
							//   templateLinksRaw = children[childKey].childNodes; 
							//   had the problem that templateLinksRaw list was empty (not null) in the second call (i.e. discovery was taken from cache). 
							//   Maybe the Garbage Collector has cleaned up the list ? 
							//   Solution: Mapping from list to array. 
							templateLinksRaw = toArray(children[childKey].childNodes);
							// Final solution: parsing of the template links
							// (is done during the first call and therefore it does not have the Firefox problem ...)
							if (templateLinksRaw && templateLinksRaw.length > 0) {
								templateLinks = new DoubleLevelCache();
								for (var idx = 0; idx < templateLinksRaw.length; idx++) {
									var jqLink = jQuery(templateLinksRaw[idx]);
									var relation = jqLink.attr("rel");
									var type = jqLink.attr("type");
									var adtUriTemplate = AdtUriTemplateFactory.createUriTemplate(jqLink.attr("template"));
									templateLinks.add(relation, type, adtUriTemplate);
								}
							}
						}
					}

					return {contentTypes: contentTypes, templateLinks: templateLinks, templateLinksRaw: templateLinksRaw };
				}
			}

			/**
			 * The method provides access to the collection members of the discovery.
			 * The collection members are retrieved and cached on demand in an asynchronous way.
			 * If it is not yet cached, then it is provided asynchronously, else synchronously
			 * by the done-callback of the returned Q-promise.
			 *
			 * @returns {Promise} a Q-promise providing a done-callback with the collection members as parameter.
			 */
			var getCollectionMembers = function () {

				// Avoid double requests for getting the discovery document
				if (isInitializingOrInitialized()) {
					return qDiscoveryPromise;
				}

				// WATT calls services defined in WATT plugins in a lazy way:
				// qPromise = this.context.service.adtRestResourceFactory.createInstance()
				// -> but ADT is self-contained and calls the service as requireJS module synchronously:
				var restResource = AdtRestResourceFactory.createInstance();
				if (testConsole && testConsole != null) {
					restResource.__test__injectConsole(testConsole);
				}
				qDiscoveryPromise = restResource.get({ //
					url: discoveryUrl,
					// Caution: Discovery must not be cached by browsers, proxies, ...
					// The simplest and most effective cache-prevention handling is via the cache-setting of ajax:
					// cache: false, // jQuery adds a query-param "_=timestamp-val", so that each URL is different and cannot be cached in browsers, proxies, ...
					// Unfortunately the discovery does not accept query-parameters and fragments before ABAP server release 7.50.
					// Therefore we use request headers here (see below), although they are not properly supported by all caches of browsers, proxies, ... .
					dataType: "xml", // -> the returned data area already parsed as XML //$NON-NLS-1$
					async: true,
					headers: {"Accept": "application/atomsvc+xml", //$NON-NLS-1$ //$NON-NLS-2$
						// Cache-control headers for preventing caching:
						// (see http://stackoverflow.com/questions/49547/making-sure-a-web-page-is-not-cached-across-all-browsers, it claims: also node.js is doing it this way ...)
						"Cache-Control": "no-cache, no-store, must-revalidate", // http 1.1 //$NON-NLS-1$ //$NON-NLS-2$
						"Pragma": "no-cache", // http 1.0 //$NON-NLS-1$ //$NON-NLS-2$
						"Expires": "0" // proxies //$NON-NLS-1$ //$NON-NLS-2$
					}
				}).then( //
					function (result) {
						// Initialize caches:
						// wrong: var xmlDoc = jQuery.parseXML(data);
						// var xmlDoc == data == jQuery.parseXML(xhr.responseText)
						var jqueryXml = jQuery(result.data);

						// Build a specific discovery data structure and release the XML representation (performance, memory consumption)
						collectionMembers = new DiscoveryBuilder(jqueryXml).build();
						return collectionMembers;
					}, //
					function (error) {
						qDiscoveryPromise = null;
						// Afterwards a next trial is possible -> Currently we assume, that we do not need to prevent to prevent too frequent trials, e.g. via a timeout.
						if (SWITCH_USE_Q_PROMISE) {
							throw error;
						}
						return error;
					});
				return qDiscoveryPromise;
			};

			/**
			 * Returns the collection member for the given <code>scheme</code> and <code>term</code> from this discovery.
			 * It returns <code>null</code> if this resource collection member is not found.
			 * <p>
			 * If the discovery is not yet initialized, then it is retrieved from ABAP remote
			 * server via GET request.
			 * </p>
			 * <p>
			 * If a precondition check fails, e.g. in case of illegal arguments, then an exception is thrown:
			 * one error object { message, stack }.
			 * </p>
			 *
			 * @param {string} categoryScheme
			 *            the category scheme of the collection member
			 * @param {string} categoryTerm
			 *            the category term of the collection member
			 * @return {Promise} a Q-promise providing a done-callback with the collection member as parameter
			 */
			this.getCollectionMember = function (categoryScheme, categoryTerm) {

				AdtCheckUtil.checkStringArgumentIsNotEmpty("AdtDiscovery.getCollectionMember", "categoryScheme", categoryScheme); //$NON-NLS-1$ //$NON-NLS-2$
				AdtCheckUtil.checkStringArgumentIsNotEmpty("AdtDiscovery.getCollectionMember", "categoryTerm", categoryTerm); //$NON-NLS-1$ //$NON-NLS-2$

				var qPromise = getCollectionMembers();
				return qPromise.then(
					function (collectionMembers) {
						var collectionMember = collectionMembers.get(categoryScheme, categoryTerm);
						// qPromise-API of done-callback: 1 object collectionMember
						return collectionMember;
					});
			};
		}

		prototypeFreezer.makeImmutable(AdtDiscovery.prototype);

		/**
		 * Private constructor
		 * Collection resource of a discovery document. The single collection members can be accessed
		 * by the categoryScheme and categoryTerm.
		 */
		function AdtDiscoveryCollectionMember(categoryScheme, categoryTerm, uri, contentTypes, templateLinks) {

			var constructorArguments = arguments;

			/**
			 * The method returns the URI of the collection member.
			 * @returns {string} the URI of the collection member.
			 */
			this.getUri = function () {
				return uri;
			};

			/**
			 * The method returns the accepted content types, i.e. the content types, which can be used to add a new entry
			 * to the collection.
			 *
			 * @return Array with all accepted content types or an empty array.
			 */
			this.getAcceptedContentTypes = function () {
				return contentTypes;
			};

			/**
			 * The method returns the template link for the given <code>relation</code> and <code>contentType</code> or
			 * it returns <code>null</code> if no link for these input parameters exists.
			 * If the <code>contentType</code> parameter is undefined,
			 * then the method looks for a template link with the given <code>relation</code>, but without content type.
			 * This implies that the method also returns <code>null</code>, if the <code>contentType</code> parameter is
			 * undefined and the collection member has one or more template links with the given <code>relation</code>,
			 * but with content types specified.
			 * <p>
			 * If a precondition check fails, e.g. in case of illegal arguments, then an exception is thrown:
			 * one error object { message, stack }.
			 * </p>
			 *
			 * @param {string} relation - the relation of the template link
			 * @param {string} contentType - the content type of the template link (optional)
			 * @return {string} the template link for the given relation and content type or <code>null</code>
			 */
			this.getTemplateLink = function (relation, contentType) {

				AdtCheckUtil.checkStringArgumentIsNotEmpty("AdtDiscoveryCollectionMember.getTemplateLink", "relation", relation); //$NON-NLS-1$ //$NON-NLS-2$
				return templateLinks ? templateLinks.get(relation, contentType) : null;
			};

			/**
			 * Remark:
			 * A temporary substitute method 'getTemplateLinksRaw' is provided for the time the template URIs handling
			 * is not yet available. This is e.g. needed by DDL. <br>
			 * Aspects: TemplateList-Array/Object with the single XML elements for the links, not frozen (too expensive data structure).
			 */
			this.__debug__getTemplateLinksRaw = function () {
				return constructorArguments[5];
			};

			this.__debug__getData = function () { // actually private, but it is needed public for debugging
				return {uri: uri, contentTypes: contentTypes, templateLinks: templateLinks};
			};
		}

		/**
		 * The method returns <code>true</code> if the collection permits the creation of new
		 * members with the specified content type, else <code>false</code>.
		 * <p>
		 * If a precondition check fails, e.g. in case of illegal arguments, then an exception is thrown:
		 * one error object { message, stack }.
		 * </p>
		 *
		 * @param {string} contentType
		 * @return {boolean} <code>true</code> if the content type is accepted
		 */
		AdtDiscoveryCollectionMember.prototype.accepts = function (contentType) {

			AdtCheckUtil.checkStringArgumentIsNotEmpty("AdtDiscoveryCollectionMember.accepts", "contentType", contentType); //$NON-NLS-1$ //$NON-NLS-2$
			return this.getAcceptedContentTypes().indexOf(contentType) > -1;
		};

		prototypeFreezer.makeImmutable(AdtDiscoveryCollectionMember.prototype);

		/**
		 * Cache: {key, val}
		 */
		function OneLevelCache() {

			var cache = {};

			this.get = function (key) {
				return cache[key];
			};

			this.add = function (key, val) {
				cache[key] = val;
			};

			this.__debug__getData = function () { // actually private, but it is needed public for debugging
				return cache;
			};
		}

		prototypeFreezer.makeImmutable(OneLevelCache.prototype);

		/**
		 * Cache: {key1, {key2, val}}
		 */
		function DoubleLevelCache() {

			var cacheL1 = {};

			var that = this; // Prevent that someone calls public methods with call/apply and overwrites the this-reference used in the public method

			this.get = function (key1, key2) {
				var cacheL2 = cacheL1[key1];
				return (cacheL2) ? cacheL2[key2] : undefined;
			};

			this.add = function (key1, key2, val) {
				var cacheL2 = cacheL1[key1];
				if (!cacheL2) {
					cacheL2 = {};
					cacheL1[key1] = cacheL2;
				}
				cacheL2[key2] = val;
			};

			this.makeImmutable = function () {
				defaultFreezer.makeImmutable(that);
				defaultFreezer.makeImmutable(cacheL1);
			};

			this.__debug__getData = function () { // actually private, but it is needed public for debugging
				return cacheL1;
			};
		}

		// The DoubleLevelCache is internal, but it is returned as result of discovery.getCollectionMembers
		prototypeFreezer.makeImmutable(DoubleLevelCache.prototype);

		var factory = new AdtDiscoveryFactory(); // requireJS module
		defaultFreezer.makeImmutable(factory); // WATT service handling generates service-proxies and needs to add internal methods to the actual service-object

		return factory;
	}
);