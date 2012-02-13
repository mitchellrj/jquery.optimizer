jquery.optimizer
================

Attempts to optimize your jQuery code on the fly.

Usage
-----

Include your jQuery scripts in your page in the usual way, but
instead of using `type="text/javascript`, use
`type="text/javascript+jquery`::
  
  <script src="foo.js" type="text/javascript+jquery"></script>
  
  <script type="text/javascript+jquery">
    $.foo();
  </script>
  
then, include the `jquery.optimization.js` script in your page as an
ordinary Javascript resource, being careful to load it after all your
jQuery scripts.::
  
  <script src="jquery.optimizer.js" type="text/javascript"></script>
  
Optimizations
-------------

 * Optimized use of selectors. Sources:
   
   - http://24ways.org/2011/your-jquery-now-with-less-suck
   
   - http://jsperf.com/various-jquery-testcases
   
   - http://jsperf.com/jquery-document-tag-names-vs-child-tag-names
   
   - http://jsperf.com/find-vs-direct-selector
   
   - http://jsperf.com/jquery-nested-class-selectors
   
   - http://jsperf.com/id-vs-class-vs-tag-selectors/12
   
 * Optimized chaining of function calls. (TBD)
 
 * Optimized caching of selector results. (TBD)