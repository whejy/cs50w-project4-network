document.addEventListener('DOMContentLoaded', function() {


    // Display posts page on login
    // window.onload=function(){
    //     document.getElementById('posts').click();
    //   };    

    // Select all buttons
    // document.querySelectorAll('.nav-link').forEach(button => {

    //     // When a button is clicked, switch to that page
    //     button.onclick = function() {
    //         loadPage(this.dataset.page);
    //     }
    // })

    // User clicks a user's name, load that user's profile
    // document.querySelectorAll('.profile').forEach(button => {

    //     button.onclick = function() {
    //         loadProfile(this.dataset.profile)
    //     }

    // })

    
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
                follow(this.dataset.id, this.dataset.action, this.dataset.count);
            }
        })
    }


    // User clicks delete button
    var deleteButton = document.querySelectorAll('.delete');
    if (deleteButton) {
        deleteButton.forEach(a => {
            a.onclick = function() {
                remove(this.dataset.id, this);
            }
        })
    }


    // User clicks edit button
    var editButton = document.querySelectorAll('.edit');
    if (editButton) {
        editButton.forEach(a => {
            a.onclick = function() {
                edit(this.dataset.id);
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


                //   Render first page of pagination or refresh page
                  let firstPage = document.getElementById('page1');
                  if (firstPage) {
                      firstPage.click()
                  } else {
                    window.location.href = "";
                  }
            }
            
            else {
                let error = document.querySelector('#error-message');
                error.innerHTML = "Post cannot be empty.";
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


//User deletes a post
function remove(post, target) {
    // Remove post from display
    const targetPost = target.parentElement.parentElement;
    targetPost.style.animationPlayState = 'running';
    targetPost.addEventListener('animationend', () => {
        targetPost.remove();
    })    
    fetch('delete', {
        method: "POST",
        body: JSON.stringify({
            post: post
        })
    })
}


// Edit post
function edit(post) {

    let postID = document.querySelector(`#post${post}`);
    let postContent = postID.innerHTML;
    let editButton = document.querySelector(`#edit${post}`);
    let updateButtons = document.querySelectorAll(`.update${post}`);

    // Display updated content
    postID.innerHTML = `<textarea id="updated${post}">${postContent}</textarea>`;
    let textarea = document.querySelector(`#updated${post}`)
    // Focus text area and set cursor to end of text
    textarea.focus();
    textarea.setSelectionRange(textarea.value.length, textarea.value.length);

    // Hide edit button
    editButton.style.display = "none";

    // Show 'update' and 'cancel' buttons, if 'update' clicked, update post content
    updateButtons.forEach(a => {
        a.classList.remove('hidden'), a.onclick = function() {
            var updatedContent = textarea.value;
            // Do not update if post is empty or user clicks cancel
            if (this.id == "update" && Boolean(updatedContent) == true) {
                fetch('edit', {
                    method: "POST",
                    body: JSON.stringify({
                        post: post,
                        updated: updatedContent
                    })
                })
            } else {
                updatedContent = postContent;
            }

            // Update post, hide update buttons and show edit button
            postID.innerHTML = updatedContent;
            updateButtons.forEach(a => {
                a.classList.add('hidden');
                editButton.style.display = "block";
            })
    }});
}


// User follows/ unfollows another user
function follow(author, action, count=null, follow_page) {
    fetch('follow', {
        method: "POST",
        body: JSON.stringify({
            author: author,
            action: action,
            follow_page: follow_page
        })
    })
    .then(response => response.json())
    .then(result => {
        var followButton = document.querySelectorAll(`.follow[data-id="${result.author}"]`)
        // If user clicks a 'follow' button, change it to 'unfollow'. Also update
        // follower count if on a profile page
        if (count) {
            var countUpdate = document.querySelector('#follow-count');
            var num = parseInt(countUpdate.innerHTML);
        } else {
            var countUpdate = ""
        }
        if (result.action == "follow") {
            followButton.forEach(button => {
                button.innerHTML = "Unfollow <i class='fa fa-user-times'>";
                button.setAttribute("data-action", "unfollow");
                countUpdate.innerHTML = num+1;
            });
        } else {
            followButton.forEach(button => {
                button.innerHTML = "Follow <i class='fa fa-user-plus'>";
                button.setAttribute("data-action", "follow");
                countUpdate.innerHTML = num-1;
            });          
        }

        // If unfollowing from 'follow' page, reload page
        if (`${result.follow_page}` !== 'null') {
            location.reload();
        }
    })
}


// function loadPage(page) {
    
//     // Hide all pages
//     document.querySelectorAll('.page').forEach(div => {
//         div.style.display = 'none';
//     });
    

//     // Display requested page
//     if (page) {
//         document.querySelector(`#${page}`).style.display = 'block';

//         // Clear out composition field
//         var newPost = document.querySelector('textarea');
//         if (newPost) {
//             newPost.value = '';
//         }
//     }

//     // Display nested divs
//     if (page == 'posts-page') {
//         var posts = document.querySelector(`#${page}`).children
//         var postsArray = Array.from(posts);
//         postsArray.forEach(div => {
//             div.style.display = 'block';
//         })
        
//         // Render first page of pagination
//         var firstPage = document.getElementById('page');
//         if (firstPage) {
//             firstPage.click();
//         }
//     };
    
//     // Hide New-Post form
//     // if (page == 'following-page') {
//     //     console.log(page);
//     //     let newPost = document.getElementById('posts-display');
//     //     newPost.style.display = 'none';
//     //     console.log(newPost);
//     // };

// }