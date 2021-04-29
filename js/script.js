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
                    // if there was not such user
                    if (response.status === 404) {
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
                showError('An Error Happened While Establishing Connection')
            }
        } else {
            // if data was cached, we don't send request anymore.
            console.log("found in local storage.")
            showInfo(JSON.parse(cached))
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
                // if some client or server error happens
                if (response.status >= 400)
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
                    while (cnt <= 5) {
                        const lan = repos[i].language;
                        if (lan !== null) {
                            if (lan in languages) {
                                languages[lan]++;
                            } else {
                                languages[lan] = 1;
                            }
                            cnt++;
                        }
                        i++;
                        if (i >= repos.length)
                            break
                    }
                    console.log(languages)
                    // finding the language which is used most
                    const favLan = Object.keys(languages).reduce((a, b) => languages[a] > languages[b] ? a : b);
                    console.log(`favLan: ${favLan}`)
                    return favLan;
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
        // making error section invisible
        infoContainer.classList.remove("disabled");
        // making info section visible
        if (!errorContainer.classList.contains("disabled"))
            errorContainer.classList.add("disabled");
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
        // making info section invisible
        errorContainer.classList.remove("disabled");
        // making error section visible
        if (!infoContainer.classList.contains("disabled"))
            infoContainer.classList.add("disabled");
        // putting the error message in the error section
        errorPara.innerHTML = msg;
    }
})()