/*
   Copyright 2012 Richard Mitchell

   Licensed under the Apache License, Version 2.0 (the "License");
   you may not use this file except in compliance with the License.
   You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
*/
/*jslint browser: true, white: true, regexp: true, maxerr: 50, indent: 4 */
(function () {
	"use strict";

	window.jQuery = window.jQuery || {};

	RegExp.escape = function (text) {
		return text.replace(/[\-\[\]{}()*+?.,\\\^$|#\s]/g, "\\$&");
	};

	var jsSources = document.getElementsByTagName('script'),
		opera = window.navigator.userAgent.toLowerCase().search(/opera/i) !== -1,
		// : is part of a valid name, but excluded here to differentiate from
		// pseudo-classes.
		xmlNameStartChar =
			'A-Za-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D' +
			'\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF' +
			'\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD\u10000-\uEFFFF_',
		// . is a valid part of a name, but excluded here to differentiate
		// from class selectors
		xmlNameChar =
			xmlNameStartChar +
			'0-9\u0300-\u036F\u203F-\u2040\u00B7-',
		xmlName = '[' + xmlNameStartChar + '][' + xmlNameChar + ']*',
		xmlNameRegExp = new RegExp('^' + xmlName + '$'),
		// . is a valid part of a name, but excluded here to differentiate
		// from class selectors
		htmlId = '#[a-zA-Z][a-zA-Z0-9-_:]*',
		htmlIdRegExp = new RegExp('^' + htmlId + '$'),
		selectorUse =
			'(\\$|(\\$)?\\.find\\s*)' +
			'\\(\\s*(' +
				'\'(([^\'\\\\]|\\\\.)*)\'' + '|' +
				'"(([^"\\\\]|\\\\.)*)"' +
			')\\s*\\)',
		first = false,
		selectorUseRegExp = new RegExp(selectorUse, 'g'),
		selectorPartsRegExp = /([^\s"']|"([^\"\\]|\\.)*"|'([^\'\\]|\\.)*')+/g,
		i, type;

	function optimizeSelectors(source, pass) {
		var selectorCall, selectors, selector, quot, replacementSelectorCall, match;

		match = selectorUseRegExp.exec(source);
		while (match !== null) {
			selectorCall = match[0];
			quot = !! match[4] ? "'" : '"';
			selector = (match[4] || match[6]).replace(/(^\s+|\s+$)/g, '');
			first = match[1][0] === '$';
			if (htmlIdRegExp.test(selector)) {
				// http://jsperf.com/various-jquery-testcases
				// $('#foo') -> $(document.getElementById('foo')
				if (first) {
					replacementSelectorCall =
						match[1] +
						'(document.getElementById(\'' +
						selector.substr(1) + '\'))';
				} else {
					replacementSelectorCall = 
						match[1] +
						'($(document.getElementById(\'' +
						selector.substr(1) + '\')))';
				}
				source = source.replace(
						selectorCall,
						replacementSelectorCall
					);
			} else if (first && xmlNameRegExp.test(selector)) {
				// http://jsperf.com/jquery-document-tag-names-vs-child-tag-names
				// $('foo') -> $(document.getElementsByTagName('foo')
				source = source.replace(
						selectorCall,
						match[1] +'(document.getElementsByTagName(\'' +
							selector + '\'))');
			} else if (	!opera &&
						(selectors = selector.match(selectorPartsRegExp))
						&& selectors.length > 1) {
				// http://jsperf.com/find-vs-direct-selector
				// http://jsperf.com/jquery-nested-class-selectors
				// http://jsperf.com/id-vs-class-vs-tag-selectors/12
				// $('.class p #foo bar[attr="a b c"]') ->
				// $('.class').find('p').find('#foo').find('bar[attr="a b c"]')
				replacementSelectorCall =
					match[1] + "(" + quot + selectors[0] + quot +
					").find(" +quot +
						selectors.slice(1).join(quot + ").find(" + quot)
					+ quot + ")";
				source = source.replace(
						selectorCall,
						replacementSelectorCall
					);
			}
			match = selectorUseRegExp.exec(source);
		}

		// nth pass
		if (source !== pass) {
			source = optimizeSelectors(source, source);
		}
		return source;
	}

	function optimizeChaining(source) {
		return source;
	}

	function optimizeCaching(source) {
		return source;
	}

	function optimize(source) {
		source = optimizeSelectors(source);
		source = optimizeChaining(source);
		source = optimizeCaching(source);

		return source;
	}

	function optimizeNode(sourceNode, source) {

		var optimizedNode;

		source = source || sourceNode.innerHTML;

		if (!source && sourceNode.hasAttribute('src') && window.jQuery.ajax) {
			window.jQuery.ajax({
				async: false,
				// Script load order is important
				url: sourceNode.getAttribute('src'),
				success: function (data, jqXHR, textStatus) {
					optimizeNode(sourceNode, data);
				},
				dataType: 'text'
			});
			return;
		}

		if (source && source.replace(/(^\s+|\s+$)/g, '') !== '') {
			source = optimize(source);
	
			optimizedNode = document.createElement('script');
			optimizedNode.innerHTML = source;
			optimizedNode.setAttribute('type', 'text/javascript');
			sourceNode.parentNode.replaceChild(optimizedNode, sourceNode);
		}

	}

	for (i = 0; i < jsSources.length; i += 1) {
		type = (jsSources[i].getAttribute('type') || '').toLowerCase();
		if (type === 'text/javascript+jquery') {
			optimizeNode(jsSources[i]);
		}
	}

	// export
	window.jQuery.optimize = optimize;

}());
