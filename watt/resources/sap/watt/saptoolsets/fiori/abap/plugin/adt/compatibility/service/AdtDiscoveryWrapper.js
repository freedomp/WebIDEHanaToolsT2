/*
 * RequireJS module with API:TODO
 * <ul>
 * <li>AdtDiscoveryFactory.getDiscovery
 * <li>public methods of AdtDiscovery, AdtDiscoveryCollectionMember
 * </ul>
 */
define( //Define this module as requireJS module and its dependencies to other requireJS modules
    ["sap.watt.saptoolsets.fiori.abap.adt.compatibility/service/AdtDiscovery"], //$NON-NLS-1$

    function (AdtDiscoveryFactory) {

        "use strict"; //$NON-NLS-1$

        function AdtDiscoveryFactoryWrapper(){

            this.getDiscovery = function(discoveryUrl, settings){
                return AdtDiscoveryFactory.getDiscovery(discoveryUrl, settings);
            };
        }

        var wrapper = new AdtDiscoveryFactoryWrapper(); // requireJS module
        return wrapper;
    }
);
