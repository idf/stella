function save_options() {
  var username = document.getElementById("username").value;
  chrome.storage.sync.set({
    "username": username,
  }, function() {
    // Update status to let user know options were saved.
    var status = document.getElementById("status");
    status.textContent = "Options saved.";
    setTimeout(function() {
      status.textContent = "";
    }, 3000);
  });
}


document.getElementById("save").addEventListener("click", save_options);
chrome.storage.sync.get("username", function(data) {
  var msg = "Not yet set";
  console.log(data);
  if(data["username"]) msg=data["username"];
  document.getElementById("username").placeholder = msg;
  }
);


