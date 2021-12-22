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
    

    // User clicks follow button
    var followButton = document.querySelectorAll('.follow');
    if (followButton) {
        followButton.forEach(a => {
            a.onclick = function() {
                follow(this.dataset.id, this.dataset.action);
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


// User follows/ unfollows another user
function follow(author, action) {
    fetch('follow', {
        method: "POST",
        body: JSON.stringify({
            author: author,
            action: action
        })
    })
    .then(response => response.json())
    .then(result => {
        var followButton = document.querySelectorAll(`.follow[data-id="${result.author}"]`)
        // If user clicks a 'follow' button, change it to 'unfollow'
        if (result.action == "follow") {
            followButton.forEach(button => {
                button.innerHTML = "Unfollow";
                button.setAttribute("data-action", "unfollow")
            });
        } else {
            followButton.forEach(button => {
                button.innerHTML = "Follow";
                button.setAttribute("data-action", "follow")
            });          
        }
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