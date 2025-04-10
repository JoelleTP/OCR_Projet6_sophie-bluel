//Récupération des données tapées dans l'email et le mot de passe et vérification que les champs ont été remplis et avec une adresse email valide
const form = document.querySelector("form");
form.addEventListener("submit", (event) => {
    event.preventDefault();
    let email = document.getElementById("email").value;
    let password = document.getElementById("password").value;
    if (validEmail(email) && validPassword(password)) {
        const login = {
            email: email,
            password: password 
        }
        loginCheck(login);
    }
    else if (validEmail(email) === false) {
        alert("L'email est incorrecte, merci de vérifier votre saisie");
    }  
    else {
        alert("Merci de compléter le mot de passe");
    } 
})

//Fonction de vérification des emails
function validEmail(email) {
    let emailRegExp = new RegExp("[a-z0-9._-]+@[a-z0-9._-]+\\.[a-z0-9._-]+");
    if (emailRegExp.test(email)) {
        return true;
    }
    return false;
}

//Fonction permettant de vérifier que le mot de passe a été complété
function validPassword(password) {
    if (password.length > 0) {
        return true;
    }
    return false;
}


//Fonction de vérification du login auprès de l'API
async function loginCheck (login) {
    const response = await fetch("http://localhost:5678/api/users/login", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(login)
    });
    const loginvalid = await response.json(); 
    if (response.status === 401) {
        alert("L'utilisateur n'est pas autorisé à se connecter");
    }
    else if (response.status === 404) {
        alert("L'identifiant n'a pas été reconnu: erreur d'email ou de mot de passe");
    }
    else {
        alert("L'utilisateur est connecté");
        window.localStorage.setItem("token", loginvalid.token);
        window.location.replace("index.html");
    }
}


