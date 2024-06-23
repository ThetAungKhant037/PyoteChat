const BASE_URL = 'https://your-app-name.onrender.com'; // Replace with your Render app URL

document.getElementById('postForm').addEventListener('submit', function(event) {
    event.preventDefault();

    const title = document.getElementById('title').value;
    const content = document.getElementById('content').value;
    const image = document.getElementById('image').files[0];

    const formData = new FormData();
    formData.append('title', title);
    formData.append('content', content);
    formData.append('image', image);

    fetch(`${BASE_URL}/api/posts`, {
        method: 'POST',
        body: formData
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Failed to create post');
        }
        return response.json();
    })
    .then(data => {
        alert(data.message);
        loadPosts();
    })
    .catch(error => {
        console.error('Error creating post:', error);
        alert('Failed to create post. Please try again.');
    });
});

function loadPosts() {
    fetch(`${BASE_URL}/api/posts`)
    .then(response => {
        if (!response.ok) {
            throw new Error('Failed to fetch posts');
        }
        return response.json();
    })
    .then(posts => {
        const postsContainer = document.getElementById('posts');
        postsContainer.innerHTML = '';
        posts.forEach(post => {
            const postElement = document.createElement('div');
            postElement.classList.add('post');
            postElement.innerHTML = `
                <h3>${post.title}</h3>
                <img src="${BASE_URL}/${post.image_path}" alt="${post.title}">
                <p>${post.content}</p>
            `;
            postsContainer.appendChild(postElement);
        });
    })
    .catch(error => {
        console.error('Error fetching posts:', error);
        alert('Failed to fetch posts. Please try again.');
    });
}

window.onload = loadPosts;
