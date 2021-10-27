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
  if (archiveBTN) {
    archiveBTN.addEventListener('click', () => {

      if (archiveBTN.classList.contains('moveArchive')) {
        fetch(`/emails/${archiveBTN.value}`, {
          method: 'PUT',
          body: JSON.stringify({
          archived: true
          })
        })
      } else {
        fetch(`/emails/${archiveBTN.value}`, {
          method: 'PUT',
          body: JSON.stringify({
          archived: false
          })
        })
      }

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
  if (!rec=='') {
    document.querySelector('#compose-recipients').value = rec;
    document.querySelector('#compose-subject').value = sub;
    document.querySelector('#compose-body').value = `On ${time} ${rec} wrote: "${body}"`; 
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
  
  // Show the mailbox and hide other views
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

      // Display emails
      for (let i = 0; i < emails.length; i++) {
        var el = document.createElement('div');
        if (`${mailbox}` == 'sent') {
          el.innerHTML = `<b>Recipients:</b> ${emails[i].recipients} <br><b>Subject:</b> ${emails[i].subject}<br><b>Sent:</b> ${emails[i].timestamp}`
        }
        else {
          el.innerHTML = `<b>Sender:</b> ${emails[i].sender}<br><b>Subject:</b> ${emails[i].subject}<br><b>Received:</b> ${emails[i].timestamp}`
        }
        el.addEventListener('click', () => {
          load_email(emails[i].id, mailbox);
        })
        el.classList.add("emailList");
        if (emails[i].read == true) {
          el.classList.add("emailRead");
        }
        document.getElementById("emails-view").appendChild(el);
      }
  });

}

function load_email(id, mailbox) {

  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#email-display').style.display = 'block';
  document.querySelector('#archiveBTN').style.display = 'block';
  document.querySelector('#reply').style.display = 'none';

  // Archive-button behaviour. Classlist modified to determine action on click.
  var button = document.querySelector('#archiveBTN');
  var replyBTN = document.querySelector('#reply');
  if (mailbox == 'inbox') {
    replyBTN.style.display = "block"
  }
  if (mailbox == 'sent') {
    button.style.display = "none";
  } else {
    button.style.display = "block";
    button.value = `${id}`;
    if (mailbox == 'archive') {
      button.innerHTML = 'Move to Inbox';
      button.classList.add('moveInbox');
      if (button.classList.contains('moveArchive')) {
        button.classList.remove('moveArchive');
      }
    } else {
        button.innerHTML = 'Archive Email';
        button.classList.add('moveArchive');
        if (button.classList.contains('moveInbox')) {
          button.classList.remove('moveInbox');
      }
    }
  }

  // Get email by id
  fetch(`/emails/${id}`)
  .then(response => response.json())
  .then(email => {
    document.getElementById('email-display').innerHTML = `
    <span class="emailDetails"> <b>Sender:</b> ${email.sender} </span>
    <span class="emailDetails"> <b>Recipients:</b> ${email.recipients}</span>
    <span class="emailDetails"> <b>Subject:</b> ${email.subject}</span>
    <b>Received:</b> ${email.timestamp}<br><br>
    ${email.body}`;
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
      if (subject.indexOf("RE:") >= 0) {
        subject = subject.replace('RE: ', '')
      }      
      compose_email(`${email.sender}`, `RE: ${subject}`,
      `${email.timestamp}`, `${email.body}`);
    })
  })
  
}