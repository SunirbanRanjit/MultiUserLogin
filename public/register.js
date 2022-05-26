const form = document.getElementById("reg-form");
  
form.addEventListener('submit', registerUser );
//alert("heello");
async function registerUser(event) {
    event.preventDefault();
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;
    
    const response = await fetch('/register' , {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        username, password
      })
    }).then((res) => res.json());
    if(response.status === 'ok'){
      window.location = './index.html';
    }
    if(response.status === 'error')
      alert(response.error);
    
}
