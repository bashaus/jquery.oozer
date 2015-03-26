# jquery.oozer

Oozer is a way to visually rearrange list items on a page.

The project was inspired by 
[jquery.quicksand.js](https://github.com/razorjack/quicksand/) by 
[@razorjack](https://github.com/razorjack/). Quicksand is a great project and 
provided the inspiration behind this script; however there were some technical 
limitations with quicksand that I wanted to overcome. The core functionality of 
the Quicksand library is that it "replaces one collection of items with 
another". This differs from Oozer which toggles visibility and sorts 
information in a list depending on a filter.

While Quicksand can dynamically insert new elements into the list through Ajax 
calls, Oozer assumes that you have all the elements already in the DOM ready 
for sorting. Oozer takes this approach so that attached events are not lost 
when you rearrange the list. This allows you to retain attached JavaScript 
functions and events on your DOM objects.

## Usage

For a working example, see `example/index.html`

## Options

```javascript
$('#oozer-list').oozer({ /* ... */ });
```

### elementSelector

* Type: `string (selector)`
* Default: > *

Allows you to select particular elements that you want Oozer to handle. By 
default, Oozer will select all child elements of the container object. Usually 
you will not need to change this.

### filter

* Type: `string` or `function(element):boolean`
* Default: `null`

#### string

When filter is a string, Oozer will check to see if the filter phrase (used 
later) is contained in whole in the attribute.

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

#### function(element):boolean

* Parameters:
    * `element`: the element which you will decide whether to show or not
* Return: `boolean`

When you provide a function as a filter, the first parameter of the callback 
will be an object. You can run custom tests on your object and return true or 
false to determine whether or not to show the item after the rearrangement.

### sort

* Type: `function(a, b):integer`
* Default: function(a, b) { /* original HTML order */ }

Uses the Array.sort() function callback to allow you to order items. Despite 
the fact Oozer reorders items in the DOM, by default Oozer will try and keep 
everything in the original order that you arranged it in HTML. This is done 
through the HTML5 attribute "data-oozer-id" which is set with the object is 
initialised.

For more information, read this
[JavaScript Kit tutorial on Sorting](http://www.javascriptkit.com/javatutors/arraysort.shtml).

### cssAnimEnabled

* Type: `boolean`
* Default: Browser detected

This is currently not in use but should be in future versions.

### animationSpeed

* Type: `integer` in milliseconds
* Default: 500 (half a second)

The speed in which the oozing (or shuffling) will occur. This includes the 
speed for rearranging items in the list.

### animationEasing

* Type: `string`
* Default: `null`

The style of easing that you want to use for the shuffling animation. See notes 
on easing in the Extensions section below.

### animationScaling

* Type: `boolean`
* Default: `true`

Whether you want to try scaling as well. Will only work when you have a scaling 
library for jQuery included in your script. See notes on scaling in the 
Extensions section below.

### resizeSpeed

* Type: `integer` in milliseconds
* Default: 500 (half a second)

The speed at which the containing element is animated to resize to its new 
position.

### resizeEasing

* Type: `string`
* Default: `null`

The style of easing that you want to use for the container resize. See notes on 
easing in the Extensions section below.

### historyEnabled

* Type: `boolean`
* Default: Browser detected

Whether or not to enable the history API when going through elements.

### historyKey

* Type: `string`
* Default: filter

The string which is used by the history API to identify what the page URL 
should be. This is only relevent if the `historyEnabled` parameter is enabled.
By default it is filter and will cause pages similar to the following:

```html
/example/index.html?filter=something
```

## Tips

### Style and usability

* Consider defining the width of your list container.
* Define a border or background color for your list container for nicer animations.

### Clearing the filter

Pass an empty filter (a blank string: "") to show all items.

Building on the HTML example:

```html
<label><input type="radio" name="oozer-filter" value="" checked="checked" /> show all</label>
```

Or you can remove the filter in JavaScript using this code example:

```javascript
$('#oozer-list').oozer('filter', '');
```

## Licence

Copyright &copy; 2011-2015, [Bashkim Isai](http://www.bashkim.com.au)

This script is distributed under the MIT licence.

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

## Contributors

- @bashaus -- [Bashkim Isai](http://www.bashkim.com.au/)

If you fork this project and create a pull request add your GitHub username, your full name and website to the end of list above.
