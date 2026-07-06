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

    const postChildContent = document.createElement("div");
    postChildContent.classList.add("post-content");
    postChild.appendChild(postChildContent);

    postChildContent.innerHTML = `
    <p class="post-date">${formatEtDateTime(post.publishDate)}</p>
    <div class="post-media"></div>
    <div class="post-text">${post.body ?? ""}</div>
    <div class="actions">
        <button class="like-button"><i class="ph ph-heart ${likedPosts.includes(post._id) ? "ph-fill" : ""}"></i>
         <span class="like-count">${post.likes}</span> Double-Taps</button>
    </div>`;

    const likeButton = postChildContent.querySelector(".like-button");
    const likeCount = postChildContent.querySelector(".like-count");
    const heartIcon = postChildContent.querySelector(".ph-heart");
    likeButton.addEventListener("click", () => {
        likeTogglePost(post._id, likeCount, heartIcon);
    });
    const postChildMedia = postChildContent.querySelector(".post-media");
    const postChildText = postChildContent.querySelector(".post-text");

    //Double tap function
    postChild.lastTapTime = 0;
    postChild.pressY = 0;
    postChild.deltaY = 0;
    postChild.doubleTapped = false;
    postChild.singleTapped = false;

    const touchStart = (event) => {
        postChild.doubleTapped = false;
        const currentTime = new Date().getTime();
        const tapLength = currentTime - postChild.lastTapTime;
        if (tapLength < doubleTapDelay && tapLength > 0) {
            // --- DOUBLE TAP DETECTED ---
            postChild.doubleTapped = true;
            likeTogglePost(post._id, likeCount, heartIcon);
            likeButton.classList.add("like-active");
            setTimeout(() => {
                likeButton.classList.remove("like-active");
            }, 500);
            event.preventDefault(); // Prevents zoom/ghost clicks
        }
        postChild.singleTapped = false;
        postChild.lastTapTime = currentTime;
        const touch = event.touches[0];
        // console.log(`Tapping at X: ${touch.clientX}, Y: ${touch.clientY}`);
        postChild.pressY = touch.clientY;
        postChild.deltaY = 0;
    };

    const touchEnd = (event) => {
        const currentTime = new Date().getTime();
        const tapLength = currentTime - postChild.lastTapTime;
        if (!isProduction) console.log("scroll delta: ", postChild.deltaY, " tap length: ", tapLength, " double tapped: ", postChild.doubleTapped);
        if (!postChild.doubleTapped) {
            postChild.singleTapped = true;
            if (tapLength > singleTapDelay && postChild.deltaY < 10) {
                document.body.classList.toggle("max");
            }
            event.preventDefault();
        }
    };

    const touchMove = (event) => {
        const touch = event.touches[0];
        // console.log(`Moving at X: ${touch.clientX}, Y: ${touch.clientY}`);
        const delta = Math.abs(touch.clientY - postChild.pressY);
        if (delta > postChild.deltaY) {
            // console.log(delta)
            postChild.deltaY = delta;
        }
    };

    // postChildMedia.addEventListener('touchmove', touchMove);
    // postChildText.addEventListener('touchmove', touchMove);
    // postChildMedia.addEventListener('touchstart', touchStart);
    // postChildText.addEventListener('touchstart', touchStart);
    // postChildMedia.addEventListener('touchend', touchEnd);
    // postChildText.addEventListener('touchend', touchEnd);

    postChildContent.addEventListener('touchmove', touchMove);
    postChildContent.addEventListener('touchstart', touchStart);
    postChildContent.addEventListener('touchend', touchEnd);
    //------------------------------------

    parentElement.appendChild(postChild);
    //Important for unloading content not in viewport
    const postObserver = new IntersectionObserver(async ([entry]) => {
        let preserveAspectRatio = false;
        if (entry.isIntersecting) {
            if (post.fileKey) {
                const fileURL = `/storage/${post.fileKey}`;
                const mimeType = await getMimeType(fileURL);
                if (mimeType.startsWith("image/")) {
                    if (post.preserveAspectRatio == null) preserveAspectRatio = true;
                    else preserveAspectRatio = post.preserveAspectRatio;
                    postChildMedia.innerHTML = `<image src="${fileURL}" alt="Post Media" />`;
                } else {
                    if (post.preserveAspectRatio == null) preserveAspectRatio = false;
                    else preserveAspectRatio = post.preserveAspectRatio;
                    postChildMedia.innerHTML = `
                    <div class="video-container">
                        <video loop autoplay muted playsinline>
                            <source src="${fileURL}" type="video/mp4">Your browser does not support the video tag.
                        </video>
                        <button class="fullscreen-btn"><i class="ph ph-corners-out"></i></button>
                    </div>`;
                    const video = postChildMedia.querySelector('video');
                    video.play().catch(error => {
                        console.log("Autoplay was prevented by the browser. Adding a play button.");
                        // Add logic here to show a "Play" button overlay to the user
                    });
                }
            }
        } else {
            postChildMedia.innerHTML = "";
        }
        //Media fill == preserve aspect ratio is false
        if (preserveAspectRatio) postChildMedia.classList.remove("media-fill");
        else postChildMedia.classList.add("media-fill");
    }, { threshold: 0 });
    postObserver.observe(postChild);
}

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