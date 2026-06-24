//Session storage to identify a user that doesnt have an account
let sessionId = sessionStorage.getItem("sessionId");

if (!sessionId) {
    sessionId = crypto.randomUUID();
    sessionStorage.setItem("sessionId", sessionId);
}


// Connect to your Express server (ensure the URL matches your server address)
const socket = io("http://localhost:3000/content-hub");
/* CONSTANTS: 
creatorSlug
 */

// Listen for the connection confirmation
socket.on("connect", () => {
    console.log("Connected to server with ID:", socket.id);
});

//Request initial content
let history = 0;
requestNextPost();

function requestNextPost() {
    const req = {
        creatorId,
        history: history
    };
    console.log(req);
    socket.emit("requestContent", req);
    history += 1;
}

async function getMimeType(url) {
    const response = await fetch(url, {
        method: "HEAD"
    });
    return response.headers.get("content-type");
}

function createPost(parentElement, post, index) {
    const postChild = document.createElement("div");
    postChild.classList.add("post");
    postChild.id = "post_" + index;

    const postChildContent = document.createElement("div");
    postChildContent.classList.add("post-content");
    postChild.appendChild(postChildContent);

    postChildContent.innerHTML = `
    <p class="post-date">${post.publishedAt}</p>
    <div class="post-media"></div>
    <div class="post-text">${post.body ?? ""}</div>
    <div class="actions">
        <button class="like-button"><i class="ph ph-heart"></i> 0 Likes</button>
    </div>
`;

    const likeButton = postChildContent.querySelector(".like-button");
    likeButton.addEventListener("click", () => {
        console.log("Like button clicked, ", post._id, sessionId);
    });

    parentElement.appendChild(postChild);
    //Important for unloading content not in viewport
    const postObserver = new IntersectionObserver(async ([entry]) => {
        const postChildMedia = postChildContent.querySelector(".post-media");
        if (entry.isIntersecting) {
            if (post.fileKey) {
                const fileURL = `/storage/${post.fileKey}`;
                const mimeType = await getMimeType(fileURL);
                if (mimeType.startsWith("image/")) {
                    postChildMedia.innerHTML = `<image src="${fileURL}" alt="Post Media" />`;
                } else {
                    postChildMedia.innerHTML = `<video src="${fileURL}" alt="Post Media" autoplay controls />`;
                }
            }
        } else {
            postChildMedia.innerHTML = "";
        }
    }, { threshold: 0 });
    postObserver.observe(postChild);
}

const feed = document.getElementById("feed");
const target = document.querySelector('#loadMore');

socket.on("requestContent", (contentPages) => {
    console.log("Received content:", contentPages);
    if (contentPages.length === 0) {
        target.style.display = "none";
    }
    contentPages.forEach((post, index) => {
        createPost(feed, post, index);
    })
});

const observer = new IntersectionObserver(
    ([entry]) => {
        console.log('Element is in viewport: ' + entry.isIntersecting);
        if (entry.isIntersecting) {
            requestNextPost();
        }
    },
    {
        threshold: 0
    }
);

observer.observe(target);

