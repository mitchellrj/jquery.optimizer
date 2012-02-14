(function ($) {
	"use strict";
	
	window.gh = window.gh || {};
	
	var username = 'mitchellrj',
	    user = gh.user(username),
	    $myRepos = $(document.getElementById('my-repo-list')),
	    $contributedRepos = $(document.getElementById('contributed-repo-list')),
	    $myGists = $(document.getElementById('gist-list')),
	    fixedCreatedRepos = [
              ['isotoma', 'isotoma.zope.aqheaders',
               'Adds HTTP headers about Acquisition to responses from Zope'],
              ['netsight', 'netsight.async',
               'Provides a base view for running asynchronous processes from Zope.'],
              ['netsight', 'netsight.async_examples',
               'Examples for netsight.async']
        ],
        fixedContributedRepos = [
              ['isotoma', 'isotoma.recipe.template',
               'Cheetah templating for buildout.'],
              ['isotoma', 'isotoma.recipe.fms',
               'Buildout recipe for creating instances of Flash Media Server.']
        ];
	
	function addRepositories (repos) {
		var i, list, showWebsite;
		for (i = 0; i < repos.length; i+=1) {
			if (!repos[i].fork && repos[i].owner===username) {
				list = $myRepos;
				showWebsite = !!repos[i].homepage;
			} else {
				list = $contributedRepos;
				showWebsite = false;
			}
			list.prepend([
			    '<li class="lang-'+ repos[i].language + '">',
			      '<h3>',
			        '<a href="' + repos[i].url + '">',
			          repos[i].name,
			        '</a>',
			      '</h3>',
			      '<p class="desc">',
			         repos[i].description,
			      '</p>',
			      showWebsite ? '<p><a href="' + repos[i].homepage + '" class="btn">Visit website</a></p>' : '',
			    '</li>'
			].join('\n'));
		}
	}
	
	user.allRepos(function (data) { addRepositories(data.repositories); });
	
	function addFixedRepositories(array, created) {
		var i, repo;
		for (i = 0; i < array.length; i += 1) {
			repo = {
	        	fork: !created,
	        	homepage: array[i][3],
	        	language: array[i][4] || 'Python',
	        	name: array[i][1],
	        	owner: created ? username : array[i][0],
	        	description: array[i][2],
	        	url: 'https://github.com/' + array[i][0] + '/' + array[i][1]
	        };
			addRepositories([repo]);
		}
	}
	
	addFixedRepositories(fixedCreatedRepos, true);
	addFixedRepositories(fixedContributedRepos, false);
	
	user.publicGists(function (data) {
		var i;
		for (i = 0; i < data.gists.length; i+=1) {
			$myGists.append([
			    '<li>',
			      '<p class="desc">',
			        data.gists[i].description,
			      '<a href="https://gist.github.com/' + data.gists[i].repo + '">view &raquo;</a></p>',
			    '</li>'
			].join('\n'));
		}
	});
	
}(jQuery));