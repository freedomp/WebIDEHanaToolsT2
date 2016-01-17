define(["STF", "util/orionUtils"], function (STF, OrionUtils) {
	"use strict";

	var suiteName = "projectTypeTest";
	describe("Project Type Service Unit  test", function () {
		var getService = STF.getServicePartial(suiteName);
		var oProjectTypeService, oDocumentService, oProjectTypeServiceImpl;

		before(function () {
			return OrionUtils.startWebIdeWithOrion(suiteName, {
				config: "core/core/ideplatform/plugin/projectType/config.json"
			}).then(function (webIdeWindowObj) {

				// The configuration in mConsumer creates a project type hierarchy that looks like this (without expanding the circular includes):
				// ProjType1
				// 	ProjType4
				// 		ProjType5
				// 			ProjType6
				// 		ProjType3
				// 	ProjType6
				//
				// ProjType2
				// 	ProjType7
				//      ProjType2
				//
				// ProjType3
				//
				// ProjType4
				// 	ProjType5
				// 		ProjType6
				// 	ProjType3
				//
				// ProjType5
				// 	ProjType6
				//
				// ProjType6
				//
				// ProjType7
				// 	ProjType2
				//      ProjType7
				//
				// ProjType8
				// 	ProjType8

				oProjectTypeService = getService("projectType");
				oDocumentService = getService("document");
				
				return oProjectTypeService.$().then(function(oNonLazyProxy) {
					return oNonLazyProxy._getImpl({});
				}).then(function(oImpl){
					oProjectTypeServiceImpl = oImpl;
				});
			});
		});

		after(function () {
			STF.shutdownWebIde(suiteName);
		});

		// A map of the project types expected to be returned from getAllTypes, according to project type id
		var returnedProjectTypes = {
			"ProjType1": {
				"id": "ProjType1",
				"displayName": "first",
				"description": "first!",
				"includes": ["ProjType4", "ProjType6"]
			},
			"ProjType2": {
				"id": "ProjType2",
				"displayName": "second",
				"description": "second!",
				"includes": ["ProjType7"]
			},
			"ProjType3": {
				"id": "ProjType3",
				"displayName": "ProjType3", // The default display name is the id
				"includes": [] // The default includes is empty array
			},
			"ProjType4": {
				"id": "ProjType4",
				"displayName": "ProjType4", // The default display name is the id
				"includes": ["ProjType5", "ProjType3"]
			},
			"ProjType5": {
				"id": "ProjType5",
				"displayName": "second level include",
				"includes": ["ProjType6"]
			},
			"ProjType6": {
				"id": "ProjType6",
				"displayName": "Included in several levels",
				"includes": []
			},
			"ProjType7": {
				"id": "ProjType7",
				"displayName": "ProjType7",
				"includes": ["ProjType2"]
			},
			"ProjType8": {
				"id": "ProjType8",
				"displayName": "ProjType8",
				"includes": ["ProjType8"] // circular, includes itself
			}
		};

		// Copies the properties to a new object so it can be compare with deepEqual.
		// Only truthy values are copied.
		function objectFromCloned(cloned) {
			var obj = {};
			for (var key in cloned) {
				if (cloned[key]) {
					obj[key] = cloned[key];
				}
			}
			return obj;
		}

		describe("getAllTypes", function () {
			it("returns all the configured types with default value for display name", function () {
				return oProjectTypeService.getAllTypes().then(function (types) {
					types = types.map(objectFromCloned);
					var returenedTypes = ["ProjType1", "ProjType2", "ProjType3", "ProjType4", "ProjType5", "ProjType6", "ProjType7", "ProjType8"].map(
						function (projType) { return returnedProjectTypes[projType]; }
					);
					assert.deepEqual(types,returenedTypes);
				});
			});
		});

		describe("getType", function () {
			it("returns the type with default values",function () {
				var projType4 = returnedProjectTypes["ProjType4"];
				return oProjectTypeService.getType("ProjType4").then(function (type) {
					assert.equal(type.id, projType4.id);
					assert.equal(type.displayName, projType4.displayName);
					assert.strictEqual(type.description, "");
					assert.deepEqual(type.includes, projType4.includes);
				});
			});

			it("returns empty array as default includes", function () {
				return oProjectTypeService.getType("ProjType3").then(function (type) {
					assert.equal(type.id, "ProjType3");
					assert.deepEqual(type.includes, []);
				});
			});

		});

		describe("getIncludedTypes", function () {

			it("returns only the project type when there are no included types", function () {
				return oProjectTypeService.getIncludedTypes("ProjType3").then(function (types) {
					assert.deepEqual(types, ["ProjType3"]);
				});
			});

			it("returns the project type and the defined included type when it's one level deep", function () {
				return oProjectTypeService.getIncludedTypes("ProjType5").then(function (types) {
					assert.deepEqual(types, ["ProjType5", "ProjType6"]);
				});
			});

			it("returns the project type and the included types in all levels", function () {
				return oProjectTypeService.getIncludedTypes("ProjType4").then(function (types) {
					assert.deepEqual(types, ["ProjType4", "ProjType5", "ProjType3", "ProjType6"]);
				});
			});

			it("returns each project type once even when it's included in several types", function () {
				return oProjectTypeService.getIncludedTypes("ProjType1").then(function (types) {
					// ProjType6 is included in several levels:
					// ProjType1 -> ProjType6
					// ProjType1 -> ProjType4 -> ProjType5 -> ProjType6
					assert.deepEqual(types, ["ProjType1", "ProjType4", "ProjType6", "ProjType5", "ProjType3"]);
				});
			});

			it("returns each project type once when there's a circular reference", function () {
				return oProjectTypeService.getIncludedTypes("ProjType7").then(function (types) {
					// ProjType7 includes ProjType2, ProjType2 includes ProjType7
					assert.deepEqual(types, ["ProjType7", "ProjType2"]);
				});
			});

			it("returns each project type once when it references itself", function () {
				return oProjectTypeService.getIncludedTypes("ProjType8").then(function (types) {
					// ProjType8 includes itself
					assert.deepEqual(types, ["ProjType8"]);
				});
			});
		});

		function getProjectWithTypes2(sProjectName, aTypes) {
			var oDocument = {};
			var oProjectJsonFile = {};
			var sContent = {};

			oProjectJsonFile.getEntity = function() {
				return {
					getName : function() {
						return ".project.json";
					},
					getFullPath : function() {
						return "/project1/.project.json";
					},
					getDAO : function() {
						return "workspace";
					}
				};
			};

			oProjectJsonFile.getContent = function() {
				return Q(this.sContent);
			};

			oProjectJsonFile.setContent = function(sNewContent) {
				if (sNewContent) {
					this.sContent = sNewContent;
				}
				return Q(this.sContent);
			};

			oProjectJsonFile.save = function () {
				return Q();
			};

			oProjectJsonFile.init = function (aTypes) {
				if (aTypes) {
					this.sContent = JSON.stringify({
						"projectType" : aTypes
					});
				}
			};

			oProjectJsonFile.init(aTypes);

			oDocument.getProject = function() {
				var oProjectDocument = {};
				oProjectDocument.oAccessPromise = Q();
				oProjectDocument.getEntity = function() {
					return {
						getName : function() {
							return sProjectName;
						},
						getFullPath : function() {
							return "/" + sProjectName;
						},
						getDAO : function() {
							return "workspace";
						}
					};
				};
				oProjectDocument.getFolderContent = function() {
					return [oProjectJsonFile];
				};
				return Q(oProjectDocument);
			};

			assert.ok(oDocumentService.getDocumentByPath !== undefined);
			oDocumentService.getDocumentByPath = function() {
				return Q(oProjectJsonFile);
			};

			return Q(oDocument);
		}

		/**
		 * Attach an event handler to event projectTypesUpdated of the consumer and return it.
		 * The event handlers expects the event arguments to be as sent to this function.
		 * Another expectation should be added that the event handler was called as expected (usually once or not at all).
		 * For this, the event handler function has a property called numberOfTimesCalled.
		 * It should be checked in the test itself.
		 * Important: after the test is finished make sure to call removeEventListener to stop the event handler from
		 * handling the event so it doesn't interfere with other tests!
		 * @param {object} project
		 * @param {[string]=} added - optional, default is empty array
		 * @param {[string]=} removed - optional, default is empty array
		 * @return function
		 */
			//temp - till we'll find the clouser issue
		var a,r;
		function attachEventHandlerWithParams(project, added, removed) {
			a = added;
			r=removed;
			var eventHandler = function (event) {
				++eventHandler.numberOfTimesCalled;

				var eventProject = event.params.projectDocument;
				var eventAdded = event.params.added;
				var eventRemoved = event.params.removed;

				assert.strictEqual(event.name, "projectTypesUpdated", "Event name");
				assert.deepEqual(eventAdded, a || [], "Added list");
				assert.deepEqual(eventRemoved, r || [], "Removed list");
				project.getProject().then(function(proj) {
					assert.strictEqual(eventProject.getEntity().getName(), proj.getEntity().getName(), "Project");
				}).done();
			};
			eventHandler.numberOfTimesCalled = 0;
			oProjectTypeService.attachEvent("projectTypesUpdated", eventHandler);

			return eventHandler;
		};

		function removeEventListener() {
			// Remove the first event listeners from the project type.
			// If a test ever attaches more than 1 event listener this should be changed to have the
			// event listeners list and loop over it, detaching all the listeners (since we can't know if
			// there are any remaining listeners from the Proxy interface).
			oProjectTypeService.detachEvent("projectTypesUpdated", this.eventHandler);
		}

		describe("getProjectTypes", function (){

				
			it("returns empty list when there are no project settings", function () {
				return Q.all([
					getProjectWithTypes2("proj1",[]),
					getProjectWithOutProjectTypes("proj2",[])
				]).spread(
					function (proj1,proj2) {
						return Q.all([
							oProjectTypeService.getProjectTypes(proj1),
							oProjectTypeService.getProjectTypes(proj2),
						]).spread(function (types1,types2) {
							assert.deepEqual(types1, []);
							assert.deepEqual(types2, []);
						});
					}
				);
			});
	
	
			function getProjectWithOutProjectTypes(sProjectName, aTypes) {
				var oDocument = {};
				oDocument.oAccessPromise = Q();
				var oProjectJsonFile = {};
				oProjectJsonFile.oAccessPromise = Q();
				var sContent = {};
	
				oProjectJsonFile.getEntity = function() {
					return {
						getName : function() {
							return ".project.json";
						},
						getFullPath : function() {
							return "/project1/.project.json";
						},
						getDAO : function() {
							return "workspace";
						}
					};
				};
	
				oProjectJsonFile.getContent = function() {
					return Q(this.sContent);
				};
	
				oProjectJsonFile.setContent = function(sNewContent) {
					if (sNewContent) {
						this.sContent = sNewContent;
					}
					return Q(this.sContent);
				};
	
				oProjectJsonFile.save = function () {
					return Q();
				};
	
	
				oDocument.getProject = function() {
					var oProjectDocument = {};
					oProjectDocument.oAccessPromise = Q();
					oProjectDocument.getEntity = function() {
						return {
							getName : function() {
								return sProjectName;
							},
							getFullPath : function() {
								return "/" + sProjectName;
							},
							getDAO : function() {
								return "workspace";
							}
						};
					};
					oProjectDocument.getFolderContent = function() {
						return [oProjectJsonFile];
					};
					return Q(oProjectDocument);
				};
	
				assert.ok(oDocumentService.getDocumentByPath !== undefined);
				oDocumentService.getDocumentByPath = function() {
					return Q(oProjectJsonFile);
				};
	
				return Q(oDocument);
			}
	
			it("getProjectTypes", function () {
				return getProjectWithTypes2("proj1",["ProjType3"]).then(function (proj) {
					return oProjectTypeService.getProjectTypes(proj).then(function (types) {
						assert.deepEqual(types.map(objectFromCloned), [ returnedProjectTypes["ProjType3"] ]);
					});
				});
			});
	
			it("does not return non-existing project type", function () {
				return getProjectWithTypes2("proj1", ["dummy"]).then(function (proj) {
					return oProjectTypeService.getProjectTypes(proj).then(function (types) {
						assert.deepEqual(types, []);
					});
				});
			});
	
			it("only returns existing project types", function () {
				return getProjectWithTypes2("proj1",["dummy1", "ProjType6", "dummy2"]).then(function (proj) {
					return oProjectTypeService.getProjectTypes(proj).then(function (types) {
						assert.deepEqual(types.map(objectFromCloned), [ returnedProjectTypes["ProjType6"] ]);
					});
				});
			});
	
			it("returns the defined types in order of appearance, without their included types", function () {
				return getProjectWithTypes2("proj1", ["ProjType7", "ProjType1"]).then(function (proj) {
					return oProjectTypeService.getProjectTypes(proj).then(function (types) {
						assert.deepEqual(types.map(objectFromCloned), [
							returnedProjectTypes["ProjType1"] ,
							returnedProjectTypes["ProjType7"]
						]);
					});
				});
			});
	

		});
		describe("addProjectTypes", function (){
			
			after(removeEventListener);

			it("does nothing when adding empty project types list to empty project types list", function () {
				var that = this;
				return getProjectWithTypes2("proj1", []).then(function (proj) {
					that.eventHandler = attachEventHandlerWithParams(proj);
					return oProjectTypeService.addProjectTypes(proj, []).then(function () {
						return oProjectTypeService.getProjectTypes(proj).then(function (types) {
							assert.deepEqual(types.map(objectFromCloned), []);
							assert.equal(that.eventHandler.numberOfTimesCalled, 0);
						});
					});
				});
			});

			it("does nothing when adding empty project types list to existing project types list", function () {
				var that = this;
				return getProjectWithTypes2("proj1", ["ProjType1"]).then(function (proj) {
					that.eventHandler = attachEventHandlerWithParams(proj);
					return oProjectTypeService.addProjectTypes(proj, []).then(function () {
						return oProjectTypeService.getProjectTypes(proj).then(function (types) {
							assert.deepEqual(types.map(objectFromCloned), [
								returnedProjectTypes["ProjType1"]
							]);
							assert.equal(that.eventHandler.numberOfTimesCalled, 0);
						});
					});
				});
			});

			it("does nothing when adding already existing project types with no includes", function () {
				var that = this;
				return getProjectWithTypes2("proj1",["ProjType6"]).then(function (proj) {
					that.eventHandler = attachEventHandlerWithParams(proj);
					return oProjectTypeService.addProjectTypes(proj, ["ProjType6"]).then(function () {
						return oProjectTypeService.getProjectTypes(proj).then(function (types) {
							assert.deepEqual(types.map(objectFromCloned), [
								returnedProjectTypes["ProjType6"]
							]);
							assert.equal(that.eventHandler.numberOfTimesCalled, 0);
						});
					});
				});
			});

			it("adds project type with no includes to empty project types list", function () {
				var that = this;
				return getProjectWithTypes2("proj1",[]).then(function (proj) {
					that.eventHandler = attachEventHandlerWithParams(proj, ["ProjType6"]);
					return oProjectTypeService.addProjectTypes(proj, ["ProjType6"]).then(function () {
						return oProjectTypeService.getProjectTypes(proj).then(function (types) {
							assert.deepEqual(types.map(objectFromCloned), [ returnedProjectTypes["ProjType6"] ]);
							assert.equal(that.eventHandler.numberOfTimesCalled, 1);
						});
					});
				});
			});

			it("adds project type with no includes to existing project types list", function () {
				var that = this;
				return getProjectWithTypes2("proj1",["ProjType1"]).then(function (proj) {
					that.eventHandler = attachEventHandlerWithParams(proj, ["ProjType6"]);
					return oProjectTypeService.addProjectTypes(proj, ["ProjType6"]).then(function () {
						return oProjectTypeService.getProjectTypes(proj).then(function (types) {
							assert.deepEqual(types.map(objectFromCloned), [
								returnedProjectTypes["ProjType1"],
								returnedProjectTypes["ProjType6"]
							]);
							assert.equal(that.eventHandler.numberOfTimesCalled, 1);
						});
					});
				});
			});

			it("adds project type with one level of includes to existing project types list", function () {
				var that = this;
				return getProjectWithTypes2("proj1",["ProjType8"]).then(function (proj) {
					that.eventHandler = attachEventHandlerWithParams(proj, ["ProjType5", "ProjType6"]);
					return oProjectTypeService.addProjectTypes(proj, ["ProjType5"]).then(function () {
						return oProjectTypeService.getProjectTypes(proj).then(function (types) {
							assert.deepEqual(types.map(objectFromCloned), [
								returnedProjectTypes["ProjType5"],
								returnedProjectTypes["ProjType6"],
								returnedProjectTypes["ProjType8"]
							]);
							assert.equal(that.eventHandler.numberOfTimesCalled, 1);
						});
					});
				});
			});

			it("adds project type with multiple levels of includes to existing project types list", function () {
				var that = this;
				return getProjectWithTypes2("proj1", ["ProjType8"]).then(function (proj) {
					that.eventHandler = attachEventHandlerWithParams(proj, ["ProjType1", "ProjType4", "ProjType6", "ProjType5", "ProjType3"]);
					return oProjectTypeService.addProjectTypes(proj, ["ProjType1"]).then(function () {
						return oProjectTypeService.getProjectTypes(proj).then(function (types) {
							assert.deepEqual(types.map(objectFromCloned), [
								returnedProjectTypes["ProjType1"],
								returnedProjectTypes["ProjType3"],
								returnedProjectTypes["ProjType4"],
								returnedProjectTypes["ProjType5"],
								returnedProjectTypes["ProjType6"],
								returnedProjectTypes["ProjType8"]
							]);
							assert.equal(that.eventHandler.numberOfTimesCalled, 1);
						});
					});
				});
			});

			it("adds several project types with includes to existing project types list", function () {
				var that = this;
				return getProjectWithTypes2("proj1", ["ProjType8"]).then(function (proj) {
					that.eventHandler = attachEventHandlerWithParams(proj, ["ProjType5", "ProjType6", "ProjType4", "ProjType3"]);
					return oProjectTypeService.addProjectTypes(proj, ["ProjType5", "ProjType4"]).then(function () {
						return oProjectTypeService.getProjectTypes(proj).then(function (types) {
							assert.deepEqual(types.map(objectFromCloned), [
								returnedProjectTypes["ProjType3"],
								returnedProjectTypes["ProjType4"],
								returnedProjectTypes["ProjType5"],
								returnedProjectTypes["ProjType6"],
								returnedProjectTypes["ProjType8"]
							]);
							assert.equal(that.eventHandler.numberOfTimesCalled, 1);
						});
					});
				});
			});

			it("adds the includes of existing project type", function () {
				var that = this;
				return getProjectWithTypes2("proj1", ["ProjType4"]).then(function (proj) {
					that.eventHandler = attachEventHandlerWithParams(proj, ["ProjType5", "ProjType3", "ProjType6"]);
					return oProjectTypeService.addProjectTypes(proj, ["ProjType4"]).then(function () {
						return oProjectTypeService.getProjectTypes(proj).then(function (types) {
							assert.deepEqual(types.map(objectFromCloned), [
								returnedProjectTypes["ProjType3"],
								returnedProjectTypes["ProjType4"],
								returnedProjectTypes["ProjType5"],
								returnedProjectTypes["ProjType6"]
							]);
							assert.equal(that.eventHandler.numberOfTimesCalled, 1);
						});
					});
				});
			});

			it("adds project types with circular includes to existing project types list", function () {
				var that = this;
				return getProjectWithTypes2("proj1",["ProjType1"]).then(function (proj) {
					that.eventHandler = attachEventHandlerWithParams(proj, ["ProjType2", "ProjType7", "ProjType8"]);
					return oProjectTypeService.addProjectTypes(proj, ["ProjType2", "ProjType8"]).then(function () {
						return oProjectTypeService.getProjectTypes(proj).then(function (types) {
							assert.deepEqual(types.map(objectFromCloned), [
								returnedProjectTypes["ProjType1"],
								returnedProjectTypes["ProjType2"],
								returnedProjectTypes["ProjType7"],
								returnedProjectTypes["ProjType8"]
							]);
							assert.equal(that.eventHandler.numberOfTimesCalled, 1);
						});
					});
				});
			});
		});

		describe("removeProjectTypes",  function (){
			after(removeEventListener);
			it("does nothing when removing empty list from empty list", function () {
				var that = this;
				return getProjectWithTypes2("proj1", []).then(function (proj) {
					that.eventHandler = attachEventHandlerWithParams(proj);
					return oProjectTypeService.removeProjectTypes(proj, []).then(function () {
						return oProjectTypeService.getProjectTypes(proj).then(function (types) {
							assert.deepEqual(types, []);
							assert.equal(that.eventHandler.numberOfTimesCalled, 0);
						});
					});
				});
			});

			it("does nothing when removing empty list from non-empty list", function () {
				var that = this;
				return getProjectWithTypes2("proj1", ["ProjType1"]).then(function (proj) {
					that.eventHandler = attachEventHandlerWithParams(proj);
					return oProjectTypeService.removeProjectTypes(proj, []).then(function () {
						return oProjectTypeService.getProjectTypes(proj).then(function (types) {
							assert.deepEqual(types.map(objectFromCloned), [returnedProjectTypes["ProjType1"]]);
							assert.equal(that.eventHandler.numberOfTimesCalled, 0);
						});
					});
				});
			});

			it("does nothing when removing non-existing project types", function () {
				var that = this;
				return getProjectWithTypes2("proj1", ["ProjType1"]).then(function (proj) {
					that.eventHandler = attachEventHandlerWithParams(proj);
					return oProjectTypeService.removeProjectTypes(proj, ["dummy"]).then(function () {
						return oProjectTypeService.getProjectTypes(proj).then(function (types) {
							assert.deepEqual(types.map(objectFromCloned), [returnedProjectTypes["ProjType1"]]);
							assert.equal(that.eventHandler.numberOfTimesCalled, 0);
						});
					});
				});
			});

			it("does nothing when removing project types not in the list", function () {
				var that = this;
				return getProjectWithTypes2("proj1",["ProjType1"]).then(function (proj) {
					that.eventHandler = attachEventHandlerWithParams(proj);
					return oProjectTypeService.removeProjectTypes(proj, ["dummy"]).then(function () {
						return oProjectTypeService.getProjectTypes(proj).then(function (types) {
							assert.deepEqual(types.map(objectFromCloned), [returnedProjectTypes["ProjType1"]]);
							assert.equal(that.eventHandler.numberOfTimesCalled, 0);
						});
					});
				});
			});

			it("removes the sent project type from the list", function () {
				var that = this;
				return getProjectWithTypes2("proj1",["ProjType1"]).then(function (proj) {
					that.eventHandler = attachEventHandlerWithParams(proj, [], ["ProjType1"]);
					return oProjectTypeService.removeProjectTypes(proj, ["ProjType1"]).then(function () {
						return oProjectTypeService.getProjectTypes(proj).then(function (types) {
							assert.deepEqual(types, []);
							assert.equal(that.eventHandler.numberOfTimesCalled, 1);
						});
					});
				});
			});

			it("removes all the sent project types from the list", function () {
				var that = this;
				return getProjectWithTypes2("proj1",["ProjType1", "ProjType2", "ProjType3"]).then(function (proj) {
					that.eventHandler = attachEventHandlerWithParams(proj, [], ["ProjType2", "ProjType3"]);
					return oProjectTypeService.removeProjectTypes(proj, ["ProjType3", "ProjType2"]).then(function () {
						return oProjectTypeService.getProjectTypes(proj).then(function (types) {
							assert.deepEqual(types.map(objectFromCloned), [returnedProjectTypes["ProjType1"]]);
							assert.equal(that.eventHandler.numberOfTimesCalled, 1);
						});
					});
				});
			});

			it("removes the sent project type from the list and does not remove its included project types", function () {
				var that = this;
				return getProjectWithTypes2("proj1",["ProjType1", "ProjType4", "ProjType8"]).then(function (proj) {
					that.eventHandler = attachEventHandlerWithParams(proj, [], ["ProjType1"]);
					return oProjectTypeService.removeProjectTypes(proj, ["ProjType1"]).then(function () {
						return oProjectTypeService.getProjectTypes(proj).then(function (types) {
							assert.deepEqual(types.map(objectFromCloned), [
								returnedProjectTypes["ProjType4"],
								returnedProjectTypes["ProjType8"]
							]);
							assert.equal(that.eventHandler.numberOfTimesCalled, 1);
						});
					});
				});
			});
		});


		describe("setProjectTypes",  function (){
			after(removeEventListener);


			it("does nothing when setting an empty list when there are no existing types", function () {
				var that = this;
				return getProjectWithTypes2("proj1",[]).then(function (proj) {
					return oProjectTypeService.setProjectTypes(proj, []).then(function () {
						return oProjectTypeService.getProjectTypes(proj).then(function (types) {
							assert.deepEqual(types, []);
						});
					});
				});
			});

			it("sets empty list when there are existing types", function () {
				var that = this;
				return getProjectWithTypes2("proj1",["ProjType1", "ProjType4"]).then(function (proj) {
					that.eventHandler = attachEventHandlerWithParams(proj, [], ["ProjType1", "ProjType4"]);
					return oProjectTypeService.setProjectTypes(proj, []).then(function () {
						return oProjectTypeService.getProjectTypes(proj).then(function (types) {
							assert.deepEqual(types, []);
							assert.equal(that.eventHandler.numberOfTimesCalled, 1);
						});
					});
				});
			});

			it("replaces the existing list with the new list and sends the difference in an event",function () {
				var that = this;
				return getProjectWithTypes2("proj1",["ProjType2", "ProjType4"]).then(function (proj) {
					that.eventHandler = attachEventHandlerWithParams(proj, ["ProjType8", "ProjType6"], ["ProjType2", "ProjType4"]);
					return oProjectTypeService.setProjectTypes(proj, ["ProjType8", "ProjType6"]).then(function () {
						return oProjectTypeService.getProjectTypes(proj).then(function (types) {
							assert.deepEqual(types.map(objectFromCloned), [
								returnedProjectTypes["ProjType6"],
								returnedProjectTypes["ProjType8"]
							]);
							assert.equal(that.eventHandler.numberOfTimesCalled, 1);
						});
					});
				});
			});

			it("replaces the existing list with the new list without adding included project types",function () {
				var that = this;
				return getProjectWithTypes2("proj1",["ProjType4"]).then(function (proj) {
					that.eventHandler = attachEventHandlerWithParams(proj, ["ProjType1"], ["ProjType4"]);
					return oProjectTypeService.setProjectTypes(proj, ["ProjType1"]).then(function () {
						return oProjectTypeService.getProjectTypes(proj).then(function (types) {
							assert.deepEqual(types.map(objectFromCloned), [returnedProjectTypes["ProjType1"]]);
							assert.equal(that.eventHandler.numberOfTimesCalled, 1);
						});
					});
				});
			});

			it("replaces the existing list with a list that contains less types and no new types were added", function () {
				var that = this;
				return getProjectWithTypes2("proj1",["ProjType4", "ProjType3"]).then(function (proj) {
					that.eventHandler = attachEventHandlerWithParams(proj, [], ["ProjType4"]);
					return oProjectTypeService.setProjectTypes(proj, ["ProjType3"]).then(function () {
						return oProjectTypeService.getProjectTypes(proj).then(function (types) {
							assert.deepEqual(types.map(objectFromCloned), [returnedProjectTypes["ProjType3"]]);
							assert.equal(that.eventHandler.numberOfTimesCalled, 1);
						});
					});
				});
			});

			it("replaces the existing list with a list that contains all the existing types and new types", function () {
				var that = this;
				return getProjectWithTypes2("proj1",["ProjType4"]).then(function (proj) {
					that.eventHandler = attachEventHandlerWithParams(proj, ["ProjType3"]);
					return oProjectTypeService.setProjectTypes(proj, ["ProjType3", "ProjType4"]).then(function () {
						return oProjectTypeService.getProjectTypes(proj).then(function (types) {
							assert.deepEqual(types.map(objectFromCloned), [
								returnedProjectTypes["ProjType3"],
								returnedProjectTypes["ProjType4"]
							]);
							assert.equal(that.eventHandler.numberOfTimesCalled, 1);
						});
					});
				});
			});

			it("does nothing when setting the same list", function () {
				var that = this;
				return getProjectWithTypes2("proj1",["ProjType4", "ProjType6"]).then(function (proj) {
					that.eventHandler = attachEventHandlerWithParams(proj);
					return oProjectTypeService.setProjectTypes(proj, ["ProjType4", "ProjType6"]).then(function () {
						return oProjectTypeService.getProjectTypes(proj).then(function (types) {
							assert.deepEqual(types.map(objectFromCloned), [
								returnedProjectTypes["ProjType4"],
								returnedProjectTypes["ProjType6"]
							]);
							assert.equal(that.eventHandler.numberOfTimesCalled, 0);
						});
					});
				});
			});

			it("sets a list with the same project types in a different order and fires event when the first one has changed", function () {
				var that = this;
				return getProjectWithTypes2("proj1",["ProjType4", "ProjType6", "ProjType8"]).then(function (proj) {
					that.eventHandler = attachEventHandlerWithParams(proj, [], []);
					return oProjectTypeService.setProjectTypes(proj, ["ProjType8", "ProjType6", "ProjType4"]).then(function () {
						return oProjectTypeService.getProjectTypes(proj).then(function (types) {
							assert.deepEqual(types.map(objectFromCloned), [
								returnedProjectTypes["ProjType4"],
								returnedProjectTypes["ProjType6"],
								returnedProjectTypes["ProjType8"]
							]);
							assert.equal(that.eventHandler.numberOfTimesCalled, 1);
						});
					});
				});
			});

			it("sets a list with the same project types in a different order and fires event when the first one has not changed", function () {
				var that = this;
				return getProjectWithTypes2("proj1",["ProjType4", "ProjType6", "ProjType8"]).then(function (proj) {
					that.eventHandler = attachEventHandlerWithParams(proj, [], []);
					return oProjectTypeService.setProjectTypes(proj, ["ProjType4", "ProjType8", "ProjType6"]).then(function () {
						return oProjectTypeService.getProjectTypes(proj).then(function (types) {
							assert.deepEqual(types.map(objectFromCloned), [
								returnedProjectTypes["ProjType4"],
								returnedProjectTypes["ProjType6"],
								returnedProjectTypes["ProjType8"]
							]);
							assert.equal(that.eventHandler.numberOfTimesCalled, 1);
						});
					});
				});
			});
		});
	});
});