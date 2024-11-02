import { getCurrentTab } from "./utils.js"

//adds a new bookmark row to the popup
const addNewBookmark = (bookmarkElement, bookmark) => {
    const bookmarkTitleElement = document.createElement("div")
    const newBookmarkElement = document.createElement("div")
    const controlsElement = document.createElement("div") 

    controlsElement.className = "bookmark_controls" 

    bookmarkTitleElement.textContent = bookmark.description
    bookmarkTitleElement.className = "bookmark_title"

    newBookmarkElement.id = "bookmark_" + bookmark.time 
    newBookmarkElement.className = "bookmark"
    newBookmarkElement.setAttribute("timestamp", bookmark.time)

    setBookmarkAttribute("play", onPlay, controlsElement)
    setBookmarkAttribute("delete", onDelete, controlsElement)


    newBookmarkElement.appendChild(bookmarkTitleElement)
    newBookmarkElement.appendChild(controlsElement)
    bookmarkElement.appendChild(newBookmarkElement)


}

const viewBookmarks = (currentBookmark = []) =>{
    const bookmarkElement = document.getElementById("bookmarks")
    bookmarkElement.innerHTML = ""

    if(currentBookmark.length > 0)
    {
        currentBookmark.forEach(bookmark => {
            addNewBookmark(bookmarkElement, bookmark); 
        })
    }
    else
    {
        console.log("inside else")
        bookmarkElement.innerHTML = `<i class="row">No Bookmarks to show ¯\\_(ツ)_/¯</i>`     
    }
}

const onPlay = async (e) => {
    const bookmarkTime = e.target.parentNode.parentNode.getAttribute("timestamp")
    const activeTab = await getCurrentTab()

    chrome.tabs.sendMessage(activeTab.id, {
        type: "PLAY",
        value: bookmarkTime,

    })
}

const onDelete = async (e) => {
    const activeTab = await getCurrentTab()
    const bookmarkTime = e.target.parentNode.parentNode.getAttribute("timestamp")
    const bookmarkElementToDelete = document.getElementById("bookmark_" + bookmarkTime)

    bookmarkElementToDelete.parentNode.removeChild(bookmarkElementToDelete)

    chrome.tabs.sendMessage(activeTab.id, {
        type: "DELETE",
        value: bookmarkTime,
    }, viewBookmarks)
}


const setBookmarkAttribute = (src, eventListener, controlParentElement) => {
    const controlElement = document.createElement("img")
    controlElement.src = "assets/" + src + ".png"
    controlElement.title = src 
    controlElement.addEventListener("click", eventListener) 
    controlParentElement.appendChild(controlElement) 
} 


document.addEventListener("DOMContentLoaded", async() => {
    console.log("Popup.js loaded")
    const activeTab = await getCurrentTab()
    const queryParams = activeTab.url.split("?")[1]
    const urlParams = new URLSearchParams(queryParams)
    const currentVideo = urlParams.get("v")

    if (activeTab.url && activeTab.url.includes("youtube.com/watch"))
    {
        chrome.storage.sync.get([currentVideo], (data) => {
            const currentVideoBookmarks = data[currentVideo] ? JSON.parse(data[currentVideo]) : []
            // console.log("Calling viewBookmarks with: ", currentVideoBookmarks)
            viewBookmarks(currentVideoBookmarks)
        })

            
    }
    else 
    {
        const container = document.getElementsByClassName("container")[0]
        container.innerHTML = `<div class="title">Oopsie! Not a YT video page🐝</div>`
    }

    }
)
