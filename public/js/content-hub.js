// Connect to your Express server (ensure the URL matches your server address)
const socket = io("http://localhost:3000/content-hub");

/* CONSTANTS: 
creatorSlug
 */

// Listen for the connection confirmation
socket.on("connect", () => {
    console.log("Connected to server with ID:", socket.id);
});

const req = {
    creatorId,
    history: 0
};
console.log(req);
socket.emit("requestContent", req);


function createPost(parentElement, post, index) {
    const postChild = document.createElement("div");
    postChild.classList.add("post");
    postChild.id = "post_" + index;

    postChild.innerHTML = `
        <div class="post-text">${post.body?post.body:""}</div>
        <img src="" />
        <div class="actions">
            <button><i class="ph ph-heart"></i> Like</button>
        </div>
    `;
    parentElement.appendChild(postChild);
}

const feed = document.getElementById("feed");

socket.on("requestContent", (contentPages) => {
    console.log("Received content:", contentPages);
    contentPages.forEach((post, index) => {
        createPost(feed, post, index);
    })
});

