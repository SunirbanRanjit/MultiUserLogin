const form = document.getElementById("reg-form");
  const selectEvent = document.querySelector('.usertype');
  selectEvent.addEventListener('change', (event) => {
    
      if(event.target.value === 'admin'){
        document.getElementById("username").value = 'admin';
        document.getElementById("password").value = 'admin';
      }else{
        document.getElementById("username").value = '';
        document.getElementById("password").value = '';
      }
  })
  form.addEventListener('submit', registerUser );
  //alert("heello");
  async function registerUser(event) {
      event.preventDefault();
      const username = document.getElementById("username").value;
      const password = document.getElementById("password").value;
      var usertype = document.getElementById('usertype').value;
      console.log(usertype);
      const response = await fetch('/login' , {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          usertype, username, password
        })
      }).then((res) => res.json());
      console.log(response);
      if(response.state === 'ok'){
        
        setCookie('token',response.data,2);
        if(usertype === 'user')
          window.location = '/user.html';
        else
          window.location = '/admin.html';
      }
      if(response.state === 'error'){
          alert(response.error);
      }
      
      
  }

  function setCookie(cname, cvalue, exdays) {
    const d = new Date();
    d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
    let expires = "expires="+d.toUTCString();
    document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}
