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

function createPost(parentElement, post, index) {
    const postChild = document.createElement("div");
    postChild.classList.add("post");
    postChild.id = "post_" + index;

    const postChildContent = document.createElement("div");
    postChildContent.classList.add("post-content");
    postChild.appendChild(postChildContent);

    parentElement.appendChild(postChild);
    //Important for unloading content not in viewport
    const postObserver = new IntersectionObserver(([entry]) => {
        if (entry.isIntersecting) {
            postChildContent.innerHTML = `
                        <div class="post-text">${post.body ? post.body : ""}</div>
                        <img src="" />
                        <div class="actions">
                            <button><i class="ph ph-heart"></i> Like</button>
                        </div>
                    `;
        } else {
            postChildContent.innerHTML = "";
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

