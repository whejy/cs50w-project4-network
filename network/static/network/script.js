document.addEventListener('DOMContentLoaded', function() {


    // Display posts page on login
    window.onload=function(){
        document.getElementById("posts").click();
      };    


    // Select all buttons
    document.querySelectorAll('.nav-link').forEach(button => {

        // When a button is clicked, switch to that page
        button.onclick = function() {
            loadPage(this.dataset.page);
        }
    }) 
    

    // Retrieve new post data if user is logged in
    var loggedIn = document.querySelector('#create-post');
    if (loggedIn) {
        loggedIn.addEventListener('click', () => {
            var post = document.querySelector('textarea').value;
            if (post != '') {
                console.log(post);
            }
            else {
                console.log('no content');
            }
        });
    }
});

// function load_posts() {
    
//     document.querySelector('#posts-display').style.display = 'block';
//     document.querySelector('#posts-list').style.display = 'block';

//     // Get content of new post
//     document.querySelector('#create-post').addEventListener('click', () => {
//         var post = document.querySelector('textarea').value;
//         if (post != '') {
//             console.log(post);
//         }
//         else {
//             console.log('no content');
//         }
//     });

function loadPage(page) {
    
    // Hide all pages
    document.querySelectorAll('.page').forEach(div => {
        div.style.display = 'none';
    });

    // Display requested page
    if (page) {
        document.querySelector(`#${page}`).style.display = 'block';
    }

    // Display nested divs
    if (page == 'posts-page') {
        var posts = document.querySelector(`#${page}`).children
        var postsArray = Array.from(posts);
        postsArray.forEach(div => {
            div.style.display = 'block';
        })
    }; 
}