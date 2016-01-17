define([], function() {
	"use strict";



	var NodeJsDebugResourceResolver = function(projectPath) {

		var FILE_SCHEME_PREFIX = "file://";
		var JS_SUFFIX = ".js";
		var XSJS_SUFFIX = ".xsjs";
		var XSJSLIB_SUFFIX = ".xsjslib";

		var NODE_MODULES_FOLDER = "node_modules";

		var RUNTIME_ROOT_REGEX = ".*\/executionroot\/.*\/app";

		var _projectPath = projectPath;
		var _runtimeRoot = null;

		var _xsjsRoot = "/lib";

		var _fallbackList = [];

		this.getProjectPath = function getProjectPath() {
			return _projectPath;
		};

		this.getRemoteRoot = function getRemoteRoot() {
			return _runtimeRoot;
		};

		this.updateRemoteRoot = function updateRemoteRoot(runtimeUrl) {
			var matches = runtimeUrl.match(RUNTIME_ROOT_REGEX);

			if (matches && matches.length > 0) {
				_runtimeRoot = matches[0];
			}

			var indexOfModulesFolder = runtimeUrl.indexOf(NODE_MODULES_FOLDER);
			if (indexOfModulesFolder > -1) {
				_runtimeRoot = runtimeUrl.substr(0, indexOfModulesFolder -1);
			}
		};

		/**
		 * update project path using node_modules folder
		 */
		this.updateProjectPath = function updateProjectPath(filePath, remoteUrl) {
			if (!_projectPath && _runtimeRoot) {
				if (remoteUrl.indexOf(_runtimeRoot) > -1) {
					var subPath = remoteUrl.substr(_runtimeRoot.length);
					var indexOfSubPathInPath = filePath.indexOf(subPath);
					if (indexOfSubPathInPath > -1) {
						_projectPath = filePath.substr(0, indexOfSubPathInPath);
					}
				}
			}
		};

		/**
		 * Gets the workspace resource for a given remote url for Xsjs.
		 * This is only a heuristic approach.
		 *
		 * @param remoteUrl Remote url sent from the debuggee
		 */
		this.getResourceMappingXsJs = function getResourceMapping(remoteUrl) {

			if (!_projectPath || !_runtimeRoot) {
				return null;
			}

			if (_isXsjsType(remoteUrl)) {

				// strip off file:///
				var xsjsPath = remoteUrl.substr(FILE_SCHEME_PREFIX.length);

				var result = _projectPath + _xsjsRoot + xsjsPath;

				return result;
			}
			return null;
		};

		/**
		 * Adds url to fallback list. No url mapping will be done.
		 * This is used when a resolved resource path does not exist and the remote source had to be opened.
		 */
		this.addToFallbackList = function addToFallbackList(url) {
			_fallbackList.push(url);
		};

		/**
		 * Gets the workspace resource for a given remote url.
		 * @param remoteUrl Remote url sent from the debuggee
		 */
		this.getResourceMapping = function getResourceMapping(remoteUrl) {

			// if url is in the fallback list, return the remote url
			if (_fallbackList.indexOf(remoteUrl) > -1) {
				return remoteUrl;
			}

			// simple logic if project and runtime root are known
			if (_runtimeRoot && _projectPath) {
				var rootDiff = this._getCommonPrefix(_runtimeRoot, remoteUrl);

				if (rootDiff.commonPart && !rootDiff.firstDiff) {
					return _projectPath + "/" + rootDiff.secondDiff; // there is always a common "/"
				}
			}

			return null;
		};


		this.getUrlMapping = function getUrlMapping(resourcePath) {

			// if url is in the fallback list, return the remote url
			if (this.isFallback(resourcePath)) {
				return resourcePath;
			}

			// simple logic if project and runtime root are known
			if (_runtimeRoot && _projectPath) {
				var rootDiff = this._getCommonPrefix(_projectPath, resourcePath);

				if (rootDiff.commonPart && !rootDiff.firstDiff) {
					return _runtimeRoot + "/" + rootDiff.secondDiff; // there is always a common "/"
				}
			}

		};

		this.isFallback = function isFallback(resolvedResource) {
			return (_fallbackList.indexOf(resolvedResource) > -1);
		};

		/**
		 * Find the breakpoints with the best fitting overlap of the folder structure for xsjs
		 */
		this.findBestMatchesXsJs = function(remoteUrl, breakpoints) {

			var result = [];

			// fallback only applies for xsjs
			if (!_isXsjsType(remoteUrl)) {
				return result;
			}

			if (!jQuery.sap.startsWith(remoteUrl, FILE_SCHEME_PREFIX)) {
				return result;
			} else {
				remoteUrl = remoteUrl.substr(FILE_SCHEME_PREFIX.length);
			}

			var maxCommonSegments = 0;
			var minPathLength = null;

			// xsjs: if only one element in the remote url (e. g. file:///main.xsjs) -> take the shortest path
			var isXsjsRoot = _isXsjsType(remoteUrl) && (remoteUrl.split("/").length <= 2);

			for (var i = 0; i < breakpoints.length; i++) {

				// skip if path does not belong to the right project
				if (jQuery.sap.startsWith(breakpoints[i].filePath, _projectPath)) {

					var projectRelativePath = breakpoints[i].filePath.substr(_projectPath.length);
					var numberOfProjectRelativeSegments = projectRelativePath.split("/").length;

					var numberOfCommonSegments = this._getCommonSuffixSegments(projectRelativePath, remoteUrl).length;
					if (numberOfCommonSegments > 1) {
						// file + folders
						if (numberOfCommonSegments > maxCommonSegments) {
							maxCommonSegments = numberOfCommonSegments;
							result = [];
						}
						// use the project relative path with the shortest length
						if (minPathLength && isXsjsRoot && (projectRelativePath.length < minPathLength)) {
							result = [];
						}
						// accept file name as common segment only if file is directly on project root or if it is an xsjs source
						if (numberOfCommonSegments === maxCommonSegments &&
								( (maxCommonSegments > 2) || (numberOfProjectRelativeSegments == 2) || _isXsjsType(remoteUrl) )) {
							result.push(breakpoints[i]);
							minPathLength = projectRelativePath.length;
						}
					}
				}
			}

			if (result && (result.length > 0)) {

				var relativePath = result[0].filePath.substr(_projectPath.length);

				// update xsjs root
				var diff = this._getCommonSuffix(relativePath, remoteUrl);

				_xsjsRoot = diff.firstDiff;
			}

			return result;
		};

		/**
		 * Find the breakpoints with the best fitting overlap of the folder structure if no information about
		 * the project and the remote root path is available
		 */
		this.findBestMatchesFallback = function findBestMatchesFallback(fullRemoteUrl, breakpoints) {

			var result = [];

			// fallback only applies if no project an root path are set
			if (_projectPath && _runtimeRoot) {
				return result;
			}

			if (!jQuery.sap.startsWith(fullRemoteUrl, FILE_SCHEME_PREFIX)) {
				return result;
			} else {
				var remoteUrl = fullRemoteUrl.substr(FILE_SCHEME_PREFIX.length);
			}

			var maxCommonSegments = 0;

			for (var i = 0; i < breakpoints.length; i++) {

				var numberOfCommonSegments = this._getCommonSuffixSegments(remoteUrl, breakpoints[i].filePath).length;

				if (numberOfCommonSegments > 1) {
					// file + folders
					if (numberOfCommonSegments > maxCommonSegments) {
						maxCommonSegments = numberOfCommonSegments;
						result = [];
					}

					if (numberOfCommonSegments === maxCommonSegments ) {

						// make sure that modules have the node_modules path segment
						if (remoteUrl.indexOf(NODE_MODULES_FOLDER) > -1) {
							if (breakpoints[i].filePath.indexOf(NODE_MODULES_FOLDER) < 0) {
								continue;
							}
						}

						// TODO add a check for the project path ? Would change the whole flow (promises)
						// add a list of all projects to the resource resolver initially?
						this.updateProjectPath(breakpoints[i].filePath, fullRemoteUrl);

						result.push(breakpoints[i]);
					}
				}
			}

			return result;
		};


		this._getCommonSuffixSegments = function(firstUrl, secondUrl) {
			var diff = this._getCommonSuffix(firstUrl, secondUrl);
			if (diff.commonPart) {
				return diff.commonPart.split("/");
			}
			return [];
		};

		this._getCommonPrefix = function (firstUrl, secondUrl) {
			var segmentsOfFirstUrl = firstUrl.split('/');
			var segmentsOfSecondUrl = secondUrl.split('/');

			var endOfCommonPart = 0;
			for (var i = 0; i < segmentsOfFirstUrl.length; i++) {
				if (segmentsOfFirstUrl[i] === segmentsOfSecondUrl[i]) {
					endOfCommonPart += segmentsOfFirstUrl[i].length + 1;
				} else {
					break;
				}
			}
			return {
				commonPart: firstUrl.substr(0, endOfCommonPart),
				firstDiff : firstUrl.substr(endOfCommonPart, firstUrl.length),
				secondDiff : secondUrl.substr(endOfCommonPart, secondUrl.length)
			};
		};

		this._getCommonSuffix = function (firstUrl, secondUrl) {

			function reverseString(s) {
				return s.split('').reverse().join('');
			}

			var firstString = reverseString(firstUrl);
			var secondString = reverseString(secondUrl);

			var result = this._getCommonPrefix(firstString, secondString);

			result.commonPart = reverseString(result.commonPart);
			result.firstDiff = reverseString(result.firstDiff);
			result.secondDiff = reverseString(result.secondDiff);

			return result;
		};

		function _endsWith(string, suffix) {
		    return string.indexOf(suffix, string.length - suffix.length) !== -1;
		}

		function _findBestKey(keys, type) {
			var bestKey = keys[0];
			for (var i = 0; i < keys.length; i++) {
				if (_endsWith(keys[i], type)) {
					bestKey = keys[i];
					break;
				}
			}
			return bestKey;
		}

		function _getType(url) {
			var lastDot = url.lastIndexOf('.');
			if (lastDot > -1) {
				return url.substr(lastDot, url.length);
			}
			return JS_SUFFIX;
		}

		function _isXsjsType(url) {
			return (_getType(url) === XSJS_SUFFIX) || (_getType(url) === XSJSLIB_SUFFIX);
		}

		function _getFileName(filePath) {
			return filePath.split("/").pop();
		}
	};

	return NodeJsDebugResourceResolver;

});
