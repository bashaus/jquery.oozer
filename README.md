# jquery.oozer.js

## Project Details

### Licence

Copyright (C) 2012, "Bashkim Isai":http://www.bashkim.com.au

This script is distributed under the MIT licence.

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.


### Contributors

* @bashaus

If you fork this project and create a pull request, don't forget to add your name to the end of list above.

### Description

Oozer is a way to visually rearrange objects and lists on a page. The project was inspired by "jquery.quicksand.js":https://github.com/razorjack/quicksand/ by @razorjack.

### Difference between Quicksand and Oozer

Quicksand is a great project and provided the inspiration behind this script; however there were some technical limitations with quicksand that I wanted to overcome. 

The core functionality of the Quicksand library is that it "replaces one collection of items with another". This differs from Oozer which toggles visibility and sorts information in a list depending on a filter.

While Quicksand can dynamically insert new elements into the list through Ajax calls, Oozer assumes that you have all the elements already in the DOM ready for sorting. Oozer takes this approach so that attached events are not lost when you rearrange the list. This allows you to retain attached JavaScript functions and events on your DOM objects.

## Usage

For a working example, see example.html

## Functionality

### Show all items

Pass an empty filter (a blank string: "") will show all items.

Building on the HTML example provided in example.html:

```html
<label><input type="radio" name="oozer-filter" value="" checked="checked" /> show all</label>
```

Or you can remove the filter in JavaScript using this code example:

```javascript
$('#oozer-list').oozer('filter', '');
```

## Options

### elementSelector

Type: string (selector)
Default: "> *"

Allows you to select particular elements that you want Oozer to handle. By default, Oozer will select all child elements of the container object. Usually you will not need to change this.

### animationSpeed

Type: integer (in milliseconds)
Default: 500 (half a second)

The speed in which the oozing (or shuffling) will occur. This includes the speed for rearranging items in the list.

### animationEasing

Type: string
Default: null

The style of easing that you want to use for the shuffling animation. See notes on easing in the Extensions section below.

### animationScaling

Type: boolean
Default: true

Whether you want to try scaling as well. Will only work when you have a scaling library for jQuery included in your script. See notes on scaling in the Extensions section below.

### resizeSpeed

Type: integer (in milliseconds)
Default: 500 (half a second)

The speed at which the containing element is animated to resize to its new position.

### resizeEasing

Type: string
Default: null

The style of easing that you want to use for the container resize. See notes on easing in the Extensions section below.

### filter

Type: string or function(element):boolean
Default: null

h4. string

When filter is a string, Oozer will check to see if the filter phrase (used later) is contained in whole in the attribute.

E.g. Assume you have the following data:

```html
<article data-oozer-filter="one three"> ... </article>
<article data-oozer-filter="one four"> ... </article>
<article data-oozer-filter="two five"> ... </article>
<article data-oozer-filter="two six"> ... </article>
```

Filter for "one":

```html
<article data-oozer-filter="one three"> ... </article>
<article data-oozer-filter="one four"> ... </article>
```

Filter for "two":

```html
<article data-oozer-filter="two five"> ... </article>
<article data-oozer-filter="two six"> ... </article>
```

Filter for "three":

```html
<article data-oozer-filter="one three"> ... </article>
```

Filter for "four":

```html
<article data-oozer-filter="one four"> ... </article>
```

Filter for "five":

```html
<article data-oozer-filter="two five"> ... </article>
```

Filter for "six":

```html
<article data-oozer-filter="two six"> ... </article>
```

h4. function(element):boolean

Parameters:

# element: the element which you will decide whether to show or not

Returns:

# boolean: true/false depending on whether you want to show the item or not

When you provide a function as a filter, the first parameter of the callback will be an object. You can run custom tests on your object and return true or false to determine whether or not to show the item after the rearrangement.

### sort

Type: function(a,b):integer
Default: function(a, b) { return parseInt($(a).attr('data-'+NS+'-i')) - parseInt($(b).attr('data-'+NS+'-i')); }

Uses the Array.sort() function callback to allow you to order items. Despite the fact Oozer reorders items in the DOM, by default Oozer will try and keep everything in the original order that you arranged it in HTML. This is done through the HTML5 attribute "data-oozer-id" which is set with the object is initialised.

For more information, see "JavaScript Kit tutorial on Sorting":http://www.javascriptkit.com/javatutors/arraysort.shtml.

## Optional extensions

### Easing

You can create smooth animations for Oozer by including an easing library. You can find "a great easing library at GSGD":http://gsgd.co.uk/sandbox/jquery/easing/.

### Scaling

To zoom in/out your items when oozing, you can use a scaling effect as well as an opacity effect. In order to use scaling, you must install a scaling library for jQuery. You can find "a great scaling library at zachstronaut.com":http://www.zachstronaut.com/posts/2009/08/07/jquery-animate-css-rotate-scale.html.

## Tips

* Make sure all of your items have the same width and height. Keeping consistent and defined dimensions makes animations smoother and causes less ambiguity when displaying information.
* You should set a width plus a border or background color for your list container; it makes for nicer animations.