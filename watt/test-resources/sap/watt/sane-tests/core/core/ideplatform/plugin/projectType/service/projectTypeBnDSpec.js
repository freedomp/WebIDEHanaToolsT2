define(["STF"], function (STF) {
	"use strict";

	var suiteName = "projectTypeBnDTest";
	describe.skip("Project Type Service qUnit Test - Built In & Default Types", function () {
		var getService = STF.getServicePartial(suiteName);
		var oProjectTypeService,oFileSystemService,oFakeFileDAO;


		before(function () {
			return STF.startWebIde(suiteName, {
				config: "core/core/ideplatform/plugin/projectType/configBnD.json"
			}).then(function (webIdeWindowObj) {
				oProjectTypeService = getService("projectType");
				oFileSystemService = getService("filesystem.documentProvider");
				oFakeFileDAO= getService("fakeFileDAO");
				
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
				"includes": [],
				"icon": undefined
			},
			"ProjType2": {
				"id": "ProjType2",
				"displayName": "second",
				"description": "second!",
				"includes": [],
				"icon": undefined
			},
			"BuiltInType1": {
				"id": "BuiltInType1",
				"displayName": "BuiltIn",
				"description": "BuiltIn!",
				"isBuiltIn": true,
				"includes": [],
				"icon": undefined
			},
			"DefaultType1": {
				"id": "DefaultType1",
				"displayName": "Default",
				"description": "Default!",
				"isDefault": true,
				"includes": [],
				"icon": undefined

			}
		};

		// Copies the properties to a new object so it can be compare with deepEqual.
		// Only truthy values are copied.
		function objectFromCloned(cloned) {
			var obj = {};
			for (var key in cloned) {
				obj[key] = cloned[key];
			}
			return obj;
		}

		// Return a promise to a project which has the specified types.
		// The project name is optional. A generated name will be used if not sent.
		// Note that if you send a project name, make sure it was not used up to that point to avoid cache
		// issues.
		function getProjectWithTypes(types, projectName) {
			if (!projectName) {
				// Each time the project name must be different due to document caching on the document provider level.
				// Therefore we keep a static variable with the current project number.
				if (!getProjectWithTypes.projectNumber) {
					getProjectWithTypes.projectNumber = 1;
				} else {
					++getProjectWithTypes.projectNumber;
				}
				projectName = "genProject" + getProjectWithTypes.projectNumber;
			}

			// Set up the project structure
			var content = {};
			content[projectName] = {
				".project.json": JSON.stringify({
					"projectType": types
				})
			};
			return oFakeFileDAO.setContent(content).then(function () {
				return oFileSystemService.getDocument("/" + projectName);
			});
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
		function attachEventHandlerWithParams(project, added, removed) {
			var eventHandler = function (event) {
				++eventHandler.numberOfTimesCalled;

				var eventProject = event.params.projectDocument;
				var eventAdded = event.params.added;
				var eventRemoved = event.params.removed;

				strictEqual(event.name, "projectTypesUpdated", "Event name");
				deepEqual(eventAdded, added || [], "Added list");
				deepEqual(eventRemoved, removed || [], "Removed list");
				strictEqual(eventProject, project, "Project");
			};
			eventHandler.numberOfTimesCalled = 0;
			oProjectTypeService.attachEvent("projectTypesUpdated", eventHandler);
			return eventHandler;
		}

		function removeEventListener() {
			// Remove the first event listeners from the project type.
			// If a test ever attaches more than 1 event listener this should be changed to have the
			// event listeners list and loop over it, detaching all the listeners (since we can't know if
			// there are any remaining listeners from the Proxy interface).
			oProjectTypeService.detachEvent("projectTypesUpdated", this.eventHandler);
		}


		describe("configure projectType with no id (required field)", function () {
			it("getAllTypes returns an empty array", function () {
				return oProjectTypeService.getAllTypes().then(function (types) {
					assert.equal(types.length, 0);
				});
			});

		});

		describe("getAllTypes", function () {
			it("returns all the configured types with default value for display name", function () {
				return oProjectTypeService.getAllTypes().then(function (types) {
					types = types.map(objectFromCloned);
					assert.deepEqual(types,
						["ProjType1", "ProjType2", "BuiltInType1", "DefaultType1"].map(
							function (projType) {
								return returnedProjectTypes[projType];
							}
						));
				});
			});
		});


		describe("getProjectTypes", function () {
			it("returns default types when there are no project settings", function () {
				// Set up the project structure
				return oFakeFileDAO.setContent({
					"project1": {
						"file1": "a",
						".project.json": JSON.stringify({
							"projectType": []
						})
					},
					"project2": {
						"file2": "b",
						".project.json": JSON.stringify({
							"projectType": ["ProjType1"]
						})
					},
					"project3": {
						".project.json": JSON.stringify({
							"projectType": ["DefaultType1"]
						})
					}
				}).then(function () {
					return Q.all([
						oFileSystemService.getDocument("/project1"),
						oFileSystemService.getDocument("/project2/file2"),
						oFileSystemService.getDocument("/project3")
					]).spread(
						function (proj1, proj2, proj3) {
							return Q.all([
								oProjectTypeService.getProjectTypes(proj1),
								oProjectTypeService.getProjectTypes(proj2),
								oProjectTypeService.getProjectTypes(proj3)
							]).spread(function (types1, types2, types3) {
								assert.deepEqual(types1, [returnedProjectTypes["DefaultType1"],
									returnedProjectTypes["BuiltInType1"]]);
								assert.deepEqual(types2, [returnedProjectTypes["ProjType1"],
									returnedProjectTypes["BuiltInType1"]]);
								assert.deepEqual(types3, [returnedProjectTypes["DefaultType1"],
									returnedProjectTypes["BuiltInType1"]]);
							});
						}
					);
				});
			});
		});
		describe("addProjectTypes", function () {
			after(removeEventListener);
			it("does nothing when adding empty project types list to empty project types list", function () {
				var that = this;
				return getProjectWithTypes([]).then(function (proj) {
					that.eventHandler = attachEventHandlerWithParams(proj);
					return oProjectTypeService.addProjectTypes(proj, []).then(function () {
						return oProjectTypeService.getProjectTypes(proj).then(function (types) {
							assert.deepEqual(types.map(objectFromCloned), [
								returnedProjectTypes["DefaultType1"],
								returnedProjectTypes["BuiltInType1"]
							]);
							assert.equal(that.eventHandler.numberOfTimesCalled, 0);
						});
					});
				});
			});

			it("does nothing when adding empty project types list to existing project types list", function () {
				var that = this;
				return getProjectWithTypes(["ProjType1"]).then(function (proj) {
					that.eventHandler = attachEventHandlerWithParams(proj);
					return oProjectTypeService.addProjectTypes(proj, []).then(function () {
						return oProjectTypeService.getProjectTypes(proj).then(function (types) {
							assert.deepEqual(types.map(objectFromCloned), [
								returnedProjectTypes["ProjType1"],
								returnedProjectTypes["BuiltInType1"]
							]);
							assert.equal(that.eventHandler.numberOfTimesCalled, 0);
						});
					});
				});
			});

			it("does nothing when adding empty project types list to existing project types list with default type", function () {
				var that = this;
				return getProjectWithTypes(["DefaultType1"]).then(function (proj) {
					that.eventHandler = attachEventHandlerWithParams(proj);
					return oProjectTypeService.addProjectTypes(proj, []).then(function () {
						return oProjectTypeService.getProjectTypes(proj).then(function (types) {
							assert.deepEqual(types.map(objectFromCloned), [
								returnedProjectTypes["DefaultType1"],
								returnedProjectTypes["BuiltInType1"]
							]);
							assert.equal(that.eventHandler.numberOfTimesCalled, 0);
						});
					});
				});
			});

			it("does nothing when adding empty project types list to existing project types list with default type and other", function () {
				var that = this;
				return getProjectWithTypes(["ProjType1", "DefaultType1"]).then(function (proj) {
					that.eventHandler = attachEventHandlerWithParams(proj);
					return oProjectTypeService.addProjectTypes(proj, []).then(function () {
						return oProjectTypeService.getProjectTypes(proj).then(function (types) {
							assert.deepEqual(types.map(objectFromCloned), [
								returnedProjectTypes["ProjType1"],
								returnedProjectTypes["DefaultType1"],
								returnedProjectTypes["BuiltInType1"]
							]);
							assert.equal(that.eventHandler.numberOfTimesCalled, 0);
						});
					});
				});
			});

			it("adds project type with no includes to empty project types list", function () {
				var that = this;
				return getProjectWithTypes([]).then(function (proj) {
					that.eventHandler = attachEventHandlerWithParams(proj, ["ProjType1"]);
					return oProjectTypeService.addProjectTypes(proj, ["ProjType1"]).then(function () {
						return oProjectTypeService.getProjectTypes(proj).then(function (types) {
							assert.deepEqual(types.map(objectFromCloned), [
								returnedProjectTypes["ProjType1"],
								returnedProjectTypes["BuiltInType1"]
							]);
							assert.equal(that.eventHandler.numberOfTimesCalled, 1);
						});
					});
				});
			});
		});

		describe("removeProjectTypes", function () {
			after(removeEventListener);


			it("does nothing when removing empty list from empty list", function () {
				var that = this;
				return getProjectWithTypes([]).then(function (proj) {
					that.eventHandler = attachEventHandlerWithParams(proj);
					return oProjectTypeService.removeProjectTypes(proj, []).then(function () {
						return oProjectTypeService.getProjectTypes(proj).then(function (types) {
							assert.deepEqual(types, [
								returnedProjectTypes["DefaultType1"],
								returnedProjectTypes["BuiltInType1"]
							]);
							assert.equal(that.eventHandler.numberOfTimesCalled, 0);
						});
					});
				});
			});

			it("does nothing when removing empty list from non-empty list", function () {
				var that = this;
				return getProjectWithTypes(["ProjType1"]).then(function (proj) {
					that.eventHandler = attachEventHandlerWithParams(proj);
					return oProjectTypeService.removeProjectTypes(proj, []).then(function () {
						return oProjectTypeService.getProjectTypes(proj).then(function (types) {
							assert.deepEqual(types.map(objectFromCloned), [
								returnedProjectTypes["ProjType1"],
								returnedProjectTypes["BuiltInType1"]
							]);
							assert.equal(that.eventHandler.numberOfTimesCalled, 0);
						});
					});
				});
			});

			it("does nothing when removing non-existing project types", function () {
				var that = this;
				return getProjectWithTypes(["ProjType1"]).then(function (proj) {
					that.eventHandler = attachEventHandlerWithParams(proj);
					return oProjectTypeService.removeProjectTypes(proj, ["dummy"]).then(function () {
						return oProjectTypeService.getProjectTypes(proj).then(function (types) {
							assert.deepEqual(types.map(objectFromCloned), [
								returnedProjectTypes["ProjType1"],
								returnedProjectTypes["BuiltInType1"]
							]);
							assert.equal(that.eventHandler.numberOfTimesCalled, 0);
						});
					});
				});
			});

			it("removes the sent project type from the list", function () {
				var that = this;
				return getProjectWithTypes(["ProjType1"]).then(function (proj) {
					that.eventHandler = attachEventHandlerWithParams(proj, [], ["ProjType1"]);
					return oProjectTypeService.removeProjectTypes(proj, ["ProjType1"]).then(function () {
						return oProjectTypeService.getProjectTypes(proj).then(function (types) {
							assert.deepEqual(types, [
								returnedProjectTypes["DefaultType1"],
								returnedProjectTypes["BuiltInType1"]
							]);
							assert.equal(that.eventHandler.numberOfTimesCalled, 1);
						});
					});
				});
			});
		});

		describe("setProjectTypes", function () {
			after(removeEventListener);


			it("does nothing when setting an empty list when there are no existing types", function () {
				var that = this;
				return getProjectWithTypes([]).then(function (proj) {
					return oProjectTypeService.setProjectTypes(proj, []).then(function () {
						return oProjectTypeService.getProjectTypes(proj).then(function (types) {
							assert.deepEqual(types, [
								returnedProjectTypes["DefaultType1"],
								returnedProjectTypes["BuiltInType1"]]);
						});
					});
				});
			});

			it("sets empty list when there are existing types", function () {
				var that = this;
				return getProjectWithTypes(["ProjType1", "DefaultType1"]).then(function (proj) {
					//TODO  "DefaultType1" should not be in the removed list, since it is added back
					that.eventHandler = attachEventHandlerWithParams(proj, [], ["ProjType1", "DefaultType1"]);
					return oProjectTypeService.setProjectTypes(proj, []).then(function () {
						return oProjectTypeService.getProjectTypes(proj).then(function (types) {
							assert.deepEqual(types, [
								returnedProjectTypes["DefaultType1"],
								returnedProjectTypes["BuiltInType1"]]);
							assert.equal(that.eventHandler.numberOfTimesCalled, 1);
						});
					});
				});
			});

			it("replaces the existing list with the new list and sends the difference in an event", function () {
				var that = this;
				return getProjectWithTypes(["ProjType2", "DefaultType1"]).then(function (proj) {
					that.eventHandler = attachEventHandlerWithParams(proj, ["ProjType1"], ["ProjType2", "DefaultType1"]);
					return oProjectTypeService.setProjectTypes(proj, ["ProjType1"]).then(function () {
						return oProjectTypeService.getProjectTypes(proj).then(function (types) {
							assert.deepEqual(types.map(objectFromCloned), [
								returnedProjectTypes["ProjType1"],
								returnedProjectTypes["BuiltInType1"]
							]);
							assert.equal(that.eventHandler.numberOfTimesCalled, 1);
						});
					});
				});
			});

			it("does nothing when setting the same list", function () {
				var that = this;
				return getProjectWithTypes(["DefaultType1", "ProjType1"]).then(function (proj) {
					that.eventHandler = attachEventHandlerWithParams(proj);
					return oProjectTypeService.setProjectTypes(proj, ["DefaultType1", "ProjType1"]).then(function () {
						return oProjectTypeService.getProjectTypes(proj).then(function (types) {
							assert.deepEqual(types.map(objectFromCloned), [
								returnedProjectTypes["DefaultType1"],
								returnedProjectTypes["ProjType1"],
								returnedProjectTypes["BuiltInType1"]
							]);
							assert.equal(that.eventHandler.numberOfTimesCalled, 0);
						});
					});
				});
			});
		});
	});
});