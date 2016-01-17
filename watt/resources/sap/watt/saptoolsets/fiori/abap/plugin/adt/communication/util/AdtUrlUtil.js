/*
 * RequireJS module with API:
 * <ul>
 * <li>AdtUrlUtil
 * <li>public methods of AdtCheckUtil
 * </ul>
 */
define( //Define this module as requireJS module and its dependencies to other requireJS modules
    [ ],
    function () {

        "use strict";

        var AdtUrlUtil = new function () { // singleton

            /**
             * The method checks if the given <code>uri1</code> starts
             * with the given <code>uri2</code>.
             * If yes, then <code>uri1</code> is returned. Else
             * <code>uri1</code> and <code>uri2</code> are combined
             * to a new URI, which contains <code>uri2</code> as prefix,
             * and this new URI is returned.
             * @param uri1
             *              The URI, that is checked.
             * @param uri2
             *              The URI, which is ensured as URI prefix.
             * @returns {string}
             *              An URI consisting of <code>uri1</code> and
             *              <code>uri2</code> and fulfilling the condition,
             *              that <code>uri2</code> is the URI prefix.
             */
            this.ensureLeadingUriPrefix = function(uri1, uri2) {

                if (typeof uri1 !== "string" || uri1.length === 0 || uri2.indexOf(uri1) === 0) {
                    return uri2;
                }
                if (typeof uri2 !== "string" || uri2.length === 0){
                    return uri1;
                }

                if (uri2.charAt(0) !== "/" && uri2.charAt(0) !== "\\") { //$NON-NLS-1$ //$NON-NLS-2$
                    return uri1 + "/" + uri2; //$NON-NLS-1$
                }
                return uri1 + uri2;
            };

            /**
             * The method extracts the host-part of the given <code>url</code>.
             * <br>
             * Remark:<br>
             * Productive use cases typically use an initially loaded browser
             * page and relative URLs. In this case the browser finally
             * automatically adds the host part of the URL of the initially
             * loaded browser page.<br>
             * But test cases for the AdtRestResource set up calls with
             * full URLs as parameter. This has to be considered in the
             * URL handling of the AdtRestResource.
             * Example:<br>
			 *     Url:      https://myServer:01234/myUrlPath
			 *     Host url: https://myServer:01234
			 * For other URL format examples see the URL standard (RFC 1738).
             * @param url
             * @returns {string}
             */
            this.extractHostUrl = function(url) {

                var hostUrl = ""; //$NON-NLS-1$
                if (typeof url === "string" && (url.indexOf("https:") === 0 || url.indexOf("http:") === 0)) { //$NON-NLS-1$
                    // Consider that test cases call the AdtRestResource without having an initial browser page loaded.
                    // Instead they provide the full URL as parameter.
                    var segments = url.split("/"); //$NON-NLS-1$
                    hostUrl = segments[0] + "//" + segments[2]; //$NON-NLS-1$
                }
                return hostUrl;
            };
        };

        return AdtUrlUtil; // requireJS module
    });