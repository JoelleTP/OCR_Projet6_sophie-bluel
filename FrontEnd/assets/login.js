//Récupération des données tapées dans l'email et le mot de passe et vérification que les champs ont été remplis et avec une adresse email valide
const form = document.querySelector("form");
form.addEventListener("submit", (event) => {
    event.preventDefault();
    let email = document.getElementById("email").value;
    let password = document.getElementById("password").value;
    if(!validEmail(email)) {
        alert("L'email est incorrecte, merci de vérifier votre saisie");
        return false;
    }
    if(!password) {
        alert("Merci de compléter le mot de passe");
        return false;
    }
    const login = {
        email: email,
        password: password 
    }
    loginCheck(login); 
})

//Fonction de vérification du format des emails
function validEmail(email) {
    let emailRegExp = new RegExp("[a-z0-9._-]+@[a-z0-9._-]+\\.[a-z0-9._-]+");
    if (emailRegExp.test(email)) {
        return true;
    }
    return false;
}

//Fonction de vérification du login auprès de l'API
async function loginCheck(login) {
    try {
        const response = await fetch("http://localhost:5678/api/users/login", {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify(login)
        });
        const loginvalid = await response.json();
        if(!loginvalid) return false;
        if(response.status!==200) {
            alert("L'identifiant n'a pas été reconnu: erreur d'email ou de mot de passe");
            return false;
        } 
        alert("L'utilisateur est connecté");
        sessionStorage.setItem("token", loginvalid.token);
        location.replace("index.html");
        form.reset(); 
    } catch {
        alert("L'API ne répond pas");
        return false;
    }         
}
