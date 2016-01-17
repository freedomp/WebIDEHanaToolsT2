/*Copyright © 2015 SAP SE or an affiliate company. All rights reserved.*/
define([
    "./model"
    ],
	function(
		viewmodel
	) {
		"use strict";

		var Renderer = {

			renderModel: function(oModel) {
				return oModel.astModel.parsedSource;
				/*var that = this;
				this.textData = "";

				// namespace
				this.textData = "namespace " + oModel.namespace + ";\n";
				var entity = oModel.root;
				that.renderEntity(entity);

				return this.textData;*/

			}
			/*,

			renderEntity: function(entity) {
				var that = this;
				//schema name
				this.textData += "\n@Schema: '" + entity.schemaName + "'\n";

				//entity declaration begins
				this.textData += "\n\tentity " + entity.name + " {\n";

				entity.elements.foreach(function(element) {
					that.renderElement(element);
				});

				//entity declaration ends
				this.textData += "\t};\n";

			},

			renderElement: function(element) {
				var that = this;
				this.textData += "\t\t";

				//process element

				//key
				if (element.key) {
					this.textData += "key ";
				}

				//name
				this.textData += element.name + " : ";

				//primitiveType
				if (element.inlineType.primitiveType) {
					this.textData += element.inlineType.primitiveType;
				}

				//length
				if (element.inlineType.length) {
					this.textData += "(" + element.inlineType.length;

					//scale
					if (element.inlineType.scale) {
						this.textData += "," + element.inlineType.scale;
					}

					this.textData += ")";
				}

				//not null
				if (element.notNull) {
					this.textData += " not null";
				}

				//default value
				if (element.defaultValue) {
					this.textData += " default " + element.defaultValue;
				}

				this.textData += ";\n";

			}
*/
		};

		return Renderer;
	});