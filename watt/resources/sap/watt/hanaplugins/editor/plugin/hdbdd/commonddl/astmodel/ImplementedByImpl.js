// based on commit
//e3f9c257a2b706a485b86bfe8f9254a02bb4cc92 DDL: improve EMF model for table-function
define(
		[ "commonddl/astmodel/AbapMethodImpl", "rndrt/rnd",
				"commonddl/astmodel/SourceRangeImpl" ], // dependencies
		function(AbapMethodImpl, rnd, SourceRangeImpl) {
			var Token = rnd.Token;
			var StringBuffer = rnd.StringBuffer;
			function ImplementedByImpl() {
				SourceRangeImpl.call(this);
			}
			ImplementedByImpl.prototype = Object
					.create(SourceRangeImpl.prototype);
			ImplementedByImpl.prototype.method = null;
			ImplementedByImpl.IMPLEMENTED_TOKEN_EDEFAULT = null;
			ImplementedByImpl.prototype.implementedToken = ImplementedByImpl.IMPLEMENTED_TOKEN_EDEFAULT;
			ImplementedByImpl.BY_TOKEN_EDEFAULT = null;
			ImplementedByImpl.prototype.byToken = ImplementedByImpl.BY_TOKEN_EDEFAULT;
			ImplementedByImpl.METHOD_TOKEN_EDEFAULT = null;
			ImplementedByImpl.prototype.methodToken = ImplementedByImpl.METHOD_TOKEN_EDEFAULT;
			ImplementedByImpl.prototype.constructor = ImplementedByImpl;
			ImplementedByImpl.prototype.getMethod = function() {
				return this.method;
			};
			ImplementedByImpl.prototype.basicSetMethod = function(newMethod,
					msgs) {
				var oldMethod = this.method;
				this.method = newMethod;
				return msgs;
			};
			ImplementedByImpl.prototype.setMethod = function(newMethod) {
				if (newMethod !== this.method) {
					this.basicSetMethod(newMethod);
				}
			};
			ImplementedByImpl.prototype.getImplementedToken = function() {
				return this.implementedToken;
			};
			ImplementedByImpl.prototype.setImplementedToken = function(
					newImplementedToken) {
				var oldImplementedToken = this.implementedToken;
				this.implementedToken = newImplementedToken;
			};
			ImplementedByImpl.prototype.getByToken = function() {
				return this.byToken;
			};
			ImplementedByImpl.prototype.setByToken = function(newByToken) {
				var oldByToken = this.byToken;
				this.byToken = newByToken;
			};
			ImplementedByImpl.prototype.getMethodToken = function() {
				return this.methodToken;
			};
			ImplementedByImpl.prototype.setMethodToken = function(
					newMethodToken) {
				var oldMethodToken = this.methodToken;
				this.methodToken = newMethodToken;
			};
			ImplementedByImpl.prototype.toString = function() {
				var result = new StringBuffer(
						SourceRangeImpl.prototype.toString.call(this));
				result.append(" (implementedToken: ");
				result.append(this.implementedToken);
				result.append(", byToken: ");
				result.append(this.byToken);
				result.append(", methodToken: ");
				result.append(this.methodToken);
				result.append(")");
				return result.toString();
			};
			return ImplementedByImpl;
		});