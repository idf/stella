timeIntervelIdle = 120*1000;  //ms 
timeIntervel = timeIntervelIdle;
var repos = [];

function check_star(repo) {
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.onreadystatechange = function () {
        if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
            var text = xmlhttp.responseText;
            var obj = JSON.parse(text);
            var newStars = obj.stargazers_count;
            notify(repo, newStars);
        }
    };
    xmlhttp.open("GET", "https://api.github.com/repos/" + repo, true);
    if(typeof TOKEN != 'undefined') xmlhttp.setRequestHeader("Authorization","token "+TOKEN);
    xmlhttp.send();
}

function show(repo, oldStars, newStars) {
    var title = "Stella: new star!";
    var message;
    if (newStars > oldStars) {
        var difference = newStars-oldStars;
        if(difference==1) {
          message = difference+' new star at '+repo+'! Currently '+newStars+' stars now!';
        }
        else {
          message = difference+' new stars at '+repo+'! Currently '+newStars+' stars now!'; 
        }                        

        Notification.requestPermission(function() {
            var notification = new Notification(title, {body: message, icon: './fluidicon.png'});
            if(title=="Welcome") {
                clearInterval(intervalBusy);  
            }
            notification.onclick = function () {
                chrome.tabs.create({
                    url: "https://github.com/"+repo
                });
                this.cancel();
            };
            notification.onclose = function (){
                this.cancel();
            };
        });
    } 
}

function notify(repo, newStars) {
    var oldStars = localStorage.getItem(repo);
    if(oldStars===null) {
        localStorage.setItem(repo, newStars);
    }
    else if (newStars > oldStars) {
        show(repo, oldStars, newStars);
        localStorage.setItem(repo, newStars);
    }
    console.log("check_star for: "+repo);
}

function check_stars() {
    for(var i=0; i<repos.length; i++) {
        check_star(repos[i][0], repos[i][1]);
    }
}

function get_repo(username) {
    var xmlhttp = new XMLHttpRequest();
    var result;
    xmlhttp.onreadystatechange = function () {
        if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
            var text = xmlhttp.responseText;
            result = JSON.parse(text);

            var funcs = [];
            for(var i=0; i<result.length; i++) {
                var name = result[i].full_name;
                var stars = result[i].stargazers_count;
                console.log("name: "+name+" stars: "+stars);
                repos.push([name, stars]);
                notify(name, stars);
            }
            
        }
    };
    xmlhttp.open("GET", "https://api.github.com/users/"+username+"/repos", true);  // `false` makes the request synchronous
    if(typeof TOKEN != 'undefined') xmlhttp.setRequestHeader("Authorization","token "+TOKEN);
    xmlhttp.send();
}


function main() {
    chrome.storage.sync.get("username", function(data) {
        var username = "zhangdanyangg";
        console.log(data);
        if(data["username"]) 
            username=data["username"];
        else
            welcome(); 
        get_repo(username)
        }
    );
}

function welcome() {
    Notification.requestPermission(function() {
        var msg = "Welcome to Stella. Get Notifications of your new github stars! Configure it at here";
        var notification = new Notification("Stella: welcome", {body: msg, icon: './fluidicon.png'});
        notification.onclick = function () {
            chrome.tabs.create({
                url: chrome.extension.getURL("options.html")
            });
            this.cancel();
        };
        notification.onclose = function (){
            this.cancel();
        };
    });
}

main();
setInterval(function(){main();}, timeIntervel);