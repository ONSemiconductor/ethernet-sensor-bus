/**
 * Embed Search Index for Offline/File Protocol Support
 * 
 * This script embeds the searchindex.js content directly into the page
 * to bypass CORS restrictions when opening HTML files directly from filesystem.
 * 
 * It intercepts the fetch request for searchindex.js and provides the embedded data instead.
 */

(function() {
    'use strict';
    
    // Store the original fetch function
    const originalFetch = window.fetch;
    
    // Override fetch to intercept searchindex.js requests
    window.fetch = function(url, options) {
        // Check if this is a request for searchindex.js
        if (typeof url === 'string' && url.includes('searchindex.js')) {
            console.log('Intercepting searchindex.js request for offline support');
            
            // Check if we have embedded search data
            if (window.EMBEDDED_SEARCH_INDEX) {
                console.log('Using embedded search index');
                // Return a fake successful response with the embedded data
                return Promise.resolve({
                    ok: true,
                    status: 200,
                    text: function() {
                        return Promise.resolve('Search.setIndex(' + JSON.stringify(window.EMBEDDED_SEARCH_INDEX) + ')');
                    },
                    json: function() {
                        return Promise.resolve(window.EMBEDDED_SEARCH_INDEX);
                    }
                });
            } else {
                console.warn('No embedded search index found, falling back to original fetch');
            }
        }
        
        // For all other requests, use the original fetch
        return originalFetch.apply(this, arguments);
    };
    
    console.log('Embedded search index loader initialized');
})();
