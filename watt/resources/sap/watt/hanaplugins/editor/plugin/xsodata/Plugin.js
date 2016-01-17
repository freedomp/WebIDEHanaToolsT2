define([], function() {   

    return {
       

        initialize: function() {
            // Configure path for rnd lib
            require.config({ paths: { "rndrt" : "sap/watt/hanaplugins/lib/rndrt" }});
        }

       
    };

});