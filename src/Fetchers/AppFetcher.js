
//now define the store
class AppFetcher {
    static fetchToken(callback)
    {
        if (typeof(Storage) !== "undefined") {
            // Code for localStorage/sessionStorage.
            var key = localStorage.getItem("accessToken");
            if (key != null) {
                callback(key);
            }
        }
    }

    static storeToken(token)
    {
        if (typeof(Storage) !== "undefined") {
            localStorage.setItem("accessToken", token);
        }
    }
}

export default AppFetcher;