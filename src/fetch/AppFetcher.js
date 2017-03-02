
//now define the store
class AppFetcher {
    static fetchToken()
    {
        if (typeof(Storage) !== "undefined") {
            // Code for localStorage/sessionStorage.
            var key = localStorage.getItem("accessToken");
            if (key != null) {
                return key;
            }
        }
    }

    static storeToken(token)
    {
        if (typeof(Storage) !== "undefined") {
            localStorage.setItem("accessToken", token);
        }
    }

    static deleteToken()
    {
        if (typeof(Storage) !== "undefined") {
            localStorage.removeItem("accessToken");
        }
    }
}

export default AppFetcher;