document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);
  
  // Submit-button listener
  document.querySelector('form').addEventListener('submit', () => get_data(event));

  // Archive or un-archive an email
  var archiveBTN = document.querySelector('#archiveBTN');
  var action = false;
  if (archiveBTN) {
    archiveBTN.addEventListener('click', () => {

      // Determine whether to archive or un-archive email
      if (archiveBTN.classList.contains('moveArchive')) {
        action = true;
      } else {
        action = false;
      }

      fetch(`/emails/${archiveBTN.value}`, {
        method: 'PUT',
        body: JSON.stringify({
        archived: action
        })
      })

      location.reload();
    });
  }

  // By default, load the inbox
  load_mailbox('inbox');
});


function compose_email(rec='', sub='', body='', time='') {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#email-display').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';
  document.querySelector('#archiveBTN').style.display = 'none';
  document.querySelector('#reply').style.display = 'none';
  

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = ''; 
  

  // Pre-populate fields if replying to email
  if (!body=='') {
    document.querySelector('#compose-recipients').value = rec;
    document.querySelector('#compose-subject').value = sub;
    document.querySelector('#compose-body').value = `\n\nOn ${time}, ${rec} wrote: "${body}"`; 

    // Set cursor to beginning of email-body
    document.querySelector('#compose-body').focus();
    document.querySelector('#compose-body').setSelectionRange(0, 0);
  }

}

// Compose email
function get_data(event) {

  event.preventDefault();

  // Retrieve form data and post to API
  fetch('/emails', {
    method: 'POST',
    body: JSON.stringify({
      recipients: document.querySelector('#compose-recipients').value,
      subject: document.querySelector('#compose-subject').value,
      body: document.querySelector('#compose-body').value
    })
  })
  .then(response => response.json())
  .then(result => {
    console.log(result);
    load_mailbox('sent');
  });

}


function load_mailbox(mailbox) {
  
  // Show the mailbox and hide other views and buttons
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#email-display').style.display = 'none';
  document.querySelector('#archiveBTN').style.display = 'none';
  document.querySelector('#reply').style.display = 'none';


  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

  // API call for requested mailbox
  fetch(`/emails/${mailbox}`)
  .then(response => response.json())
  .then(emails => {

      // Display emails list
      for (let i = 0; i < emails.length; i++) {
        var el = document.createElement('div');
        const previewLimit = 70;
        var ellipses = "";
        if (emails[i].body.length > previewLimit) {
          ellipses = "...";
        }
        var preview = emails[i].body.substring(0, previewLimit) + ellipses;
        if (`${mailbox}` == 'sent') {
          el.innerHTML = `<b>To:</b><div class="sender"> ${emails[i].recipients}</div>${emails[i].subject}<div class="time">${emails[i].timestamp}</div><span class="preview">${preview}</span>`
        }
        else {
          el.innerHTML = `<div class="sender">${emails[i].sender}</div>${emails[i].subject}<div class="time">${emails[i].timestamp}</div><span class="preview">${preview}</span>`
        }

        // Retreive email if clicked on
        el.addEventListener('click', () => {
          load_email(emails[i].id, mailbox);
        })
        el.classList.add("emailList");
        if (emails[i].read == true) {
          el.classList.add("emailRead");
        }
        document.getElementById("emails-view").appendChild(el);
      }

      if (emails.length < 1) {
        document.getElementById("emails-view").innerHTML += "<i>No emails to display</i>";
      }
  });

}

function load_email(id, mailbox) {

  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#email-display').style.display = 'block';
  document.querySelector('#archiveBTN').style.display = 'block';
  document.querySelector('#reply').style.display = 'block';

  // Archive/ un-archive button behaviour. Classlist modified to determine which action
  // to take on click.
  var archBTN = document.querySelector('#archiveBTN');
  var replyBTN = document.querySelector('#reply');
  if (mailbox == 'sent') {
    archBTN.style.display = "none";
    replyBTN.style.display = "none";
  } else {
    archBTN.value = `${id}`;
    if (mailbox == 'archive') {
      archBTN.innerHTML = 'Move to Inbox';
      archBTN.classList.add('moveInbox');
      if (archBTN.classList.contains('moveArchive')) {
        archBTN.classList.remove('moveArchive');
      }
    } else {
        archBTN.innerHTML = 'Archive Email';
        archBTN.classList.add('moveArchive');
        if (archBTN.classList.contains('moveInbox')) {
          archBTN.classList.remove('moveInbox');
      }
    }
  }

  // Get email by id
  fetch(`/emails/${id}`)
  .then(response => response.json())
  .then(email => {
    document.getElementById('email-display').innerHTML = `
    <span class="emailDetails"> <b>From:</b> ${email.sender} </span>
    <span class="emailDetails"> <b>To:</b> ${email.recipients}</span>
    <span class="emailDetails"> <b>Subject:</b> ${email.subject}</span>
    <b>Received:</b> ${email.timestamp}<br><br>
    <textarea readonly id="noedit">${email.body}</textarea>`;
  });

  // Mark email as read
  fetch(`/emails/${id}`, {
    method: 'PUT',
    body: JSON.stringify({
      read: true
    })
  })

  // Collect data to populate reply fields
  replyBTN.addEventListener('click', () => {
    fetch(`/emails/${id}`)
    .then(response => response.json())
    .then(email => {
      var subject = `${email.subject}`;

      // Ensure only one 'RE:' is present in title
      if (subject.indexOf("RE:") >= 0) {
        subject = subject.replace('RE: ', '')
      }      
      compose_email(`${email.sender}`, `RE: ${subject}`, 
      `${email.body}`, `${email.timestamp}`);
    })
  })

}