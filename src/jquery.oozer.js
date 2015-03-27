/*!
 * jquery.oozer
 * https://github.com/bashaus/jquery.oozer
 */

(function ($) {
    'use strict';

    /**
     * Default sorting algorithm
     */

    function DEFAULT_sort($a, $b) {
        return parseInt($a.attr('data-'+NS+'-i')) - parseInt($b.attr('data-'+NS+'-i'));
    };

    /**
     * Detects whether to use CSS animations or to use jQuery
     * @return true: CSS; false: jQuery
     */

    function DETECT_transitions() {
        var style = (document.body || document.documentElement).style;

        // Tests for vendor specific prop
        var prefixes = [
            'transition',           'MozTransition',
            'webkitTransition',     'WebkitTransition',
            'KhtmlTransition',      'OTransition',
            'msTransition'
        ];

        for (var i in prefixes) {
            if (typeof style[prefixes[i]] == 'string') { return true; }
        }

        return false;
    };

    /**
     * Check if the browser supports the history API
     */
    function DETECT_history() {
        return window.history && typeof window.history.pushState !== 'undefined';
    };

    /**
     * Set defaults
     */

    var NS = 'oozer',
        // E_TRANSITION_END = 'webkitTransitionEnd transitionend oTransitionEnd otransitionend',
        DEFAULT_OPTIONS = {
            elementSelector : '> *',

            // Functions
            filter          : 'data-oozer-filter',
            sort            : DEFAULT_sort,

            // Animations
            cssAnimEnabled  : DETECT_transitions(),

            animationSpeed  : 500,
            animationEasing : null,
            resizeSpeed     : 500,
            resizeEasing    : null,

            // History
            historyEnabled  : DETECT_history(),
            historyKey      : 'filter'
        },
        DEFAULT_FILTER_OPTIONS = {
            isAnimated      : true,
            historyEnabled  : true
        },
        methods = {},
        handlers = {};

    // Global variables
    $[NS] = {
        events: {
            BEFORE_FILTER: 'beforeFilter.'+NS,
            AFTER_FILTER: 'afterFilter.'+NS
        }
    };

    /**
     * Initialize a list for oozing
     */
    methods.init = function (options) {
        return this.each(function () {
            var $this = $(this);

            // Set fallback-options
            options = jQuery.extend({}, DEFAULT_OPTIONS, options);

            // Remember the order
            $this.find(options.elementSelector).each(function (i) {
                $(this).attr('data-'+NS+'-i', i);
            });

            $this.data(NS, options);

            // If the history API has been enabled, attach events and filter
            if (options.historyEnabled) {
                $(window).bind('popstate', $.proxy(handlers.windowPopState, $this));

                // Get filter from the query string on page load
                var historyFilter = getQueryString(null, options.historyKey);
                $this[NS]('filter', historyFilter, { isAnimated: false, historyEnabled: false });
            }
        });
    };

    /**
     * Run the filter on a list
     */
    methods.filter = function (filterFor, filterOptions) {
        var $this = $(this),
            options = $this.data(NS),
            filterOptions = jQuery.extend({}, DEFAULT_FILTER_OPTIONS, filterOptions),
            transitionElements = [],        // Elements
            heightStart = $this.height(),   // Store the Start Height
            heightCease = 0;

        // Fire the before filter event
        var beforeEvent = jQuery.Event($[NS].events.BEFORE_FILTER);
        beforeEvent[NS] = { filterFor : filterFor };
        $this.trigger(beforeEvent);

        var afterEvent = jQuery.Event($[NS].events.AFTER_FILTER);
        afterEvent[NS] = { filterFor : filterFor };

        // If we are using the History API
        // And this filter request should utilise the History API
        // Add to push state
        if (options.historyEnabled && filterOptions.historyEnabled === true) {
            var newQueryString = filterFor !== '' ? options.historyKey + '=' + filterFor : '';
            window.history.pushState(filterFor, null, '?' + newQueryString);
        }

        // Allow the container to be fluid so set it to auto
        $this.height('auto');

        /**
         * Step 1.
         * Stop any previous animations
         */

        // $elements.unbind(E_TRANSITION_END);
        if (typeof options.$queue !== "undefined") {
            options.$queue.stop(true, true);
        }

        /**
         * Step 2.
         * Store the elements in the transitionElements array
         */
        $this.find(options.elementSelector).each(function () {
            transitionElements.push(new TransitionElement($(this)));
        });

        /**
         * Step 3.
         * Find out where everything is now and store it as data in a variable called "positionStart"
         * If the element is hidden, positionStart is NULL
         * If the element is visible, positionStart is stored as { left : X, top : Y }
         */

        $.each(transitionElements, function (i, transitionElement) {
            var positionStart = null;

            if (transitionElement.$target.is(':visible')) {
                positionStart = transitionElement.$target.position();
            }

            transitionElements[i].start = positionStart;
        });

        /**
         * Step 4. 
         * Apply the filter by hiding the items which will not be shown
         * (They will get shown again before we start animating)
         */
        
        $.each(transitionElements, function (i, transitionElement) {
            var elementShow = false;

            switch (typeof options.filter) {
                case "function":
                    elementShow = options.filter.call($this, transitionElement.$target);
                    break;

                case "string":
                    if (filterFor == "") {
                        elementShow = true;
                    } else if (containsWord(transitionElement.$target.attr(options.filter), filterFor)) {
                        elementShow = true;
                    }

                    break;
            }

            transitionElement.$target[elementShow ? 'show' : 'hide']();
        });

        /**
         * Step 5. 
         * Sort the elements (helps for nth-child)
         */

        if (typeof options.sort === "function") {
            // Sort each of the items 
            transitionElements.sort(function (a, b) {
                return options.sort(a.$target, b.$target);
            });

            // Reattach all items to the DOM (to make the ordered)
            $.each(transitionElements, function (i, transitionElement){
                transitionElement.$target.detach().appendTo($this);
            });

            // Add all hidden items to the end
            $.each(transitionElements, function (i, transitionElement){
                if (transitionElement.$target.is(':hidden')) {
                    transitionElement.$target.detach().appendTo($this);
                }
            });
        }

        /**
         * Step 7.
         * Find out where the new locations are for visible items
         */

        $.each(transitionElements, function (i, transitionElement) {
            var positionCease = null;

            if (transitionElement.$target.is(':visible')) {
                positionCease = transitionElement.$target.position();
            }

            transitionElements[i].cease = positionCease;
        });

        /**
         * If there is no animation, then just return at this point.
         * Everything is in the right place and nothing more needs to happen.
         */

        if (filterOptions.isAnimated === false) {
            // Fire the "after filter" event
            $this.trigger(afterEvent);
            return;
        }        
        
        /**
         * Store the height of the new container and reset its position to the
         * original height
         */
        heightCease = $this.height();
        $this.height(heightStart);
        
        /**
         * Step 8.
         * Reset the visibility to whatever it was before to get ready for animation
         */

        $.each(transitionElements, function (i, transitionElement) {
            if (transitionElement.start) {
                transitionElement.$target.css({opacity: 1}).show();
            } else {
                transitionElement.$target.css({opacity: 0}).hide();
            }
        });

        /**
         * Step 9. 
         * Start the animations - this can occur in one of four ways
         * CASE 1: HIDDEN to POSITION   - Fade in at the location position cease
         * CASE 2: POSITION to HIDDEN   - Fade out at the location position start
         * CASE 3: POSITION to POSITION - Shuffle the item to a new location
         * CASE 4: HIDDEN to HIDDEN     - Do nothing
         */

        options.$queue = $({});

options.$queue.queue(function (resolve){
        $.each(transitionElements, function (i, transitionElement) {
            if (transitionElement.start) {
                transitionElement.$target.css({
                    position: 'absolute',
                    top: transitionElement.start.top,
                    left: transitionElement.start.left
                });
            }
        });

        if (heightCease > heightStart) {
            $this.animate(
                {height : heightCease + "px"}, 
                options.resizeSpeed, 
                options.resizeEasing, 
                resolve
            );
        } else {
            resolve();
        }
});

options.$queue.queue(function (resolve){
        var deferredObjects = [];

        $.each(transitionElements, function (i, transitionElement) {
            var deferred = new $.Deferred();
            deferredObjects.push(deferred.promise());

            // Animations require everything to be position absolute
            transitionElement.$target.css({position: 'absolute'});
            
            // Check for CASE 1: HIDDEN to POSITION
            if (!transitionElement.start && transitionElement.cease) {
                transitionElement.$target.css({
                    top: transitionElement.cease.top,
                    left: transitionElement.cease.left
                }).show();
                
                transitionElement.$target.animate(
                    {opacity : 1},
                    options.animationSpeed, 
                    options.animationEasing,
                    deferred.resolve
                );
                
                return;
            }

            // Check for CASE 2: POSITION to HIDDEN
            if (transitionElement.start && !transitionElement.cease) {
                transitionElement.$target.css({
                    top: transitionElement.start.top,
                    left: transitionElement.start.left
                });
                
                transitionElement.$target.animate(
                    {opacity : 0},
                    options.animationSpeed, 
                    options.animationEasing,
                    function () {
                        transitionElement.$target.detach().appendTo($this);
                        
                        $(this).hide();
                        deferred.resolve();
                    }
                );
                
                return;
            }
            
            // Check for CASE 3: POSITION to POSITION
            if (transitionElement.start && transitionElement.cease) {
                transitionElement.$target.css({
                    top: transitionElement.start.top,
                    left: transitionElement.start.left
                });

                transitionElement.$target.animate(
                    {
                        top : transitionElement.cease.top,
                        left : transitionElement.cease.left
                    },
                    options.animationSpeed, 
                    options.animationEasing, 
                    deferred.resolve
                );

                return;
            }
            
            // Check for CASE 4: HIDDEN to HIDDEN
            if (!transitionElement.start && !transitionElement.cease) {
                transitionElement.$target.css({position: 'relative'}).animate(
                    {top: 0, left: 0}, 
                    options.animationSpeed, 
                    options.animationEasing, 
                    function () {
                        transitionElement.$target.detach().appendTo($this);
                        
                        deferred.resolve();
                    }
                );

                return;
            }
        });

        return $.when.apply($, deferredObjects)
            .done(resolve);
});
        
        /**
         * Step 10.
         * Animate the container the correct height
         */

options.$queue.queue(function (resolve) {
        if (heightStart > heightCease) {
            $this.animate(
                {height: heightCease + "px"}, 
                options.resizeSpeed, 
                options.resizeEasing,
                resolve
            );
        } else {
            resolve();
        }
});

        /**
         * Step 11.
         * Settle the elements into their place after all animations are complete
         * and clean up any outstanding information
         */

options.$queue.promise().always(function () {
        $.each(transitionElements, function (i, transitionElement) {
            transitionElement.$target.stop(true, true).css({
                position: '',
                top: '',
                left: '',
                opacity: ''
            });
        });

        $this.stop(true, true).css({height: ''});

        // Fire the "after filter" event
        $this.trigger(afterEvent);
});

        $this.data(NS, options);
    }

    /* Handlers */

    /**
     * Handle back/forward buttons (history API)
     */
    handlers.windowPopState = function (e) {
        var $this = $(this); // Container
        var filterVal = e.originalEvent.state || '';

        $this[NS]('filter', filterVal, { historyEnabled : false });
    };

    /* Structs */

    function TransitionElement($target) {
        this.$target = $target;
        this.start = null;
        this.cease = null;
    }

    /* Helpers */

    /**
     * Checks to see if a 'word' is contained in a string
     */

    function containsWord(haystack, needle) {
        return (" " + haystack + " ").indexOf(" " + needle + " ") !== -1;
    }

    /**
     * Gets a parameter from the query string
     */

    function getQueryString(search, parameter)
    {
        var queryString = {};
        search = search || window.location.search;

        search.replace(
            new RegExp("([^?=&]+)(=([^&]*))?", "g"),
            function($0, $1, $2, $3) { queryString[$1] = $3; }
        );

        if (typeof parameter !== 'undefined') {
            return queryString[parameter] || '';
        }

        return queryString;
    }

    $.fn[NS] = function (method) {
        if (methods[method]) {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === 'object' || !method) {
            return methods.init.apply(this, arguments);
        } else {
            $.error('jQuery.' + NS + ': method ' +  method + ' does not exist');
        }
    };
})(jQuery);
