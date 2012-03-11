/**
 * jQuery.Oozer
 * Copyright (c) Bashkim Isai, 2011
 */

(function($) {
    var NS = 'oozer';

    var methods = {};
    methods.init = function(options) {
        return this.each(function() {
            var $this = $(this);
            
            // Set fallback-options
            options = jQuery.extend({
                elementSelector : '> *',
                animationSpeed  : 500,
                animationEasing : null,
                animationScaling: true,
                resizeSpeed     : 500,
                resizeEasing    : null,
                filter          : null,
                sort            : function(a, b) { return parseInt($(a).attr('data-'+NS+'-i')) - parseInt($(b).attr('data-'+NS+'-i')); }
            }, options);
            
            // If the browser is incompatible, don't use browser scaling
            if ($.browser.msie || $.browser.mozilla || (typeof($.fn.scale) == 'undefined')) {
                options.animationScaling = false;
            }

            // Remember the order
            var $elements = $(options.elementSelector, $this);
            $elements.each(function(i){
                var $element = $(this);
                $element.attr('data-'+NS+'-i', i);
            });

            $this.data(NS, options);
        } );
    }
    
    methods.filter = function(filterFor) {
        var $this = $(this);
        var options = $this.data(NS);
        
        // Store the Start Height
        var heightStart = $this.height();

        // Then allow it to be fluid so set it to auto
        $this.height('auto');
        
        // Get the Elements
        var $elements = $(options.elementSelector, $this);
        
        /**
         * Step 0.
         * Stop any previous animations
         */
        
        $elements.each(function() {
            var $element = $(this);
            $element.stop(true, true);
        });

        /**
         * Step 1.
         * Find out where everything is now and store it as data in a variable called "positionStart"
         * If the element is hidden, positionStart is NULL
         * If the element is visible, positionStart is stored as { left : X, top : Y }
         */
        
        $elements.each(function() {
            var $element = $(this);
            var positionStart = null;

            if ($element.is(':visible')) {
                positionStart = $element.position();
            }

            $element.data('positionLayout.'+NS, $element.css('position'));
            $element.data('positionStart.'+NS, positionStart);
        } );

        /**
         * Step 2. 
         * Filter the items by hiding the items which will not be shown
         * (They will get shown again before we start animating)
         */
        
        $elements.each(function() {
            var $element = $(this);
            var elementShow = null;

            switch (typeof options.filter) {
                case "function":
                    elementShow = options.filter.call($this, $element);
                    break;

                case "string":
                    var $this = $(this);
                    if (filterFor == "") {
                        elementShow = true;
                    }
                    else if ($element.attr(options.filter).containsWord(filterFor)) {
                        elementShow = true;
                    }
                    else {
                        elementShow = false;
                    }

                    break;
            }

            if (elementShow) {
                $element.show();
                
                if (options.animationScaling) {
                    $element.scale(1);
                }
            }
            else {
                $element.hide();

                if (options.animationScaling) {
                    $element.scale(0);
                }
            }
        } );

        // Sort the elements (helps for nth-child)
        switch (typeof options.sort) {
            case "function":
                // Sort each of the items then reattach them to the DOM
                $elements.sort(options.sort).each(function(){
                    $(this).detach().appendTo($this);
                });

                // Add all hidden items to the end
                $elements.each(function(){
                    var $element = $(this);

                    if ($element.is(':hidden')) {
                        $element.detach().appendTo($this);
                    }
                });
                break;
        }

        /**
         * Step 3.
         * Find out where the new locations are for visible items
         */
        
        $elements.each(function() {
            var $element = $(this);
            var positionCease = null;
            
            if ($element.is(':visible')) {
                var positionCease = $element.position();
            }
            
            $element.data('positionCease.'+NS, positionCease);
        } );
        
        // We also want to store the cease height of the container
        var heightCease = $this.height();

        // And reset it to its original size
        $this.height(heightStart);
        
        /**
         * Step 4.
         * Reset the visibility to whatever it was before to get ready for animation
         */

        $elements.each(function() {
            var $element = $(this);
            var positionStart = $element.data('positionStart.'+NS);
            
            $element.appendTo($this);

            if (positionStart) {
                if (options.animationScaling) {
                    $element.scale(1);
                }

                $element.css({opacity: 1}).show();
            }
            else {
                if (options.animationScaling) {
                    $element.scale(0);
                }

                $element.css({opacity: 0}).hide();
            }
        } );

        /**
         * Step 5. 
         * Start the animations - this can occur in one of four ways
         * CASE 1: HIDDEN to POSITION   - Fade in at the location position cease
         * CASE 2: POSITION to HIDDEN   - Fade out at the location position start
         * CASE 3: POSITION to POSITION - Shuffle the item to a new location
         * CASE 4: HIDDEN to HIDDEN     - Do nothing
         */
        
        // Now do the animations
        var $fxContainer = $({});
$fxContainer.queue(function(done){
        $elements.each(function(i) {
            var $element = $(this);
            var positionStart = $element.data('positionStart.'+NS);

            if (positionStart) {
                $element.css({position: 'absolute', top: positionStart.top, left: positionStart.left});
            }
        });

        if (heightCease > heightStart) {
            $this.animate(
                {height : heightCease + "px"}, 
                options.resizeSpeed, 
                options.resizeEasing, 
                done
            );
        }
        else {
            done();
        }
});

$fxContainer.queue(function(done){
        var contentCount = $elements.size();

        $elements.each(function(i) {
            var $element = $(this);
            var positionStart = $element.data('positionStart.'+NS);
            var positionCease = $element.data('positionCease.'+NS);

            // Animations require everything to be position absolute
            $element.css({position: 'absolute'});
            
            // Check for CASE 1: HIDDEN to POSITION
            if (!positionStart && positionCease) {
                $element.css({top: positionCease.top, left: positionCease.left}).show();
                
                $element.animate (
                    (options.animationScaling) ? {scale : 1, opacity : 1} : {opacity : 1},
                    options.animationSpeed, 
                    options.animationEasing,
                    animate_item_callback
                );
                
                return;
            }
            
            // Check for CASE 2: POSITION to HIDDEN
            if (positionStart && !positionCease) {
                $element.css({top: positionStart.top, left: positionStart.left});
                
                $element.animate(
                    (options.animationScaling) ? {scale : 0, opacity: 0} : {opacity : 0},
                    options.animationSpeed, 
                    options.animationEasing,
                    function() {
                        $element.detach().appendTo($this);
                        
                        $(this).hide();
                        animate_item_callback();
                    }
                );
                
                return;
            }
            
            // Check for CASE 3: POSITION to POSITION
            if (positionStart && positionCease) {
                $element.css({top: positionStart.top, left: positionStart.left});
                $element.animate(
                    {top : positionCease.top, left : positionCease.left}, 
                    options.animationSpeed, 
                    options.animationEasing, 
                    animate_item_callback
                );
                
                return;
            }
            
            // Check for CASE 4: HIDDEN to HIDDEN
            if (!positionStart && !positionCease) {
                $element.css({position: 'relative'}).animate(
                    {top: 0, left: 0}, 
                    options.animationSpeed, 
                    options.animationEasing, 
                    function() {
                        $element.detach().appendTo($this);
                        
                        animate_item_callback();
                    }
                );

                return;
            }
        });

        function animate_item_callback () {
            --contentCount;

            if (contentCount == 0) {
                $fxContainer.dequeue();
            }
        }
});
        
        /**
         * Step 6.
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
         * Step 7.
         * Settle the elements into their place after all animations are complete
         * and clean up any outstanding information
         */
        
$fxContainer.queue(function(done){
        $elements.each(function(){
            var $element = $(this);

            $element.css({position: $element.data('positionLayout.'+NS), top: '0', left: '0'});
            $element.removeData('positionLayout.'+NS);
            $element.removeData('positionStart.'+NS);
            $element.removeData('positionCease.'+NS);
        });

        $this.css({height: 'auto'});

        done();
});
    }
    
    $.fn[NS] = function(method) {
        if (methods[method]) {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === 'object' || !method) {
            return methods.init.apply(this, arguments);
        } else {
            $.error ('jQuery.' + NS + ': method ' +  method + ' does not exist');
        }
    };
})(jQuery);

String.prototype.containsWord = function(needle) {
    return (" " + this + " ").indexOf(" " + needle + " ") !== -1;
}