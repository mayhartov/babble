
window.Babble = {
    lastMessageId : 0,
    LocalStorageKey : "babble",
    currentMessageKey : "currentMessage",
    userNameKey : "name",
    emailKey : "email",
    userInfoKey : 'userInfo',
    tabindex : 4
}

window.localStorage.setItem(
    Babble.LocalStorageKey, 
    window.localStorage.getItem("babble") === null ?
    JSON.stringify(
    {          
        userInfo: { name: '' , email:'' }, 
        currentMessage: ''
     }) : 

    window.localStorage.babble);

Babble.onLoadMethod = function()
{
    var area = document.querySelector('textarea');
	var clone = document.querySelector('span');


	area.addEventListener('input', function(e) {
        var messages = document.querySelector(".DisplayMessages");
        var info = document.querySelector('.RoomInfo');
        var main = document.querySelector("main");
        var form =  document.querySelector('.Growable');
		clone.textContent = area.value;
        messages.style.height = (main.offsetHeight - info.offsetHeight -  form.offsetHeight ) + 'px';
    });

    Babble.getMessages(0, Babble.HandleResponseRecived);
    Babble.getStats(Babble.HandleStatsRecived);

    var localData = JSON.parse(localStorage[Babble.LocalStorageKey]);

    if(localData["userInfo"]["name"] != "")
    {
        var localStorageInfo = JSON.parse(localStorage.babble);
        var currentMessageTextElement = document.querySelector(".SubmitMessage-textarea");
        currentMessageTextElement.value = localStorageInfo.currentMessage;
    }

    else
   {
        Babble.ChangeModalDisplay('block');
    }

    var form = document.querySelector('.SubmitMessage');
    form.addEventListener('submit', function(e)
    {
        e.preventDefault();
        Babble.submitMessageAction();
    });
}

Babble.onUnloadMethod = function()
{
    var request = new XMLHttpRequest();
    request.timeout = 0.1;
    request.open("GET", 'http://localhost:9000/logout');
    request.send(null);
}

Babble.submitMessageAction = function()
{
    var form = document.querySelector('.SubmitMessage');
    Babble.postMessage(Babble.serialize(form), function(result){});

    Babble.ClearMessageArea();
}

Babble.SignInWithUser = function()
{
    var userEmail = document.getElementById("emailInputArea").value;
    var userName = document.getElementById("fullNameInputArea").value;

    Babble.register({ name : userName, email : userEmail});

    Babble.ChangeModalDisplay("none");
    Babble.getMessages(0, Babble.HandleResponseRecived);
    Babble.getStatsUpdates(Babble.HandleStatsRecived);
}

Babble.SignInAsAnonymous = function()
{
    Babble.register({ name : '', email : ''});
    Babble.ChangeModalDisplay("none"); 
    Babble.getStatsUpdates(Babble.HandleStatsRecived);
}


Babble.register = function(userDetails)
{
    var localData = {};
    localData[Babble.currentMessageKey] = new String();
    localData[Babble.userInfoKey] =  userDetails;
    localStorage.setItem(Babble.LocalStorageKey, JSON.stringify(localData));
}


Babble.ChangeModalDisplay = function(modalState)
{
    var modal = document.querySelector('.Modal');
    var modalOverlay = document.querySelector('.Modal-overlay');
    modal.style.display = modalState;
    modalOverlay.style.display = modalState;
}


Babble.serialize = function(form)
{
    if(localStorage[Babble.LocalStorageKey] != null)
    {
        var localData = JSON.parse(localStorage[Babble.LocalStorageKey]);
        var userInfo = localData.userInfo;
         data = {
             name : userInfo.name,
             email : userInfo.email,
             message : localData.currentMessage,
             timestamp : Date.now(),
         }
    }

    return data;
}


Babble.HandleResponseRecived = function(jsonResponse) 
{
    var messages = JSON.parse(jsonResponse["content"]);
    if(messages.length == 0)
    {
        return;
    }

    lastMessageId = messages[messages.length-1].id;
    messages.forEach(function(element) {
        Babble.AddMessageToHtml(element)
    }, this);

    var messagesListElement = document.querySelector(".DisplayMessages");
    messagesListElement.scrollTop = messagesListElement.scrollHeight;
    Babble.getMessages(lastMessageId + 1, Babble.HandleResponseRecived);
}

