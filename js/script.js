// By Kamyar Janparvari - 9626015


// whole code is wrapped in an arrow function
(() => {
    // selecting elements and assigning them to variables (it's self explanatory)
    const submitButton = document.getElementById("submitButton");
    const usernameTextBox = document.getElementById("username");
    const avatar = document.getElementById("avatar");
    const nameLabel = document.getElementById("name");
    const blogLabel = document.getElementById("blog");
    const favLanLabel = document.getElementById("favLan");
    const locationLabel = document.getElementById("location");
    const bio = document.getElementById("bio");
    const infoContainer = document.getElementById("infoContainer");
    const errorContainer = document.getElementById("errorContainer");
    const errorPara = document.getElementById("errorMsg");
    const alertBox = document.getElementById("alert");

    // attach handler to submit button
    // it reads username from text box and calls getInfo() function to put values in the above elements
    window.onload = () => {
        submitButton.addEventListener('click', async () => {
            const username = usernameTextBox.value;
            if (username.trim() !== "")
                await getInfo(username.trim());
        });
    }

    /**
     * gets a string argument as username and gets him/ her info from github and represent them using showInfo()
     *
     * @param username
     * @returns {Promise<void>}
     */
    const getInfo = async (username) => {
        // checking if the information is cached in local storage
        const cached = window.localStorage.getItem(username);
        if (cached === null) {
            try {
                // making url to use fetch api
                const url = `https://api.github.com/users/${username}`;
                // sending request to the url to get the info
                await fetch(url).then(async (response) => {
                    // if there was no internet connection
                    if (response === null) {
                        showError('An Error Happened While Establishing Connection');
                    }
                    // if there was not such user
                    else if (response.status === 404) {
                        showError(`Can Not Find Such User "${username}"`)
                    }
                    // if some other client or server error happened
                    else if (response.status >= 400) {
                        const data = await response.json();
                        showError(data["message"]);
                    }
                    // if request was successful
                    else if (response.status === 200) {
                        // getting response body in json format
                        const rawData = await response.json();
                        // finding favorite language
                        const favLan = await getFavoriteLanguage(rawData["repos_url"]);
                        console.log(favLan)
                        // making an object of useful information that we need
                        const info = {
                            avatar: rawData["avatar_url"],
                            name: rawData["name"],
                            blog: rawData["blog"],
                            location: rawData["location"],
                            bio: rawData["bio"],
                            favLan: favLan
                        }
                        // caching it in local storage
                        window.localStorage.setItem(username, JSON.stringify(info));
                        console.log(info)
                        // representing them by calling showInfo()
                        showInfo(info);
                    }
                });
            } catch (e) {
                // the above scope is about getting data from github and showing them
                // so if something goes wrong following message will be shown on screen
                showError('An Error Happened While Establishing Connection');
            }
        } else {
            // if data was cached, we don't send request anymore.
            console.log("found in local storage.");
            showInfo(JSON.parse(cached));
            // showing an alert that local storage is used.
            showAlert("Used Local Storage. This User Was Searched Before.");
        }
    }
    /**
     * gets repositories url and returns favorite language
     * @param reposLink
     * @returns {Promise<Response>}
     */
    const getFavoriteLanguage = async (reposLink) => {
        try {
            // sending request to get repositories array
            return await fetch(reposLink).then(async (response) => {
                // if there was no internet connection
                if (response === null) {
                    showError('An Error Happened While Establishing Connection');
                }
                // if some client or server error happens
                else if (response.status >= 400)
                    return " - ";
                // if request was successful
                else if (response.status === 200) {
                    const repos = await response.json();
                    // if there was no repositories
                    if (repos === null || repos.length === 0)
                        return " - "
                    // a function for comparing 2 repository in order to sort the repos array
                    const compareRepos = (a, b) => {
                        if (Date.parse(a["pushed_at"]) < Date.parse(b["pushed_at"]))
                            return 1;
                        else if (Date.parse(a["pushed_at"]) > Date.parse(b["pushed_at"]))
                            return -1;
                        return 0;
                    }
                    // sorting the array based on pushed time
                    repos.sort(compareRepos)
                    const languages = {}
                    let cnt = 0;
                    let i = 0;
                    // checking top 5 repositories and counting used languages
                    while (cnt <= 4) {
                        const lan = repos[i].language;
                        if (lan !== null) {
                            if (lan in languages) {
                                languages[lan]++;
                            } else {
                                languages[lan] = 1;
                            }
                            // cnt++;
                        }
                        cnt++;
                        i++;
                        if (i >= repos.length)
                            break
                    }
                    // finding the language which is used most
                    const maxLan = Object.keys(languages).reduce((a, b) => languages[a] > languages[b] ? a : b);
                    let favLan = ""
                    Object.keys(languages).forEach((key) => {
                        if (languages[key] === languages[maxLan])
                            favLan += key + ", "
                    })
                    return favLan.slice(0, -2);
                }
            });
        } catch (e) {
            showError('An Error Happened While Establishing Connection')
        }

    }

    /**
     * gets the user info and represent them in appropriate elements
     * @param data
     */
    const showInfo = (data) => {
        // making info section visible
        infoContainer.classList.remove("disabled");
        // making error section invisible
        if (!errorContainer.classList.contains("disabled"))
            errorContainer.classList.add("disabled");
        // making alert box invisible
        if (!alertBox.classList.contains("disabled"))
            alertBox.classList.add("disabled");
        // putting data in elements
        nameLabel.innerHTML = data["name"];
        blogLabel.innerHTML = data["blog"];
        blogLabel.href = data["blog"];
        locationLabel.innerHTML = data["location"];
        avatar.src = data["avatar"];
        favLanLabel.innerHTML = data["favLan"];
        bio.innerHTML = "";
        if (data["bio"] !== null) {
            data["bio"].split("\r\n").map((line) => {
                const para = document.createElement("p");
                para.appendChild(document.createTextNode(line));
                para.className = "bio__line";
                bio.appendChild(para)
            });
        }

    }

    /**
     * shows the error message in the error section
     * @param msg
     */
    const showError = (msg) => {
        // making error section visible
        errorContainer.classList.remove("disabled");
        // making info section invisible
        if (!infoContainer.classList.contains("disabled"))
            infoContainer.classList.add("disabled");
        // making alert box invisible
        if (!alertBox.classList.contains("disabled"))
            alertBox.classList.add("disabled");
        // putting the error message in the error section
        errorPara.innerHTML = msg;
    }

    /**
     * shows a disappearing alert box containing the input message
     * @param msg
     */
    const showAlert = (msg) => {
        alertBox.innerHTML = msg;
        alertBox.classList.remove("disabled");
    }

})()