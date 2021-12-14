document.addEventListener('DOMContentLoaded', function() {


    // Display posts page on login
    window.onload=function(){
        document.getElementById('posts').click();
      };    


    // Select all buttons
    document.querySelectorAll('.nav-link').forEach(button => {

        // When a button is clicked, switch to that page
        button.onclick = function() {
            loadPage(this.dataset.page);
        }
    })

    
    // Like button behaviour and submitting post-id for db update
    var likeButton = document.querySelectorAll('.like');
    if (likeButton) {
        likeButton.forEach(a => {
            a.onclick = function() {
                // fetch('/like')
                // .then(response => response.JSON())
                // if (a.innerHTML = "Like") {
                //     this.innerHTML = "Unlike";
                // } else {
                //     this.innerHTML = "Like"
                // }

                like(this.dataset.id);
                console.log(this.dataset.id);
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
                    //loadPage('posts-page');
                    window.location.href = "";
                  }); 
            }
            
            else {
                console.log("NO CONTENT");
            }
        });
    }


});


// user likes a post
function like(post) {
    fetch(`like/${post}`, {
        method: "POST",
        body: JSON.stringify({
            post: post
        })
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
    };

    //likes();

}