Babble.HandleStatsRecived = function(jsonResponse)
{
    var numOfConnectedUsers = parseInt(jsonResponse["users"]);

    Babble.updateNumberOfUsersLable(numOfConnectedUsers);

    var messagesListElement = document.querySelector(".DisplayMessages");
    messagesListElement.scrollTop = messagesListElement.scrollHeight;
    
    Babble.getStatsUpdates(Babble.HandleStatsRecived);
}

Babble.AddToNumOfMessagesLabel = function(number)
{
    var numOfMessagesElement = document.getElementById("numOfMessages");
    numOfMessagesElement.innerHTML = parseInt(numOfMessagesElement.innerHTML) + number;
}


Babble.updateNumberOfUsersLable = function(numOfUsers)
{
    var numOfUsersElement = document.getElementById("numOfUsers");
    numOfUsersElement.innerHTML = numOfUsers;
}

Babble.AddMessageToHtml = function(messageDetails)
{
    var messagesElement = document.querySelector(".DisplayMessages");
    var newMessage = document.createElement("li");
    var id = messageDetails.id;
    newMessage.classList.add("Messages-message");
    newMessage.setAttribute("ID", id);
    newMessage.appendChild(Babble.CreateUserImgElement(messageDetails.email, messageDetails.name));
    newMessage.appendChild(Babble.CreateMessageDetailsContainerElement(messageDetails, id));
    Babble.tabindex++;

    messagesElement.appendChild(newMessage);
    Babble.AddToNumOfMessagesLabel(1)
}

Babble.CreateMessageDetailsContainerElement = function(messageDetails, id)
{
    var messageContent = messageDetails.message;
    var name = messageDetails.name == '' ? "Anonymous" : messageDetails.name;
    var time = messageDetails.timestamp;

    var msgDetailsContainer = document.createElement("div");
    msgDetailsContainer.setAttribute("tabindex", 2*Babble.tabindex);
    msgDetailsContainer.classList.add("Messages-message-details");

    msgDetailsContainer.appendChild(Babble.CreateUserNameCiteElement(name));
    var timeElement = Babble.CreateMessageTimeElement(time);
    msgDetailsContainer.appendChild(timeElement);

    if(name == (JSON.parse(localStorage[Babble.LocalStorageKey]).userInfo).name)
    {
        msgDetailsContainer.appendChild(Babble.CreateDeleteMessageBtn(id));
    }

    msgDetailsContainer.appendChild(document.createElement("br"));
    msgDetailsContainer.appendChild(Babble.CreateMessageTextContentElement(messageContent));
    return msgDetailsContainer;
}

Babble.CreateUserNameCiteElement = function(userName)
{
    var citeElement = document.createElement("cite");
    citeElement.textContent = userName;
    citeElement.classList.add("Messages-message-details-userName");
    return citeElement;
}

Babble.CreateDeleteMessageBtn = function(id)
{
    var deleteMessageBtn = document.createElement("input");
    deleteMessageBtn.setAttribute("tabindex", 2*Babble.tabindex);
    deleteMessageBtn.setAttribute("type", "image");
    deleteMessageBtn.setAttribute("alt", "delete");
    deleteMessageBtn.src = "images/deleteMessage.png"
    deleteMessageBtn.classList.add("deleteMessageBtn");
    deleteMessageBtn.onclick = function () { return Babble.deleteMessageFromHtmlAndServer(id, Babble.HandleMessageDeleted) };
    return deleteMessageBtn;
}

Babble.CreateMessageTextContentElement = function(text)
{
    var messageTextElement = document.createElement("p");
    messageTextElement.textContent = text;
    messageTextElement.classList.add("Messages-message-details-content");
    return messageTextElement;
}

Babble.CreateMessageTimeElement = function(unixTime)
{
    var timeElement = document.createElement("time");
    timeElement.classList.add("Messages-message-details-time")
    var dateTime = new Date(parseInt(unixTime))
    var h = dateTime.getHours();
    var m = dateTime.getMinutes();

    
    timeElement.dateTime = dateTime;
    timeElement.textContent = h + ':' + (m < 10? '0' : '' ) + m;
    return timeElement;
}

