document.getElementById('login-form').addEventListener('submit', async function(event) {
  event.preventDefault();
  
  const username = document.getElementById('login-username').value;
  
  const password = document.getElementById('login-password').value;
  const response = await fetch('http://localhost:3000/api/users/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
  });
  const data = await response.json();
  console.log(data); 
});

document.getElementById('register-form').addEventListener('submit', async function(event) {
  event.preventDefault();
  const username = document.getElementById('register-username').value;
  const password = document.getElementById('register-password').value;
  const response = await fetch('http://localhost:3000/api/users/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
  });
  const data = await response.json();
  console.log(data); 
});

document.getElementById('fetch-activities').addEventListener('click', async function() {
  const response = await fetch('http://localhost:3000/api/activities');
  const activities = await response.json();
  const container = document.getElementById('activities-list');
  container.innerHTML = activities.map(act => `<div>${act.name}: ${act.description}</div>`).join('');
});