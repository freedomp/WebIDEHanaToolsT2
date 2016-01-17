/*Copyright © 2015 SAP SE or an affiliate company. All rights reserved.*/
define([
        "../../util/ResourceLoader"
    ],
	function(ResourceLoader) {

		var resourceLoader = new ResourceLoader("/watt/resources/sap/watt/hanaplugins/editor/plugin/hdbcalculationview");

		var PlaceSide = {
			PLC_UNKNOWN: 0,
			PLC_LEFT: 1,
			PLC_RIGHT: 2,
			PLC_PLACED: 3
		};

		var SCALE = 16;

		var AutoLayout = function(parameters) {
			this.diagram = parameters.diagram;
			this.viewNode = this.diagram.model.viewNode;

			this.inputInfoMap = {};
		};

		AutoLayout.prototype = {

			execute: function() {
				var that = this;

				var iCol, aTables;

				var centerInput, numLinkMax = 0;

				//Decide the center shape(input)based on the input with max. joins
				this.viewNode.inputs.foreach(function(input) {
					that.preparePlacement(input);
					var numLink = that.getNoOfJoinsForInput(input);
					if (numLinkMax < numLink) {
						numLinkMax = numLink;
						centerInput = input;
					}
				});

				var cx = SCALE * 4;
				var x = SCALE;
				var y, hMax = 0;

				if (centerInput && numLinkMax > 0) {
					// decide on which side of the central table the other tables will be
					that.setAllSides(centerInput);

					var aRightInputs = [];
					var aLeftInputs = [];

					var aRightHeight = [];
					var aRightWidth = [];
					var aLeftHeight = [];
					var aLeftWidth = [];

					// place central table neighbors in the left and right column
					var extCenter = that.placeConnectedInputs(centerInput, 0, aRightInputs, aLeftInputs);
					hMax = extCenter.height;

					// place all right tables in the other right columns
					for (iCol = 1; iCol <= aRightInputs.length; iCol++) {
						aTables = aRightInputs[iCol - 1];

						var extCol = {
							width: 0,
							height: 0
						};

						for (var i = 0; i < aTables.length; i++) {
							var ext = that.placeConnectedInputs(aTables[i], iCol, aRightInputs, aLeftInputs);

							if (extCol.width < ext.width)
								extCol.width = ext.width;

							extCol.height += ext.height;
						}
						aRightWidth.push(extCol.width);
						aRightHeight.push(extCol.height);
						if (hMax < extCol.height)
							hMax = extCol.height;
					}

					// place all left tables in the other left columns
					for (iCol = 1; iCol <= aLeftInputs.length; iCol++) {
						aTables = aLeftInputs[iCol - 1];

						var extCol = {
							width: 0,
							height: 0
						};

						for (var k = 0; k < aTables.length; k++) {
							var ext = that.placeConnectedInputs(aTables[k], -iCol, aRightInputs, aLeftInputs);

							if (extCol.width < ext.width)
								extCol.width = ext.width;
							extCol.height += ext.height;
						}

						aLeftWidth.push(extCol.width);
						aLeftHeight.push(extCol.height);
						if (hMax < extCol.height)
							hMax = extCol.height;
					}
					// place column content
					x = SCALE;

					for (iCol = aLeftInputs.length - 1; iCol >= 0; iCol--) {
						y = (hMax - aLeftHeight[iCol]) / 2 + SCALE;
						y -= y % SCALE;

						aTables = aLeftInputs[iCol];
						for (var l = 0; l < aTables.length; l++) {
							var input = aTables[l];
							that.setPos(input, x, y);
							y += that.heightPlace(input);
						}

						x += aLeftWidth[iCol] + cx;
					}

					y = (hMax - extCenter.height) / 2 + SCALE;
					y -= y % SCALE;
					that.setPos(centerInput, x, y);
					x += extCenter.width + cx;

					for (iCol = 0; iCol < aRightInputs.length; iCol++) {
						y = (hMax - aRightHeight[iCol]) / 2 + SCALE;
						y -= y % SCALE;

						aTables = aRightInputs[iCol];

						for (var m = 0; m < aTables.length; m++) {
							var input = aTables[m];
							that.setPos(input, x, y);
							y += that.heightPlace(input);
						}
						x += aRightWidth[iCol] + cx;
					}
				}

				// place non connected tables
				var dy = 0,
					xM = SCALE * 50;
				if (xM < x)
					xM = x;

				x = SCALE;
				y = hMax + SCALE;

				this.viewNode.inputs.foreach(function(input) {
					if (that.left(input) < 0) {
						that.setPos(input, x, y);

						var dyi = that.heightPlace(input);
						if (dy < dyi) {
							dy = dyi;
						}

						if (x < xM) {
							x = that.right(input) + cx;
						} else {
							x = SCALE;
							y += dy;
							dy = 0;
						}
					}

				});

				this.arrangeDisjointTables();

				this.viewNode.inputs.foreach(function(input) {
					var inputInfo = that.inputInfoMap[input.$getKeyAttributeValue()];
					that.setCoordinatesForInput(input, inputInfo.x, inputInfo.y);
				});

			},

			getNoOfJoinsForInput: function(input) {
				var size = 0;
				this.viewNode.joins.foreach(function(join) {
					if (join.leftInput === input || join.rightInput === input) {
						size++;
					}
				});
				return size;
			},

			arrangeDisjointTables: function() {
				var that = this;

				var disjointInputs = this.getDisjointInputs();
				var heightScale = 25;
				var widthScale = 50;
				var layoutHeight = 0;
				var x = widthScale,
					y = heightScale;
				var startX = 0;

				if (disjointInputs.length > 0) {
					//if there are joined tables
					if (this.isJoinsPresent()) {

						this.viewNode.inputs.foreach(function(input) {
							if (disjointInputs.indexOf(input) !== -1) {
								var info = that.inputInfoMap[input.$getKeyAttributeValue()];
								//starting x-point from which unjoined table(s) will be laid
								if (info.x + info.width > startX) {
									startX = info.x;
									x = widthScale + startX + info.width;
								}
								//ending y-point beyond which unjoined table(s) shouldn't be laid
								if ((info.height + info.y) > layoutHeight) {
									layoutHeight = info.height + info.y;
								}
							}
						});

					}
					//if there are no joined tables
					else {
						//layoutHeight = ((DetailFigureProvider)detailsViewer.getFigureProvider()).getSize(viewNode).height;
					}
					//set the upper left co-ordinates for unjoined tables
					this.positionUnjoinedTables(disjointInputs, heightScale, widthScale, layoutHeight, x, y);
				}
			},

			positionUnjoinedTables: function(disjointInputs, heightScale, widthScale, layoutHeight, x, y) {
				var i, maxWidth = 0;
				for (i = 0; i < disjointInputs.length; i++) {
					var input = disjointInputs[i];
					var figureInfo = this.inputInfoMap[input.$getKeyAttributeValue()];

					if (y >= layoutHeight) {
						//new column
						x += maxWidth + widthScale;
						y = heightScale;
						maxWidth = 0;
					}

					this.setPos(input, x, y);
					//max width of a column
					if (figureInfo.width > maxWidth) {
						maxWidth = figureInfo.width;
					}
					y += figureInfo.height + heightScale;
				}

			},

			isJoinPresent: function() {
				if (this.viewNode.joins.size() > 0) {
					return true;
				}
				return false;
			},

			getDisjointInputs: function() {
				var disjointInputs = this.viewNode.inputs.toArray();
				this.viewNode.joins.foreach(function(join) {
					if (disjointInputs.indexOf(join.leftInput) !== -1) {
						disjointInputs.splice(disjointInputs.indexOf(join.leftInput), 1);
					}
					if (disjointInputs.indexOf(join.rightInput) !== -1) {
						disjointInputs.splice(disjointInputs.indexOf(join.rightInput), 1);
					}
				});
				return disjointInputs;

			},

			setCoordinatesForInput: function(input, x, y) {
				var tableSymbol = this.diagram.symbols.selectObject({
					"inputKey": input.$getKeyAttributeValue()
				});

				if (tableSymbol) {
					tableSymbol.moveTo(x, y)
				}

			},

			right: function(input) {
				return this.inputInfoMap[input.$getKeyAttributeValue()].x + this.inputInfoMap[input.$getKeyAttributeValue()].width;
			},

			left: function(input) {
				return this.inputInfoMap[input.$getKeyAttributeValue()].x;
			},

			setPos: function(input, x, y) {
				this.inputInfoMap[input.$getKeyAttributeValue()].x = x;
				this.inputInfoMap[input.$getKeyAttributeValue()].y = y;
			},

			placeConnectedInputs: function(input, iCol, aRightInputs, aLeftInputs) {
				var that = this;

				var arrayList;

				input.getSource().elements.foreach(function(element) {
					var joinsOfElement = that.getJoinsOfElement(input, element);
					for (var i = 0; i < joinsOfElement.length; i++) {
						var otherInput = that.getOtherConnectedInput(input, joinsOfElement[i]);
						if (!otherInput) {
							return;
						}
						var inputInfo = that.inputInfoMap[otherInput.$getKeyAttributeValue()];
						var side = inputInfo.side;

						if (side === PlaceSide.PLC_RIGHT) {
							inputInfo.side = PlaceSide.PLC_PLACED;
							while (aRightInputs.length < iCol + 1) {
								aRightInputs.push([]);
							}
							arrayList = aRightInputs[iCol];
							arrayList.push(otherInput);
						} else if (side === PlaceSide.PLC_LEFT) {
							inputInfo.side = PlaceSide.PLC_PLACED;
							while (aLeftInputs.length < -iCol + 1) {
								aLeftInputs.push([]);
							}
							arrayList = aLeftInputs[-iCol];
							arrayList.push(otherInput);
						}
					}

				});

				return {
					width: that.inputInfoMap[input.$getKeyAttributeValue()].width,
					height: this.heightPlace(input)
				};

			},

			setAllSides: function(centerInput) {
				var that = this;
				this.inputInfoMap[centerInput.$getKeyAttributeValue()].side = PlaceSide.PLC_PLACED;
				var dy = 0;
				centerInput.getSource().elements.foreach(function(element) {
					var visibleJoins = that.getJoinsOfElement(centerInput, element);
					for (var i = 0; i < visibleJoins.length; i++) {
						dy += that.setSide(that.getOtherConnectedInput(centerInput, visibleJoins[i]),
							dy > 0 ? PlaceSide.PLC_LEFT : PlaceSide.PLC_RIGHT);
					}
				});

			},

			setSide: function(input, side) {
				if (!input) {
					return undefined;
				}
				var that = this;

				if (this.inputInfoMap[input.$getKeyAttributeValue()].side === PlaceSide.PLC_UNKNOWN) {
					this.inputInfoMap[input.$getKeyAttributeValue()].side = side;
					input.getSource().elements.foreach(function(element) {
						var visibleJoins = that.getJoinsOfElement(input, element);
						for (var i = 0; i < visibleJoins.length; i++) {
							that.setSide(that.getOtherConnectedInput(input, visibleJoins[i]), side);
						}

					});
				}
				return side === PlaceSide.PLC_LEFT ? 0 - this.heightPlace(input) : this.heightPlace(input);
			},

			heightPlace: function(input) {
				return this.inputInfoMap[input.$getKeyAttributeValue()].height + (SCALE * 3) / 2;
			},

			getOtherConnectedInput: function(centerInput, join) {
				if (join.leftInput === centerInput) {
					return join.rightInput;
				} else {
					return join.leftInput;
				}
			},

			getJoinsOfElement: function(input, element) {

				var foundJoins = [];
				this.viewNode.joins.foreach(function(join) {
					if (join.leftInput === input || join.rightInput === input) {
						join.leftElements.foreach(function(leftElement) {
							if (leftElement === element && foundJoins.indexOf(join) === -1) {
								foundJoins.push(join);
							}
						});
						join.rightElements.foreach(function(rightElement) {
							if (rightElement === element && foundJoins.indexOf(join) === -1) {
								foundJoins.push(join);
							}
						});
					}
				});
				return foundJoins;
			},

			preparePlacement: function(input) {
				var tableSymbol = this.diagram.symbols.selectObject({
					"inputKey": input.$getKeyAttributeValue()
				});
				var inputInfo = {
					side: PlaceSide.PLC_UNKNOWN,
					x: tableSymbol.x,
					y: tableSymbol.y,
					height: tableSymbol.height,
					width: tableSymbol.width
				};

				this.inputInfoMap[input.$getKeyAttributeValue()] = inputInfo;

			},

			isJoinsPresent: function() {
				if (this.viewNode.joins) {
					return this.viewNode.joins.size() > 0 ? true : false;
				}
				return false;
			}

		};

		return AutoLayout;
	});
