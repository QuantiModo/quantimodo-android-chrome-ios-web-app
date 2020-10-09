private_keys = {
    "username": null,
    "password": null,
    "bugsnag_key": "xyz",
    "client_ids": {
        "iOS": "your_quantimodo_client_id_here",
        "Android": "your_quantimodo_client_id_here",
        "Web": "your_quantimodo_client_id_here",
        "Chrome": "your_quantimodo_client_id_here",
        "Windows": "your_quantimodo_client_id_here"
    },
    "client_secrets": {
        "iOS": "your_quantimodo_client_secret_here",
        "Android": "your_quantimodo_client_secret_here",
        "Web": "your_quantimodo_client_secret_here",
        "Chrome": "your_quantimodo_client_secret_here",
        "Windows": "your_quantimodo_client_secret_here"
    },
    "FACEBOOK_APP_ID": "123456789",
    "FACEBOOK_APP_NAME": "SOMEAPPNAME"
};

if(!module){
    var module = {};
}

module.exports = private_keys;