module.numberOfDeletedMessages = 0;
module.idCounter = 0;
module.messages = [];

module.exports.pollResponses = [];
module.exports.statsResponses =[];
module.exports.numOfLoggedUsers = 0;

module.exports.addMessage = function(message)
{
    message.id = module.idCounter;
    module.idCounter++;
    module.messages.push(message);
    return message.id;
}

module.exports.getMessages = function(counter)
{
    var toReturn = [];

    if(counter >= module.messages.length)
    {
        for(i = 0 ; i < module.messages.length; i++)
        {
            if(module.messages[i] != null && module.messages[i].id >= counter)
            {
                toReturn.push(module.messages[i]);
            }
        }
    }

    else{
        while(counter < module.messages.length)
        {
            if(module.messages[counter] != null)
            {
                toReturn.push(module.messages[counter]);
            }

            counter++;
        }
    }

    return toReturn;
}

module.exports.deleteMessage = function(id)
{
    var i = 0;
    var toDelete = -1;
    for(i=0; i< module.messages.length; i++)
    {
        if(module.messages[i] != null && module.messages[i].id == id)
        {
            toDelete = i;
        }
    }

    if(module.messages != -1)
    {
        module.messages[toDelete] = null;
        module.numberOfDeletedMessages ++;  
    }
}

module.exports.getAllMessages = function()
{
    return module.messages;
}


module.exports.getNumberOfNoneNullMessage = function()
{
    return module.messages.length - module.numberOfDeletedMessages;
}

module.exports.getLastMessage = function()
{
    var i = module.messages.length-1;
    while(i >= 0 && module.messages[i] == null)
    {
        i--;
    }

    return i >= 0 ? module.messages[i] : null
}



