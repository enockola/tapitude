//Session storage to identify a user that doesnt have an account
let userId = localStorage.getItem("userId");
if (!userId) {
    userId = crypto.randomUUID();
    localStorage.setItem("userId", userId);
}

//Store the posts that have been liked by the user
let likedPosts = [];
if (localStorage.getItem("likedPosts")) likedPosts = JSON.parse(localStorage.getItem("likedPosts"));
console.log("Liked posts: ", likedPosts.length);



function likeTogglePost(postId, postElement, heartIcon) {
    if (likedPosts.includes(postId)) {
        //remove it
        likedPosts = likedPosts.filter((id) => id !== postId);
        // console.log("Like button clicked, ", post._id);
        socket.emit("likePost", { postId, userId, liked: false });
        postElement.innerText = parseInt(postElement.innerText) - 1;
        heartIcon.classList.remove("ph-fill");
    } else {
        // Add the post ID to the likedPosts array
        likedPosts = [...likedPosts, postId];
        // console.log("Like button unclicked, ", post._id);
        socket.emit("likePost", { postId, userId, liked: true });
        postElement.innerText = parseInt(postElement.innerText) + 1;
        heartIcon.classList.add("ph-fill");
    }
    localStorage.setItem(
        "likedPosts",
        JSON.stringify(likedPosts)
    );
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
        history: history,
        userId: userId
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

function createPost(parentElement, post) {
    const postChild = document.createElement("div");
    postChild.classList.add("post");

    const postChildContent = document.createElement("div");
    postChildContent.classList.add("post-content");
    postChild.appendChild(postChildContent);

    postChildContent.innerHTML = `
    <p class="post-date">${post.publishedAt}</p>
    <div class="post-media"></div>
    <div class="post-text">${post.body ?? ""}</div>
    <div class="actions">
        <button class="like-button"><i class="ph ph-heart ${likedPosts.includes(post._id) ? "ph-fill" : ""}"></i>
         <span class="like-count">${post.likes}</span> Likes</button>
    </div>
`;

    const likeButton = postChildContent.querySelector(".like-button");
    const likeCount = postChildContent.querySelector(".like-count");
    const heartIcon = postChildContent.querySelector(".ph-heart");
    likeButton.addEventListener("click", () => {
        likeTogglePost(post._id, likeCount, heartIcon);
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

socket.on("requestContent", (contentPage) => {
    console.log("Received content:", contentPage);
    if (contentPage) {
        createPost(feed, contentPage);
    } else { //If there is no more content
        target.style.display = "none";
    }
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

