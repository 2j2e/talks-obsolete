// THIS CODE AND INFORMATION IS PROVIDED "AS IS" WITHOUT WARRANTY OF
// ANY KIND, EITHER EXPRESSED OR IMPLIED, INCLUDING BUT NOT LIMITED TO
// THE IMPLIED WARRANTIES OF MERCHANTABILITY AND/OR FITNESS FOR A
// PARTICULAR PURPOSE.
//
// Copyright (c) Microsoft Corporation. All rights reserved

(function () {
    "use strict";

    // Private Members
    // ---------------

    // Determine whether or not the specified target is a function.
    function isFunction(target) {
        return (typeof target === "function");
    }

    // Return a promise that wraps a value, where the target is either an object
    // or a function. If the target is a function, execute the function and 
    // return that value through the promise. If the target is not a function,
    // return the value directl through the promise.
    function resultAsPromise(target) {
        var value;
        if (isFunction(target)) {
            value = target();
        } else {
            value = target;
        }
        return WinJS.Promise.as(value);
    }

    // URL Cache
    // ---------

    // The `Hilo.UrlCache` object exists to maintain control over the memory used
    // by `URL.createObjectUrl`. This function, by design, uses a chunk of memory
    // for each URL it creates and does not necessarily clean that memory up
    // automatically.
    //
    // For more information on the memory leaks that can be caused by the use of
    // URL.createObjectUrl, see the MSDN article on [Accessing The File System Efficiently][1].
    //
    // [1]: http://msdn.microsoft.com/en-us/library/windows/apps/hh781216.aspx
    var urlCache = {

        // Hold a list of keys with an array of URL's for any given key.
        urlList: {},

        // Cache, build, and retreve a a `urlconfig` object for the given
        // key and attribute name combination. Uses the `target` attribute to
        // build the object URL. 
        //
        // If a URL for the request key and attrName exists, it is returned.
        // If one does not exist, it is created and stored in cache.
        getUrl: function (key, attrName, target) {
            var self = this,
                promise;

            // Check to see if we have an `urlconfig` for the specified
            // key and attribute name
            if (this.urlList[key] && this.urlList[key][attrName]) {

                // We have it already. Return it as a promise.
                promise = WinJS.Promise.as(this.urlList[key][attrName]);

            } else {

                // We don't have it yet, so get the target object.
                promise = resultAsPromise(target).then(function (obj) {

                    // Build the URL configuration and store it.
                    var urlConfig = self._buildUrlConfig(attrName, obj);
                    self._storeUrlConfig(key, attrName, urlConfig);

                    return urlConfig;
                });
            }

            // Return the resulting promise, whether it's cached or
            // building a new `urlconfig`.
            return promise;
        },

        // Clear all URL configurations for the given key, destroying the
        // object URL for each one.
        clear: function (key) {
            var urlConfigs, urlConfig, urlName;
            urlConfigs = this.urlList[key];
            for (urlName in urlConfigs) {
                if (urlConfigs.hasOwnProperty(urlName)) {
                    urlConfig = urlConfigs[urlName];
                    URL.revokeObjectURL(urlConfig.url);
                }
            }
        },

        // Clear all URL configurations, destroying the object URL
        // for each one.
        clearAll: function () {
            var urlConfigs, urlName, urlConfig, attr;

            // Clear the URL's for the individual key.
            for (attr in this.urlList) {
                this.clear(attr);
            }

            // Reset the URL list back to a new empty object
            // to ensure every last bit has been released.
            this.urlList = {};
        },

        // Internal method. Builds a URL configuration object
        // based on the attribute name.
        _buildUrlConfig: function (attrName, obj) {
            var url = (obj) ? URL.createObjectURL(obj) : "";

            var config = {
                attrName: attrName,
                url: url,
                backgroundUrl: "url(" + url + ")",
            };

            return config;
        },

        // Internal method. Stores the provided configuration
        // for the specified key and attribute name.
        _storeUrlConfig: function (key, attrName, config) {
            // If we don't have this key, add it.
            if (!this.urlList[key]) {
                this.urlList[key] = {};
            }

            // Store the url config for the key and attribute name.
            this.urlList[key][attrName] = config;
        }
    };

    // Public API
    // ----------

    WinJS.Namespace.define("Hilo", {
        UrlCache: urlCache
    });

})();
