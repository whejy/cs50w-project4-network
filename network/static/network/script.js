document.addEventListener('DOMContentLoaded', function() {


    // Display posts page on login
    // window.onload=function(){
    //     document.getElementById('posts').click();
    //   };    

    // Select all buttons
    document.querySelectorAll('.nav-link').forEach(button => {

        // When a button is clicked, switch to that page
        button.onclick = function() {
            loadPage(this.dataset.page);
        }
    })

    
    // User clicks like button
    var likeButton = document.querySelectorAll('.like');
    if (likeButton) {
        likeButton.forEach(a => {
            a.onclick = function() {
                like(this.dataset.id, this.dataset.action);
            }
        })
    }    
    

    // Submit new post data
    var loggedIn = document.querySelector('#create-post');

    if (loggedIn) {
        loggedIn.addEventListener('click', () => {
            var postData = document.querySelector('textarea').value;

            if (postData != '') {
                fetch('/post', {
                    method: 'POST',
                    body: JSON.stringify({
                      post: postData,
                    })
                  })
                  .then(response => response.json())
                  .then(result => {
                    console.log(result);
                    window.location.href = "";
                  });

                  // Render first page of pagination
                  document.getElementById('page').click();
            }
            
            else {
                console.log("NO CONTENT");
            }
        });
    }


});


// User likes/ unlikes a post
function like(post, action) {
    fetch('like', {
        method: "POST",
        body: JSON.stringify({
            post: post,
            action: action
        })
    })
    .then(response => response.json())
    .then(result => {
        console.log(result);
        var likeCount = document.body.querySelector(`.like-count[id="${result.post}"]`);
        var likeButton = document.body.querySelector(`.like[data-id="${result.post}"]`)
        // If user clicked a 'like' button, change it to an 'unlike'
        if (result.action == "like") {
            likeButton.innerHTML = "Unlike";
            likeButton.setAttribute("data-action", "unlike");
        } else {
            likeButton.innerHTML = "Like";
            likeButton.setAttribute("data-action", "like");            
        }
        // Update like count
        likeCount.innerHTML = result.count;
    })
}


function loadPage(page) {
    
    // Hide all pages
    document.querySelectorAll('.page').forEach(div => {
        div.style.display = 'none';
    });

    // Display requested page
    if (page) {
        document.querySelector(`#${page}`).style.display = 'block';

        // Clear out composition field
        var newPost = document.querySelector('textarea');
        if (newPost) {
            newPost.value = '';
        }
    }

    // Display nested divs
    if (page == 'posts-page') {
        var posts = document.querySelector(`#${page}`).children
        var postsArray = Array.from(posts);
        postsArray.forEach(div => {
            div.style.display = 'block';
        })
        
        // Render first page of pagination
        document.getElementById('page').click();
    };

}