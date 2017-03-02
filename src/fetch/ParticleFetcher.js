import 'whatwg-fetch'

class ParticleFetcher {

    constructor(url="https://api.particle.io") {
        this.url = url;
    }

    static handleErrors(response) {
        if (!response.ok) {
            console.log("ERROR: " + response.status)
            throw Error(response.status);
        }
        return response;
    }

    login(email, password, callback) {
        var data = new FormData()
        data.append("username", email)
        data.append("password", password)
        data.append("grant_type", "password")
        data.append("expires_in", 7776000)

        fetch(this.url + "/oauth/token", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            user: "particle:particle",
            body: data
        }).then(ParticleFetcher.handleErrors)
        .then((response) => {
            return response.text()
        }).then((response) => {
            var results = JSON.parse(response)
            callback(results.access_token);
        }).catch(function(error) {
            callback(null, error.message);
        });
    }
}

export default ParticleFetcher;