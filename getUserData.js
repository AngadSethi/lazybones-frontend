var logged_in_user;

chrome.runtime.sendMessage({greeting: "hello"}, function(response) {
    logged_in_user = response.info;
});

