import { getCurrentTab } from "./utils.js"

//adds a new bookmark row to the popup
const addNewBookmark = (bookmarkElement, bookmark) => {
    const bookmarkTitleElement = document.createElement("div")
    const newBookmarkElement = document.createElement("div")

    bookmarkTitleElement.textContent = bookmark.description
    bookmarkTitleElement.className = "bookmark_title"

    newBookmarkElement.id = "bookmark_" + bookmark.time 
    newBookmarkElement.className = "bookmark"
    newBookmarkElement.setAttribute("timestamp", bookmark.time)

    newBookmarkElement.appendChild(bookmarkTitleElement)
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
        container.innerHTML = `<div class="title">This is not a YT video page!</div>`
    }

    }
)