// based on commit
//c6da3bc7881acebdde1fe61777ab3b1cdf2a77b2 AST nodes for association definitions in extend view
define(
    [
	"commonddl/astmodel/AssociationDeclarationImpl",
	"commonddl/astmodel/EObjectImpl",
    "commonddl/astmodel/EObjectContainmentEList"
	], // dependencies
    function (AssociationDeclarationImpl, EObjectImpl, EObjectContainmentEList) {
		function AssociationContainerImpl() {
			EObjectImpl.call(this);
		}
		AssociationContainerImpl.prototype = Object.create(EObjectImpl.prototype);
		AssociationContainerImpl.prototype.associations = null;
		AssociationContainerImpl.prototype.constructor = AssociationContainerImpl;
		AssociationContainerImpl.prototype.getAssociations = function() {
			/*eslint-disable no-eq-null*/
			if (this.associations == null) {
				this.associations = new EObjectContainmentEList(this);
			}
			return this.associations;
		};
    return AssociationContainerImpl;
    }
);