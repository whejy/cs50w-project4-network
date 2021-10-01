document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);

  // By default, load the inbox
  load_mailbox('inbox');
});

function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#email-display').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';

}

function load_mailbox(mailbox) {
  
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#email-display').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

  // API call for requested mailbox
  fetch(`/emails/${mailbox}`)
  .then(response => response.json())
  .then(emails => {
      // Print emails
      console.log(emails);
  
      // Display emails
      for (let i = 0; i < emails.length; i++) {
        var el = document.createElement('div');
        el.innerHTML = `<b>Sender:</b> ${emails[i].sender}<br><b>Subject:</b> ${emails[i].subject}<br><b>Received:</b> ${emails[i].timestamp}`
        el.addEventListener('click', () => {
          load_email(emails[i].id);
        })
        el.classList.add("emailList");
        if (emails[i].read == true) {
          el.classList.add("emailRead");
        }
        document.getElementById("emails-view").appendChild(el);
      }
  });

}

function load_email(id) {

  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#email-display').style.display = 'block';

  // Get email by id
  fetch(`/emails/${id}`)
  .then(response => response.json())
  .then(email => {
    console.log(email);
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
}