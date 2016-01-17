// based on commit
//55ea59383636e4da55cb7bb8fbed6bb48b049245 AST nodes for table functions
define(
		[ "rndrt/rnd" , "commonddl/astmodel/SourceRangeImpl"], // dependencies
		function(rnd, SourceRangeImpl) {
			var Token = rnd.Token;
			var StringBuffer = rnd.StringBuffer;
			function AbapMethodImpl() {
				SourceRangeImpl.call(this);
			}
			AbapMethodImpl.prototype = Object.create(SourceRangeImpl.prototype);
			AbapMethodImpl.CLASS_NAME_EDEFAULT = null;
			AbapMethodImpl.prototype.className = AbapMethodImpl.CLASS_NAME_EDEFAULT;
			AbapMethodImpl.METHOD_NAME_EDEFAULT = null;
			AbapMethodImpl.prototype.methodName = AbapMethodImpl.METHOD_NAME_EDEFAULT;
			AbapMethodImpl.prototype.constructor = AbapMethodImpl;
			AbapMethodImpl.prototype.getClassName = function() {
				return this.className;
			};
			AbapMethodImpl.prototype.setClassName = function(newClassName) {
				var oldClassName = this.className;
				this.className = newClassName;
			};
			AbapMethodImpl.prototype.getMethodName = function() {
				return this.methodName;
			};
			AbapMethodImpl.prototype.setMethodName = function(newMethodName) {
				var oldMethodName = this.methodName;
				this.methodName = newMethodName;
			};
			AbapMethodImpl.prototype.toString = function() {
				var result = new StringBuffer(SourceRangeImpl.prototype.toString.call(this));
				result.append(" (className: ");
				result.append(this.className);
				result.append(", methodName: ");
				result.append(this.methodName);
				result.append(")");
				return result.toString();
			};
			return AbapMethodImpl;
		});