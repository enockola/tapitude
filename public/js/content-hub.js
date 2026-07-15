/*CONSTANTS: 
    const currentPath = "<%= currentPath %>";
    const creatorSlug = "<%= creatorProfile.creatorSlug %>";
    const creatorId = "<%= creatorProfile.userId %>";
    const brandColor = "<%= creatorProfile.brandColor %>";
    const isProduction = "<%= isProduction %>";
*/

// SESSION STORAGE
// Session storage to identify a user that doesnt have an account
let userId = localStorage.getItem("userId");
if (!userId) {
    userId = randomUUID();
    localStorage.setItem("userId", userId);
}

let likedPosts = [];
if (localStorage.getItem("likedPosts")) likedPosts = JSON.parse(localStorage.getItem("likedPosts"));
if (!isProduction) console.log("Liked posts: ", likedPosts.length);

// SOCKET
// Connect to your Express server (ensure the URL matches your server address)
const socket = io(`${window.location.protocol}//${window.location.host}/content-hub`);

function randomUUID() {
    if (crypto?.randomUUID) {
        return crypto.randomUUID();
    }
    // Fallback for non-secure contexts / older browsers
    return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, c =>
        (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
    );
}

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

// Listen for the connection confirmation
if (!isProduction) {
    socket.on("connect", () => {
        console.log("Connected to server with ID:", socket.id);
    });
}

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


const doubleTapDelay = 250;
const singleTapDelay = 180;

function createPost(parentElement, post) {
    const postChild = document.createElement("div");
    postChild.classList.add("post");
    // Store necessary IDs and state on the element's dataset
    postChild.dataset.postId = post._id;
    postChild.dataset.fileKey = post.fileKey || "";
    postChild.dataset.preserveAspectRatio = post.preserveAspectRatio ?? (post.fileKey ? "default" : "");

    // Keep track of touch gestures directly on the DOM node's properties
    postChild.lastTapTime = 0;
    postChild.pressY = 0;
    postChild.deltaY = 0;

    postChild.innerHTML = `
    <div class="post-content">
        <p class="post-date">${formatEtDateTime(post.publishDate)}</p>
        <div class="post-media"></div>
        <div class="post-text">${post.body ?? ""}</div>
        <div class="actions">
            <button class="like-button" data-action="like">
                <i class="ph ph-heart ${likedPosts.includes(post._id) ? "ph-fill" : ""}"></i>
                <span class="like-count">${post.likes}</span> Double-Taps
            </button>
        </div>
    </div>`;

    parentElement.appendChild(postChild);
    
    // Register this post to our single global observer
    globalPostObserver.observe(postChild);
}


const globalPostObserver = new IntersectionObserver(async (entries) => {
    for (const entry of entries) {
        const postElement = entry.target;
        const mediaContainer = postElement.querySelector(".post-media");
        const fileKey = postElement.dataset.fileKey;

        if (entry.isIntersecting) {
            if (!fileKey) continue;
            
            const fileURL = `/storage/${fileKey}`;
            try {
                const mimeType = await getMimeType(fileURL);
                let preserveAspectRatio = postElement.dataset.preserveAspectRatio;

                if (mimeType.startsWith("image/")) {
                    if (preserveAspectRatio === "default") preserveAspectRatio = "true";
                    mediaContainer.innerHTML = `<img src="${fileURL}" alt="Post Media" />`;
                    
                } else if (mimeType.startsWith("video/")) {
                    if (preserveAspectRatio === "default") preserveAspectRatio = "false";
                    mediaContainer.innerHTML = `
                    <div class="video-container">
                        <button class="fullscreen-btn" data-action="fullscreen"><i class="ph ph-corners-out"></i></button>
                        <video loop autoplay muted playsinline>
                            <source src="${fileURL}" type="video/mp4">
                        </video>
                    </div>`;
                    
                    const video = mediaContainer.querySelector('video');
                    video.play().catch(() => {
                        console.log("Autoplay blocked. User gesture required.");
                    });
                } else {
                    mediaContainer.innerHTML = `<div class='unsupported-media'>Unsupported media</div>`;
                }

                // Handle aspect ratio class toggle
                if (preserveAspectRatio === "true") {
                    mediaContainer.classList.remove("media-fill");
                } else {
                    mediaContainer.classList.add("media-fill");
                }
            } catch (err) {
                console.error("Error loading media:", err);
            }
        } else {
            // Unload media when it leaves the viewport to save RAM and CPU
            mediaContainer.innerHTML = "";
        }
    }
}, { threshold: 0 });
// --- GLOBAL DELEGATED CLICKS ---
document.body.addEventListener("click", (event) => {
    const target = event.target;
    // Check if the click happened inside a post
    const postElement = target.closest(".post");
    if (!postElement) return; // Ignore clicks on non-post elements

    const postId = postElement.dataset.postId;
    const likeButton = postElement.querySelector(".like-button");
    const likeCount = postElement.querySelector(".like-count");
    const heartIcon = postElement.querySelector(".ph-heart");

    // 1. Handle Like Button click
    if (target.closest('[data-action="like"]')) {
        likeTogglePost(postId, likeCount, heartIcon);
        return;
    }

    // 2. Handle Fullscreen Button click
    if (target.closest('[data-action="fullscreen"]')) {
        const video = postElement.querySelector("video");
        if (video) {
            if (!document.fullscreenElement) {
                video.requestFullscreen().catch(err => console.error(err));
            } else {
                document.exitFullscreen();
            }
        }
    }
});

