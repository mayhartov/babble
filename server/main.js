require('http').createServer( 
    function (request, response) {  

        var messageTextString = 'message';
        var userNameKey = 'name';
        var emailString = 'email';
        var timeStampString = 'timestamp';
        var url = require('url');
        var path = require('path');
        var messageUtils = require('./messages-util.js');

        var HandleUserLoggedOut = function()
        {
            var messageUtils = require('./messages-util.js');

            messageUtils.numOfLoggedUsers--;
            respondToStatsRequests(); 
        };

        var StoreMessage = function(data)
        {
            var messageUtils = require('./messages-util.js');
            var messageTextString = 'message';
            var userNameKey = 'name';
            var emailString = 'email';
            var timeStampString = 'timestamp';

            if(!(messageTextString in data) ||
            !(userNameKey in data) ||
            !(timeStampString in data))
            {
                return -1;
            }

            var message = {
                message : data[messageTextString],
                id: "",
                name: data[userNameKey],
                email: getGravatarImage(data[emailString]),
                timestamp : data[timeStampString]
            }

            return messageUtils.addMessage(message);
        };

        var getGravatarImage = function(email)
        {
            var baseUrl = "//www.gravatar.com/avatar/";
            return (baseUrl + (email == null ? "" : md5(email)).trim());
        };

        var respondToStatsRequests = function()
        {
            var messageUtils = require('./messages-util.js');

            while(messageUtils.statsResponses.length > 0) {
                var clientResponse = messageUtils.statsResponses.pop();
                clientResponse.end(JSON.stringify( {
                users: messageUtils.numOfLoggedUsers,
                messages: messageUtils.getNumberOfNoneNullMessage}));  
            }
        };

        var md5 = function(str)
        {
            var crypto = require('crypto');

            str = str.toLowerCase().trim();
            var hash = crypto.createHash("md5");
            hash.update(str);
            return hash.digest("hex");
        }; 

        var HandleUserAddedMessage = function(request, response)
        {
            var messageUtils = require('./messages-util.js');

            var requestBody = '';
                request.on('data', function(chunk) {
                    requestBody += chunk.toString();
                });

            request.on('end', function() {
                var newMsgId = StoreMessage(JSON.parse(requestBody));
                if(newMsgId < 0 )
                {
                    response.statusCode = 400;
                    response.writeHead(400, "bad request data");
                    response.end(); 
                    return;
                }

                var newMessage = messageUtils.getLastMessage();

                if(newMessage != null)
                {             
                    while(messageUtils.pollResponses.length > 0) {
                        console.log("polling:" + JSON.stringify([newMessage]));
                        var clientResponse = messageUtils.pollResponses.pop();
                        clientResponse.end(JSON.stringify( {content: JSON.stringify([newMessage])}));
                        }
                }

                response.end(JSON.stringify({id : newMsgId}));
            }); 
        }

        var method = request.method;

        response.setHeader('Access-Control-Allow-Origin', '*');
        response.setHeader('Access-Control-Allow-Methods', "GET, POST, OPTIONS, DELETE");
        response.setHeader("Access-Control-Allow-Headers", "Content-Type, application/json;charset=UTF-8");

        var messagesUrlString = 'messages';
        var userLoggedOutUrlString = 'logout';
        
        var parsedUrl = url.parse(request.url);
    if(method == "OPTIONS")
        {
            response.statusCode = 204;
            response.writeHead(204, "OPTIONS requests are not valid");
            response.end();    
            return;   
        }

        else if(parsedUrl.path.includes(userLoggedOutUrlString))
        {
            HandleUserLoggedOut(); 
        }


        else if(parsedUrl.pathname.substring(1,9) == messagesUrlString)
        {
            var allMessages = messageUtils.getAllMessages();
            if(method == "GET")
            {
                var numOfMessagesInClientSide = parseInt(parsedUrl.path.substr(18));

                if(isNaN(numOfMessagesInClientSide))
                {
                    console.log(numOfMessagesInClientSide);
                    response.statusCode = 400;
                    response.writeHead(400, "bad request data");
                    response.end(); 
                }

                if(numOfMessagesInClientSide < allMessages.length)
                {
                    var messagesToReturn = messageUtils.getMessages(numOfMessagesInClientSide);
                    if(messagesToReturn == null || messagesToReturn.length == 0)
                    {
                        messageUtils.pollResponses.push(response)
                    }

                    else
                    {
                        response.end(JSON.stringify( {
                            content: JSON.stringify(messagesToReturn)}));    
                    }
                }

                else
                {
                    messageUtils.pollResponses.push(response);
                }

                return;
            }

            else if(method == "POST")
            {
                HandleUserAddedMessage(request, response); 
                return;
            }

            else if(method == "DELETE")
            {
                var messageToRemoveId = parsedUrl.pathname.substring(10);
                messageUtils.deleteMessage(messageToRemoveId);   
                response.end(JSON.stringify({id:messageToRemoveId}));
                return; 
            }

            else
            {
                response.statusCode = 405;
                response.writeHead(405, "HTTP method is bad for this URL");
                response.end();
            }

            return;
        } 

        else if (parsedUrl.pathname.includes("stats")){
                if(method != "GET")
                {           
                    response.statusCode = 405;
                    response.writeHead(405, "HTTP method is bad for this URL");
                    response.end();
                    return;
                }

                if(!parsedUrl.pathname.endsWith("statsupdates"))
                {
                    messageUtils.numOfLoggedUsers ++;
                    response.end(JSON.stringify( {
                    users: messageUtils.numOfLoggedUsers,
                    messages: messageUtils.getNumberOfNoneNullMessage()
                    }));
                }

                else
                {
                    messageUtils.statsResponses.push(response);
                }
            } 

        else{
            response.statusCode = 404;
            response.writeHead(404, "Requested URL was not found");
            response.end();
        } 

}).listen(9000, '0.0.0.0');