Babble.CreateUserImgElement = function(gravatarUrl, name)
{
    var imgElement = document.createElement("img");
    imgElement.classList.add("msgUserImg");
    imgElement.setAttribute("alt", "");
    imgElement.src = name == '' ?  "images/anonymous.png" : gravatarUrl;
    return imgElement;
}

Babble.postMessage = function(data, callback)
{
    var request = new XMLHttpRequest();
    request.addEventListener("load", function(e){
            callback(JSON.parse(e.target.responseText));
        }, true);

    var form = document.querySelector(".SubmitMessage");
    if(form != null && form.action != undefined && form.method != undefined)
    {
        request.open(form.method, form.action);
    }

    else
    {
        request.open("POST", 'http://localhost:9000/messages');
    }

    request.setRequestHeader('Content-type', "application/json;charset=UTF-8");
    request.send(JSON.stringify(data));
}

Babble.getMessages = function(count, callback)
{
    var request = new XMLHttpRequest();
    request.addEventListener("load", function(e){
            callback(JSON.parse(e.target.responseText));
        }, true);
    request.open("GET", 'http://localhost:9000/messages?counter=' + count);
    request.setRequestHeader('Content-type', "application/json;charset=UTF-8");
    request.send(null);
}

Babble.getStatsUpdates = function(callback)
{
    var request = new XMLHttpRequest();
    request.addEventListener("load", function(e){
            callback(JSON.parse(e.target.responseText));
        }, true);
    request.open("GET", 'http://localhost:9000/statsupdates');
    request.setRequestHeader('Content-type', "application/json;charset=UTF-8");
    request.send(null);
}

Babble.deleteMessageFromHtmlAndServer = function(id, callback)
{
    var messageToDelete = document.getElementById(id);
    messageToDelete.parentElement.removeChild(messageToDelete);
    Babble.deleteMessage(id, callback)
}

Babble.getStats = function(callback)
{
     var request = new XMLHttpRequest();
    request.addEventListener("load", function(e){
            callback(JSON.parse(e.target.responseText));
        }, true);
    request.open("GET", 'http://localhost:9000/stats');
    request.setRequestHeader('Content-type', "application/json;charset=UTF-8");
    request.send(null);   
}

Babble.deleteMessage = function(id, callback)
{
    var request = new XMLHttpRequest();
    request.addEventListener("load", function(e){
            callback(JSON.parse(e.target.responseText));
        }, true);
    request.open("DELETE", 'http://localhost:9000/messages/'+id);
        request.setRequestHeader('Content-type', "application/json;charset=UTF-8");
    request.send(null);
}

Babble.currentMessageChanged = function()
{
    var currentMessageText = document.querySelector(".SubmitMessage-textarea").value;
    if(currentMessageText.endsWith("\n"))
    {
        Babble.submitMessageAction();
        var localStorageInfo = JSON.parse(localStorage.babble);
        localStorageInfo.currentMessage = "";
        localStorage.setItem(Babble.LocalStorageKey, JSON.stringify(localStorageInfo))
    }
    
    var localStorageInfo = JSON.parse(localStorage.babble);
    localStorageInfo.currentMessage = currentMessageText;
    localStorage.setItem(Babble.LocalStorageKey, JSON.stringify(localStorageInfo))
}

Babble.CheckSubmit = function(event)
{
    if(e && e.keyCode == 13) 
    {
        var messageForm = document.querySelector('.SubmitMessage');
        messageForm.submit();
    }
}

Babble.ClearMessageArea = function()
{
    var messageTextArea = document.querySelector(".SubmitMessage-textarea");
    messageTextArea.value = "";
    Babble.currentMessageChanged();
}

Babble. HandleMessageDeleted = function(responseText)
{
    Babble.AddToNumOfMessagesLabel(-1);
}

Babble.SetMessagesSize = function(e) {
         var messages = document.querySelector(".DisplayMessages");
        var info = document.querySelector('.roomInfo');
        var main = document.querySelector("main");
        var form =  document.querySelector('.Growable');
		clone.textContent = area.value;
        messages.style.height = (main.offsetHeight - info.offsetHeight - form.offsetHeight +30) + 'px';
}