// --- GLOBAL DELEGATED TOUCH GESTURES ---
document.body.addEventListener("touchstart", (event) => {
    const postElement = event.target.closest(".post");
    if (!postElement) return;

    postElement.doubleTapped = false;
    const currentTime = Date.now();
    const tapLength = currentTime - postElement.lastTapTime;

    if (tapLength < doubleTapDelay && tapLength > 0) {
        // --- DOUBLE TAP DETECTED ---
        postElement.doubleTapped = true;
        const postId = postElement.dataset.postId;
        const likeButton = postElement.querySelector(".like-button");
        const likeCount = postElement.querySelector(".like-count");
        const heartIcon = postElement.querySelector(".ph-heart");

        likeTogglePost(postId, likeCount, heartIcon);
        likeButton.classList.add("like-active");
        setTimeout(() => likeButton.classList.remove("like-active"), 500);
        
        event.preventDefault(); // Prevents zoom/ghost clicks on mobile
    }

    postElement.lastTapTime = currentTime;
    const touch = event.touches[0];
    postElement.pressY = touch.clientY;
    postElement.deltaY = 0;
}, { passive: false });

document.body.addEventListener("touchmove", (event) => {
    const postElement = event.target.closest(".post");
    if (!postElement) return;

    const touch = event.touches[0];
    const delta = Math.abs(touch.clientY - postElement.pressY);
    if (delta > postElement.deltaY) {
        postElement.deltaY = delta;
    }
});

document.body.addEventListener("touchend", (event) => {
    const postElement = event.target.closest(".post");
    if (!postElement) return;

    const currentTime = Date.now();
    const tapLength = currentTime - postElement.lastTapTime;

    if (!postElement.doubleTapped) {
        if (tapLength > singleTapDelay && postElement.deltaY < 10) {
            document.body.classList.toggle("max");
            event.preventDefault();
        }
    }
});

// document.addEventListener('fullscreenchange', () => {
//     const activeFsElement = document.fullscreenElement;
    
//     // If the element in fullscreen is a video, turn on controls
//     if (activeFsElement && activeFsElement.tagName === "VIDEO") {
//         activeFsElement.controls = true;
//     }
    
//     // When exiting fullscreen, turn off controls on all videos in the DOM
//     if (!activeFsElement) {
//         document.querySelectorAll('.post-media video').forEach(video => {
//             video.controls = false;
//         });
//     }
// });



























































const feed = document.getElementById("feed");
const target = document.querySelector('#loadMore');

socket.on("requestContent", (contentPage) => {
    if (!isProduction) console.log("Received content:", contentPage);
    if (contentPage) {
        createPost(feed, contentPage);
    }
});

const observer = new IntersectionObserver(
    ([entry]) => {
        if (!isProduction) console.log('Element is in viewport: ' + entry.isIntersecting);
        if (entry.isIntersecting) {
            requestNextPost();
        }
    },
    {
        threshold: 0
    }
);

observer.observe(target);


function getBrightness(color) {
    const el = document.createElement('div');
    el.style.color = color;
    document.body.appendChild(el);

    const rgb = getComputedStyle(el).color;
    document.body.removeChild(el);

    const [r, g, b] = rgb.match(/\d+/g).map(Number);

    return (r * 299 + g * 587 + b * 114) / 1000;
}


function tintColor(color, amount = 0.92) {
    const div = document.createElement("div");
    div.style.color = color;
    document.body.appendChild(div);

    const rgb = getComputedStyle(div).color;
    document.body.removeChild(div);

    const [r, g, b] = rgb.match(/\d+/g).map(Number);

    const mix = c => Math.round(c + (255 - c) * amount);

    return `rgb(${mix(r)}, ${mix(g)}, ${mix(b)})`;
}

if (getBrightness(brandColor) < 128) {
    document.documentElement.style.setProperty(
        '--color-heading',
        'white'
    );
    document.documentElement.style.setProperty(
        '--color-brand-background',
        tintColor(brandColor)
    );
}