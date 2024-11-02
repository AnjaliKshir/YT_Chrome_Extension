(() => {
    let ytRightControls, ytPlayer
    let currentVideo = ""
    let currentVideoBookmarks = []  //used to store bookmarks for the current video.


    chrome.runtime.onMessage.addListener((obj, sender, response) => {
        const {type, videoId, value} = obj
        console.log("Received message: ", obj)
        
        if(type === "NEW")
        {
            currentVideo = videoId
            newVideoLoaded()
            response({ status: "received" })
        }
        else if(type === "PLAY")
        { 
            ytPlayer.currentTime = value
            response({ status: "received" })
        }
        else if(type === "DELETE")
        {
            currentVideoBookmarks = currentVideoBookmarks.filter((b) => b.time != value)
            chrome.storage.sync.set({ [currentVideo]: JSON.stringify(currentVideoBookmarks)})

            response(currentVideoBookmarks)
            // response({ status: "received" })

        }
        else
        {
            response({ status: "not received" })
        }
    })

    const fetchBookmarks = () => {
        return new Promise((resolve) => {
            chrome.storage.sync.get([currentVideo], (obj) => {
                resolve(obj[currentVideo] ? JSON.parse(obj[currentVideo]) : [])
            })
        })
    }


    getTime = (time) => {
        var date = new Date(0)
        date.setSeconds(time)
    
        return date.toISOString().substring(11, 19)
    }

    const addNewBookmarkEventHandler = async() => {
        const currentTime = ytPlayer.currentTime
        console.log(currentTime)
        const newBookmark = {
            time: currentTime,
            description : "Bookmark at: " + getTime(currentTime)
        }

        currentVideoBookmarks = await fetchBookmarks()

        chrome.storage.sync.set({
            [currentVideo] : JSON.stringify([...currentVideoBookmarks, newBookmark].sort((a,b) => a.time - b.time)) //This allows the bookmarks to be stored under a unique key for each video.
        })
        //This method is used to store data in the Chrome extension's sync storage area. The sync storage allows the data to be synchronized across all devices where the user is logged into Chrome.
        //The set method takes an object as its argument, where the keys are the names of the items to store, and the values are the corresponding data.

    }


    const newVideoLoaded = async() =>{
        console.log("inside content.js")
        const bookmarkBtnExists = document.getElementsByClassName("bookmark-btn")[0]
        currentVideoBookmarks = await fetchBookmarks()
        const bookmarkBtn = document.createElement("img")

        if(!bookmarkBtnExists)
        {
            chrome.runtime.sendMessage({ type: "GET_BOOKMARK_URL" }, (response) => {
                if (response && response.bookmarkUrl) {
                    bookmarkBtn.src = response.bookmarkUrl
                }
            });
            bookmarkBtn.className = "ytp-button " + "bookmark-btn"
            bookmarkBtn.title = "Click to bookmark the current timestamp"

            // Set the desired width and height
            bookmarkBtn.style.width = "38px";  // Adjust width as needed
            bookmarkBtn.style.height = "38px"; // Adjust height as needed
            bookmarkBtn.style.objectFit = "cover";  // Ensures the image maintains its aspect ratio

            ytRightControls = document.getElementsByClassName("ytp-right-controls")[0]
            ytPlayer = document.getElementsByClassName("video-stream")[0]

            ytRightControls.appendChild(bookmarkBtn)
            console.log("Bookmark button appended ")
            bookmarkBtn.addEventListener("click", addNewBookmarkEventHandler)
        }
    }

    newVideoLoaded()
})()







