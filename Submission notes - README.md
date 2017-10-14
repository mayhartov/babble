Please note that I was unable to disable https (the URL you've asked for is http://.....)
I've copied the client's files into a branch - gh-pages and published the website from this branch, so the URL of the website is:

https://mayhartov.github.io/babble/#/vegans

insead of: 

http://mayhartov.github.io/babble/#/vegans

Due to the fact that I couldn't change the protocol to http, the requests to the server throughs exception (cannot use http requests inside https website.....) I wanted to change the requests from client to the server to https, but I saw in the unit tests you used 
http......

Please note that all of the requests will work if you will start the website with npm start and not from https://mayhartov.github.io/babble/#/vegans

The full submission can be found under "master" branch (client, server and unit tests folders).
