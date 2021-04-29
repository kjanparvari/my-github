(() => {
    const submitButton = document.getElementById("submitButton");
    // const form = document.getElementById("form")
    const usernameTextBox = document.getElementById("username");
    const avatar = document.getElementById("avatar");
    const nameLabel = document.getElementById("name");
    const blogLabel = document.getElementById("blog");
    const favLanLebel = document.getElementById("favLan");
    const locationLabel = document.getElementById("location");
    const bio = document.getElementById("bio");
    const infoContainer = document.getElementById("infoContainer");
    const errorContainer = document.getElementById("errorContainer");
    const errorPara = document.getElementById("errorMsg");

    window.onload = () => {
        submitButton.addEventListener('click', async () => {
            const username = usernameTextBox.value;
            await getInfo(username);
        });
    }


    const getInfo = async (username) => {
        const url = `https://api.github.com/users/${username}`;
        // console.log(`url: ${url}`);
        try {
            const cached = window.localStorage.getItem(username);
            if (cached === null) {
                await fetch(url).then(async (response) => {
                    // console.log(response.status)
                    if (response.status >= 400) {
                        const data = await response.json();
                        showError(data["message"]);
                    } else if (response.status === 200) {
                        const rawData = await response.json();
                        const favLan = await getFavoriteLanguage(rawData["repos_url"]);
                        console.log(favLan)
                        const info = {
                            avatar: rawData["avatar_url"],
                            name: rawData["name"],
                            blog: rawData["blog"],
                            location: rawData["location"],
                            bio: rawData["bio"],
                            favLan: favLan
                        }
                        // window.localStorage.setItem(data["login"], JSON.stringify(info));
                        console.log(info)
                        showInfo(info);
                    }
                });
            } else {
                showInfo(JSON.parse(cached))
            }

        } catch (e) {
            showError('An Connection Error Happened')
        }
    }

    const getFavoriteLanguage = async (reposLink) => {
        try {
            return await fetch(reposLink).then(async (response) => {
                if (response.status >= 400)
                    return " - ";
                else if (response.status === 200) {
                    const repos = await response.json();
                    if (repos.length === 0)
                        return " - "
                    const compareRepos = (a, b) => {
                        if (Date.parse(a["pushed_at"]) < Date.parse(b["pushed_at"]))
                            return 1;
                        else if (Date.parse(a["pushed_at"]) > Date.parse(b["pushed_at"]))
                            return -1;
                        return 0;
                    }
                    repos.sort(compareRepos)
                    const languages = {}
                    let cnt = 0;
                    let i = 0;
                    while (cnt <= 5) {
                        const lan = repos[i].language;
                        if (lan !== null) {
                            if (lan in languages) {
                                languages[lan]++;
                            } else {
                                languages[lan] = 1;
                            }
                            // console.log(lan);
                            cnt++;
                        }
                        i++;
                        if (i >= repos.length)
                            break
                    }
                    console.log(languages)
                    const favLan = Object.keys(languages).reduce((a, b) => languages[a] > languages[b] ? a : b);
                    console.log(`favLan: ${favLan}`)
                    return favLan;
                }
            });
        } catch (e) {
            showError("An Connection Error Happened'")
        }

    }

    const showInfo = (data) => {
        infoContainer.classList.remove("disabled");
        if (!errorContainer.classList.contains("disabled"))
            errorContainer.classList.add("disabled");
        nameLabel.innerHTML = data["name"];
        blogLabel.innerHTML = data["blog"];
        blogLabel.href = data["blog"];
        locationLabel.innerHTML = data["location"];
        avatar.src = data["avatar"];
        favLanLebel.innerHTML = data["favLan"];
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

    const showError = (msg) => {
        errorContainer.classList.remove("disabled");
        if (!infoContainer.classList.contains("disabled"))
            infoContainer.classList.add("disabled");
        errorPara.innerHTML = msg;
    }
})()