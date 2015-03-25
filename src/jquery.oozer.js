/*!
 * jquery.oozer.js
 * https://github.com/bashaus/jquery.oozer.js
 */

(function($) {
    'use strict';

    var NS = 'oozer',
        // E_TRANSITION_END = 'webkitTransitionEnd transitionend oTransitionEnd otransitionend',
        DEFAULT_OPTIONS = {
            elementSelector : '> *',
            animationSpeed  : 500,
            animationEasing : null,
            resizeSpeed     : 500,
            resizeEasing    : null,
            filter          : null,
            sort            : function(a, b) {
                return parseInt($(a).attr('data-'+NS+'-i')) - parseInt($(b).attr('data-'+NS+'-i'));
            }
        };

    var methods = {};
    methods.init = function(options) {
        return this.each(function() {
            var $this = $(this);

            // Set fallback-options
            options = jQuery.extend({}, DEFAULT_OPTIONS, options);

            // Remember the order
            var $elements = $(options.elementSelector, $this);
            $elements.each(function(i){
                var $element = $(this);
                $element.attr('data-'+NS+'-i', i);
            });

            $this.data(NS, options);
        });
    }
    
    methods.filter = function(filterFor) {
        var $this = $(this);
        var options = $this.data(NS);

        // Store the Start Height
        var heightStart = $this.height();

        // Then allow it to be fluid so set it to auto
        $this.height('auto');

        // Elements
        var transitionElements = [];

        /**
         * Step 1.
         * Stop any previous animations
         */

        // $elements.unbind(E_TRANSITION_END);

        /**
         * Step 2.
         * Store the elements in the transitionElements array
         */
        $(options.elementSelector, $this).each(function() {
            transitionElements.push(new TransitionElement($(this)));
        });

        /**
         * Step 3.
         * Find out where everything is now and store it as data in a variable called "positionStart"
         * If the element is hidden, positionStart is NULL
         * If the element is visible, positionStart is stored as { left : X, top : Y }
         */

        $.each(transitionElements, function(i, transitionElement) {
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
        
        $.each(transitionElements, function(i, transitionElement) {
            var elementShow = null;

            switch (typeof options.filter) {
                case "function":
                    elementShow = options.filter.call($this, transitionElement.$target);
                    break;

                case "string":
                    if (filterFor == "") {
                        elementShow = true;
                    } else if (containsWord(transitionElement.$target.attr(options.filter), filterFor)) {
                        elementShow = true;
                    } else {
                        elementShow = false;
                    }

                    break;
            }

            if (elementShow) {
                transitionElement.$target.show();
            } else {
                transitionElement.$target.hide();
            }
        });

        /**
         * Step 5. 
         * Sort the elements (helps for nth-child)
         */

        if (typeof options.sort === "function") {
            // Sort each of the items 
            transitionElements.sort(function(a, b) {
                return options.sort(a.$target, b.$target);
            });

            // Reattach all items to the DOM (to make the ordered)
            $.each(transitionElements, function(i, transitionElement){
                transitionElement.$target.detach().appendTo($this);
            });

            // Add all hidden items to the end
            $.each(transitionElements, function(i, transitionElement){
                if (transitionElement.$target.is(':hidden')) {
                    transitionElement.$target.detach().appendTo($this);
                }
            });
        }

        /**
         * Step 7.
         * Find out where the new locations are for visible items
         */


        $.each(transitionElements, function(i, transitionElement) {
            var positionCease = null;

            if (transitionElement.$target.is(':visible')) {
                positionCease = transitionElement.$target.position();
            }

            transitionElements[i].cease = positionCease;
        });
        
        // We also want to store the cease height of the container
        var heightCease = $this.height();

        // And reset it to its original size
        $this.height(heightStart);
        
        /**
         * Step 8.
         * Reset the visibility to whatever it was before to get ready for animation
         */

        $.each(transitionElements, function(i, transitionElement) {
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
        
        // Now do the animations
        var $fxContainer = $({});

$fxContainer.queue(function(done){
        $.each(transitionElements, function(i, transitionElement) {
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
                done
            );
        } else {
            done();
        }
});

$fxContainer.queue(function(done){
        var deferredObjects = [];

        $.each(transitionElements, function(i, transitionElement) {
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
                    function() {
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
                    function() {
                        transitionElement.$target.detach().appendTo($this);
                        
                        deferred.resolve();
                    }
                );

                return;
            }
        });

        $.when
            .apply($, deferredObjects)
            .done(function() { 
                done();
            });
});
        
        /**
         * Step 10.
         * Animate the container the correct height
         */
        
$fxContainer.queue(function(done){
        if (heightStart > heightCease) {
            $this.animate(
                {height: heightCease + "px"}, 
                options.resizeSpeed, 
                options.resizeEasing,
                done
            );
        }
        
        done();
});

        /**
         * Step 11.
         * Settle the elements into their place after all animations are complete
         * and clean up any outstanding information
         */
        
$fxContainer.queue(function(done){
        $.each(transitionElements, function(i, transitionElement) {
            transitionElement.$target.css({
                position: '',
                top: '',
                left: ''
            });
        });

        $this.css({height: ''});

        done();
});
    }

    /* Structs */

    function TransitionElement($target) {
        this.$target = $target;
        this.start = null;
        this.cease = null;
    }
    
    /* Helpers */

    function containsWord(haystack, needle) {
        return (" " + haystack + " ").indexOf(" " + needle + " ") !== -1;
    }

    $.fn[NS] = function(method) {
        if (methods[method]) {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === 'object' || !method) {
            return methods.init.apply(this, arguments);
        } else {
            $.error('jQuery.' + NS + ': method ' +  method + ' does not exist');
        }
    };
})(jQuery);
