define([ //
    "../../../../../../../resources/sap/watt/nodejs/plugin/debug/service/NodeJsDebugResourceResolver"], function(NodeJsDebugResourceResolver) {
	"use strict";

	var TEST_PROJECT_PATH = "/TheTestProject";

	module("NodeJsDebugResourceResolver", {
		setup: function() {

		},

		teardown: function() {}
	});

	test("constructor", function(assert) {

		var expectedPath = "/project/path";

		var resolver = new NodeJsDebugResourceResolver(expectedPath);

		assert.equal(resolver.getProjectPath(), expectedPath);
	});

	test("update remote root", function(assert) {
		var resolver = new NodeJsDebugResourceResolver(TEST_PROJECT_PATH);

		var remoteResourceUrl = "file:///usr/sap/xs2work/executionroot/198956a6-5abd-4011-ab25-4e28d26dce88/app/jsanalyzer/jsanalyzer_nodejs/js_analyzer/js_analyzer.js";

		resolver.updateRemoteRoot(remoteResourceUrl);

		var remoteRoot = resolver.getRemoteRoot();

		assert.equal(remoteRoot, "file:///usr/sap/xs2work/executionroot/198956a6-5abd-4011-ab25-4e28d26dce88/app");
	});

	test("update remote root from module path", function(assert) {
		var resolver = new NodeJsDebugResourceResolver(TEST_PROJECT_PATH);

		var remoteResourceUrl = "file:///home/D026715/git/chat-example/node_modules/express/node_modules/fresh/index.js";

		resolver.updateRemoteRoot(remoteResourceUrl);

		var remoteRoot = resolver.getRemoteRoot();

		assert.equal(remoteRoot, "file:///home/D026715/git/chat-example");
	});

	test("update project path", function(assert) {

		var resolver = new NodeJsDebugResourceResolver(TEST_PROJECT_PATH);

		var remoteResourceUrl = "file:///home/D026715/git/chat-example/node_modules/express/node_modules/fresh/index.js";

		resolver.updateRemoteRoot(remoteResourceUrl);

		resolver.updateProjectPath("/chat-example/node_modules/express/node_modules/fresh/index.js", remoteResourceUrl);

		assert.equal(resolver.getProjectPath(), TEST_PROJECT_PATH);

		// ******************
		var noModuleRemoteUrl = "file:///home/D026715/git/chat-example/index.js";
		var noModulePath = "/chat-example/index.js";

		var resolverWithoutProject = new NodeJsDebugResourceResolver(null);

		// one module path is needed
		resolverWithoutProject.updateRemoteRoot(remoteResourceUrl);

		resolverWithoutProject.updateProjectPath(noModulePath, noModuleRemoteUrl);

		assert.equal(resolverWithoutProject.getProjectPath(), "/chat-example");

		var result = resolverWithoutProject.getResourceMapping(noModuleRemoteUrl);

		assert.equal(result, noModulePath);
	});

	test("existing mapping", function(assert) {
		var resolver = new NodeJsDebugResourceResolver(TEST_PROJECT_PATH);

		var remoteResourceUrl = "file:///usr/sap/xs2work/executionroot/198956a6-5abd-4011-ab25-4e28d26dce88/app/jsanalyzer/jsanalyzer_nodejs/js_analyzer/js_analyzer.js";

		var resourcePath = TEST_PROJECT_PATH + "/jsanalyzer/jsanalyzer_nodejs/js_analyzer/js_analyzer.js";

		resolver.updateRemoteRoot(remoteResourceUrl);

		var result = resolver.getResourceMapping(remoteResourceUrl);

		assert.equal(result, resourcePath);

		// *********** url mapping

		var result2 = resolver.getUrlMapping(resourcePath);

		assert.equal(result2, remoteResourceUrl);
	});

	test("simple mapping", function(assert) {
		var resolver = new NodeJsDebugResourceResolver(TEST_PROJECT_PATH);

		var remoteResourceUrl = "file:///usr/sap/xs2work/executionroot/198956a6-5abd-4011-ab25-4e28d26dce88/app/hello-world.js";

		var resourcePath = TEST_PROJECT_PATH + "/hello-world.js";

		resolver.updateRemoteRoot(remoteResourceUrl);

		var remoteResourceUrl2 = "file:///usr/sap/xs2work/executionroot/198956a6-5abd-4011-ab25-4e28d26dce88/app/routes/testdata.js";

		var resourcePath2 = TEST_PROJECT_PATH + "/routes/testdata.js";

		var result = resolver.getResourceMapping(remoteResourceUrl2);

		assert.equal(result, resourcePath2);

		var result2 = resolver.getResourceMapping(remoteResourceUrl);

		assert.equal(result2, resourcePath);

		assert.ok(!resolver.isFallback(remoteResourceUrl), "url is in fallback list");

		// **** url mapping

		var resultUrl = resolver.getUrlMapping(resourcePath2);

		assert.equal(resultUrl, remoteResourceUrl2);
	});


	/**
	 * Mapping if the file does not exist and the remote source had to be opened
	 */
	test("get mapping remote source", function(assert) {

		var resolver = new NodeJsDebugResourceResolver(TEST_PROJECT_PATH);

		var remoteResourceUrl = "file:///usr/sap/xs2work/executionroot/dd9c30be-0fa6-4e10-8b03-74bf197374d8/app/node_modules/xsjs/lib/runtime.js";

		resolver.updateRemoteRoot(remoteResourceUrl);

		resolver.addToFallbackList(remoteResourceUrl);

		var result = resolver.getResourceMapping(remoteResourceUrl);

		assert.equal(result, remoteResourceUrl);

		assert.ok(resolver.isFallback(remoteResourceUrl), "url is not in fallback list");

		// *********** url mapping

		var result2 = resolver.getUrlMapping(remoteResourceUrl);

		assert.equal(result2, remoteResourceUrl);
	});

	test("xsjs/js mapping", function(assert) {

		var resolver = new NodeJsDebugResourceResolver(TEST_PROJECT_PATH);

		var indexUrl = "file:///usr/sap/xs2work/executionroot/198956a6-5abd-4011-ab25-4e28d26dce88/app/index.js";

		resolver.updateRemoteRoot(indexUrl);

		var remoteResourceUrl = "file:///addressbook/userinfo.xsjs";
		var resourcePath = TEST_PROJECT_PATH + "/lib/addressbook/userinfo.xsjs";


		var result = resolver.getResourceMappingXsJs(remoteResourceUrl);

		assert.equal(result, resourcePath);

	});

	test("xsjs/js mapping non standard folder with breakpoint set", function(assert) {

		var resolver = new NodeJsDebugResourceResolver(TEST_PROJECT_PATH);

		var indexUrl = "file:///usr/sap/xs2work/executionroot/198956a6-5abd-4011-ab25-4e28d26dce88/app/index.js";

		resolver.updateRemoteRoot(indexUrl);

		var breakpoints = [];

		breakpoints.push({
			filePath : TEST_PROJECT_PATH + "/xsjs/main.xsjs",
			enabled: true,
			lineNumber : 17
		});

		breakpoints.push({
			filePath : TEST_PROJECT_PATH + "/xsjs/folder/main.xsjs",
			enabled: true,
			lineNumber : 17
		});


		var matches = resolver.findBestMatchesXsJs("file:///main.xsjs", breakpoints);

		assert.ok(matches);

		assert.ok(matches.length > 0, "no matches found");

		var remoteResourceUrl = "file:///addressbook/userinfo.xsjs";
		var resourcePath = TEST_PROJECT_PATH + "/xsjs/addressbook/userinfo.xsjs";


		var result = resolver.getResourceMappingXsJs(remoteResourceUrl);

		assert.equal(result, resourcePath);

	});

	test("get common suffix", function(assert) {

		var resolver = new NodeJsDebugResourceResolver(TEST_PROJECT_PATH);

		var result = resolver._getCommonSuffix("a/b", "c/b");

		assert.equal(result.commonPart, "/b");

		var result2 = resolver._getCommonSuffix("alpha/beta/gamma", "delta/delta/beta/gamma");

		assert.equal(result2.commonPart, "/beta/gamma");

		var result3 = resolver._getCommonSuffix("file:///alpha/alpha/beta/gamma", "delta/beta/gamma");

		assert.equal(result3.commonPart, "/beta/gamma");
	});

	test("init runtime root", function(assert) {
		var resolver = new NodeJsDebugResourceResolver(TEST_PROJECT_PATH);

		var expectedRuntimeRoot = "file:///usr/sap/xs2work/executionroot/198956a6-5abd-4011-ab25-4e28d26dce88/app";

		var remoteUrl = expectedRuntimeRoot + "/index.js";

		resolver.updateRemoteRoot(remoteUrl);

		var runtimeRoot = resolver.getRemoteRoot();

		assert.equal(runtimeRoot, expectedRuntimeRoot);

		var expectedResourcePath = TEST_PROJECT_PATH + "/index.js";

		var result = resolver.getResourceMapping(remoteUrl);

		assert.equal(result, expectedResourcePath);
	});

	test("init runtime root fail", function(assert) {
		var resolver = new NodeJsDebugResourceResolver(TEST_PROJECT_PATH);

		var expectedRuntimeRoot = "file:///usr/sap/xs2work/executionroot34/198956a6-5abd-4011-ab25-4e28d26dce88/app";

		var remoteUrl = expectedRuntimeRoot + "/index.js";

		resolver.updateRemoteRoot(remoteUrl);

		var runtimeRoot = resolver.getRemoteRoot();

		assert.ok(!runtimeRoot);
	});

	test("get url simple", function(assert) {
		var resolver = new NodeJsDebugResourceResolver(TEST_PROJECT_PATH);

		resolver.updateRemoteRoot("file:///usr/sap/xs2work/executionroot/198956a6-5abd-4011-ab25-4e28d26dce88/app/index.js");

		var remoteUrl = "file:///usr/sap/xs2work/executionroot/198956a6-5abd-4011-ab25-4e28d26dce88/app/beta/gamma/code.js";

		var resourcePath = TEST_PROJECT_PATH + "/beta/gamma/code.js";

		var result = resolver.getUrlMapping(resourcePath);

		assert.ok(result);

		assert.equal(result, remoteUrl);
	});

	test("get url different projects", function(assert) {

		var resolver = new NodeJsDebugResourceResolver(TEST_PROJECT_PATH);

		resolver.updateRemoteRoot("file:///usr/sap/xs2work/executionroot/198956a6-5abd-4011-ab25-4e28d26dce88/app/index.js");

		var remoteUrl = "file:///usr/sap/xs2work/executionroot/198956a6-5abd-4011-ab25-4e28d26dce88/app/beta/gamma/delta/index.js";

		var	resourcePathOtherProject = "/OtherProject/beta/gamma/delta/index.js";

		var resourcePathSameProject = TEST_PROJECT_PATH + "/beta/gamma/delta/index.js";

		var resultOtherProject = resolver.getUrlMapping(resourcePathOtherProject);

		assert.ok(!resultOtherProject);

		var resultSameProject = resolver.getUrlMapping(resourcePathSameProject);

		assert.ok(resultSameProject);

		assert.equal(resultSameProject, remoteUrl);
	});


	test("find best match simple fallback", function(assert) {

		var resolver = new NodeJsDebugResourceResolver(null);

		var remoteUrl = "file:///home/xy/myapp/folder/handler.js";

		var breakpoints = [];

		breakpoints.push({
			filePath : TEST_PROJECT_PATH + "/main.js",
			enabled: true,
			lineNumber : 4
		});

		var expected = {
				filePath : TEST_PROJECT_PATH + "/folder/handler.js",
				enabled: true,
				lineNumber : 17
			};

		breakpoints.push(expected);

		breakpoints.push({
			filePath : TEST_PROJECT_PATH + "/folder/executor.js",
			enabled: true,
			lineNumber : 8
		});

		var result = resolver.findBestMatchesFallback(remoteUrl, breakpoints);

		assert.ok(result);

		assert.equal(result.length, 1);

		assert.equal(result[0], expected);
	});

	test("find best match fallback with identical file name", function(assert) {

		var resolver = new NodeJsDebugResourceResolver(null);

		var remoteUrl = "file:///home/D026715/git/chat-example/index.js";

		var remoteModuleUrl = "file:///home/D026715/git/chat-example/node_modules/express/node_modules/fresh/index.js";

		resolver.updateRemoteRoot(remoteModuleUrl);

		var breakpoints = [];

		var expected = {
				filePath : "/chat-example/index.js",
				enabled: true,
				lineNumber : 17
			};

		breakpoints.push(expected);

		breakpoints.push({
			filePath : "/chat-example/folder/index.js",
			enabled: true,
			lineNumber : 8
		});

		breakpoints.push({
			filePath : "/chat-example/folder/anyother.js",
			enabled: true,
			lineNumber : 8
		});

		var result = resolver.findBestMatchesFallback(remoteUrl, breakpoints);

		assert.ok(result);

		assert.equal(result.length, 1);

		assert.equal(result[0], expected);

		var wsPath = resolver.getResourceMapping(remoteUrl);

		assert.equal(wsPath, "/chat-example/index.js");

		var result2 = resolver.findBestMatchesFallback(remoteModuleUrl, breakpoints);

		assert.equal(result2.length, 0);

		var expectedModule = {
				filePath : "/chat-example/node_modules/express/node_modules/fresh/index.js",
				enabled: true,
				lineNumber : 17
			};

		breakpoints.push(expectedModule);

		var result3 = resolver.getUrlMapping(expectedModule.filePath);

		assert.equal(result3, remoteModuleUrl);
	});

	/**
	 * This scenario fails with the current implementation as the project root is calculated from the wrong workspace path
	 */
	/*test("find best match fallback with identical file name reverse breakpoint order", function(assert) {

		var resolver = new NodeJsDebugResourceResolver(null);

		var remoteUrl = "file:///home/D026715/git/chat-example/index.js";

		var remoteModuleUrl = "file:///home/D026715/git/chat-example/node_modules/express/node_modules/fresh/index.js";

		resolver.updateRemoteRoot(remoteModuleUrl);

		var breakpoints = [];

		breakpoints.push({
			filePath : "/chat-example/folder/index.js",
			enabled: true,
			lineNumber : 8
		});

		var expected = {
				filePath : "/chat-example/index.js",
				enabled: true,
				lineNumber : 17
			};

		breakpoints.push(expected);

		breakpoints.push({
			filePath : "/chat-example/folder/anyother.js",
			enabled: true,
			lineNumber : 8
		});

		var result = resolver.findBestMatchesFallback(remoteUrl, breakpoints);

		assert.ok(result);

		assert.equal(result.length, 1);

		assert.equal(result[0], expected);

		var wsPath = resolver.getResourceMapping(remoteUrl);

		// does not work because the project path was derived from /chat-example/folder/index.js as /chat-example/folder
		// this can only happen

		assert.equal(wsPath, "/chat-example/index.js");

		var result2 = resolver.findBestMatchesFallback(remoteModuleUrl, breakpoints);

		assert.equal(result2.length, 0);

		var expectedModule = {
				filePath : "/chat-example/node_modules/express/node_modules/fresh/index.js",
				enabled: true,
				lineNumber : 17
			};

		breakpoints.push(expectedModule);

		var result3 = resolver.getUrlMapping(expectedModule.filePath);

		assert.equal(result3, remoteModuleUrl);
	});*/

	// ***** xsjs tests ************************

	test("find best match simple xsjs", function(assert) {
		var resolver = new NodeJsDebugResourceResolver(TEST_PROJECT_PATH);

		var remoteUrl = "file:///main.xsjs";

		var breakpoints = [];

		breakpoints.push({
			filePath : TEST_PROJECT_PATH + "/index.js",
			enabled: true,
			lineNumber : 4
		});

		var expected = {
				filePath : TEST_PROJECT_PATH + "/xsjs/main.xsjs",
				enabled: true,
				lineNumber : 17
			};

		breakpoints.push(expected);

		breakpoints.push({
			filePath : TEST_PROJECT_PATH + "/xsjs/handler.xsjs",
			enabled: true,
			lineNumber : 8
		});

		var result = resolver.findBestMatchesXsJs(remoteUrl, breakpoints);

		assert.ok(result);

		assert.equal(result.length, 1);

		assert.equal(result[0], expected);
	});

	test("find best match xsjs identical file name", function(assert) {
		var resolver = new NodeJsDebugResourceResolver(TEST_PROJECT_PATH);

		var remoteUrl = "file:///main.xsjs";

		var breakpoints = [];

		breakpoints.push({
			filePath : TEST_PROJECT_PATH + "/xsjs/folder/main.xsjs",
			enabled: true,
			lineNumber : 8
		});

		breakpoints.push({
			filePath : TEST_PROJECT_PATH + "/index.js",
			enabled: true,
			lineNumber : 4
		});

		var expected = {
				filePath : TEST_PROJECT_PATH + "/xsjs/main.xsjs",
				enabled: true,
				lineNumber : 17
			};

		breakpoints.push(expected);

		var result = resolver.findBestMatchesXsJs(remoteUrl, breakpoints);

		assert.ok(result);

		assert.equal(result.length, 1);

		assert.equal(result[0], expected);
	});

});
