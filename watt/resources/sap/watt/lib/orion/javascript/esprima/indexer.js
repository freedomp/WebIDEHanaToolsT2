/**
 * This file is designed to support the cross file user object proposals.
 *
 * The methods definition following the indexer interface of orion esprima engine.
 */
define([
], function() {
	"use strict";
	
	/**
	 * @public
	 */
	function hasDependency() {
		return this.globalSummaries && Object.keys(this.globalSummaries).length > 0;
	}
	
	/**
	 * @public
	 */
	function performIndex(dependency, summary) {
		if (this.globalSummaries) {
			this.globalSummaries[dependency] = summary;
		}
	}
	
	/**
	 * @public
	 */
	function retrieveGlobalSummaries() {
		return this.globalSummaries;
	}
	
	/**
	 * @public
	 */
	function retrieveSummary(dependency) {
		var absDependency = dependency;
		if (dependency.charAt(0) === '.' && URI) {
			var relUri = new URI(dependency);
			absDependency = relUri.absoluteTo(this.targetFile).toString() + ".js";
		} else {
			// Check if the dependency is UI5 AMD absolute dependency
			if (this.projectInfo) {
				var sProjectNamespace = this.projectInfo.namespace;
				// Check if the dependency starts with project namespace
				if (dependency.slice(0, sProjectNamespace.length) === sProjectNamespace) {
					absDependency = dependency.replace(sProjectNamespace, this.projectInfo.rootPath) + ".js";
				}
			}
		}
		if (this.globalSummaries) {
			return this.globalSummaries[absDependency];
		}
	}
	
	/**
	 * Indexer constructor
	 * @public
	 */
	function OrionIndexer(dependentIndexJsons, targetFile, projectInfo) {
		this.globalSummaries = dependentIndexJsons;
		this.targetFile = targetFile;
		this.projectInfo = projectInfo;
	}
	
	OrionIndexer.prototype = {
		hasDependency: hasDependency,
		performIndex: performIndex,
		retrieveGlobalSummaries: retrieveGlobalSummaries,
		retrieveSummary: retrieveSummary
	};
	
	return {
		OrionIndexer: OrionIndexer
	};
});