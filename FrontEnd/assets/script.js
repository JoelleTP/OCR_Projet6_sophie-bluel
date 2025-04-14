//Création du bouton tous
let filterarea = document.querySelector(".filter");
filterarea.innerHTML = `<li data-catid = "all" class = "btn clicked">Tous</li>`;

//Appel des catégories dans la partie select
let categorySelection = document.getElementById("category");

//Initialisation de la page d'accueil (gallerie et catégorie)
galleryLoad();
categoriesLoad();

//Fonction permettant de récupérer les données de l'API (images et textes)
async function galleryLoad() {
    const response = await fetch('http://localhost:5678/api/works/');
    const elements = await response.json();
    for (let i=0; i<elements.length; i++) {
        loadPhoto(elements[i].title, elements[i].imageUrl, elements[i].categoryId, elements[i].id);
    }
}

//Fonction permettant de charger une photo en fonction de son titre et sa catégorie
function loadPhoto(newTitle, newimage, newCategory, newid) {
    let photosGallery = `
    <figure data-id = "${newid}" data-catid = "${newCategory}">
        <img src="${newimage}" alt="${newTitle}">
        <figcaption>${newTitle}</figcaption>
    </figure>
    `;
    const galleryArea = document.querySelector(".gallery");
    galleryArea.innerHTML += photosGallery;
    let photosminiGallery = `
        <figure class="minigallery__photo" data-id="${newid}">
            <img src="${newimage}" alt="${newTitle}">
            <button class="minigallery__trash"><i class="fa-solid fa-trash-can" data-id="${newid}"></i></button>
        </figure>
        `;
    const minigalleryArea = document.querySelector(".modal__minigallery");
    minigalleryArea.innerHTML += photosminiGallery;
}

//Récupération des catégories et vérification des doublons
async function getUniqueCategories() {
    const categoriesResponse = await fetch('http://localhost:5678/api/categories');
    let categories = await categoriesResponse.json()
    let categoriesChecked = new Set();
    let uniqueCategories = categories.filter(category => {
        if (categoriesChecked.has(category.name)) {
            return false;
        }
        else {
            categoriesChecked.add(category.name);
            return true;
        }
    })
    return uniqueCategories;
}

//Chargement des catégories en bouton et filtre des images par catégories
async function categoriesLoad() {
    let categories = await getUniqueCategories();
    for (let i=0; i<categories.length; i++) {
        let categoriesButton = document.createElement("li");
        categoriesButton.textContent = categories[i].name;
        categoriesButton.dataset.catid = `${categories[i].id}`;
        categoriesButton.classList.add("btn");
        filterarea.appendChild(categoriesButton); 
        let categoryoption = document.createElement("option");
        categoryoption.value = categories[i].name;
        categoryoption.textContent = categories[i].name;
        categoryoption.id = categories[i].id;
        categorySelection.appendChild(categoryoption);
    }
}


//Permet de récupérer le clic sur le bouton et de lancer la fonction filtrée. 
filterarea.addEventListener("click", (event) => {
    if (event.target.tagName === "LI") {
        document.querySelectorAll(".btn").forEach(btn => {
            btn.classList.remove("clicked");
        })
        event.target.classList.add("clicked");
        let categoriesClicked = event.target.dataset.catid;
        filterByCategories(categoriesClicked);
    }
}) 

//Fonction permettant de filtrer selon la catégorie
function filterByCategories(categoriesClicked) { 
    const figureGallery = document.querySelectorAll(".gallery figure[data-catid]");
    let figureGalleryArray = Array.from(figureGallery).map(figureGallery => ({
    element: figureGallery,
    id: figureGallery.dataset.catid
    }))
    for (let i=0; i<figureGalleryArray.length; i++){
        if (figureGalleryArray[i].id === categoriesClicked || categoriesClicked === "all") {
            figureGalleryArray[i].element.classList.remove("hidden");
        }
        else {
            figureGalleryArray[i].element.classList.add("hidden");
        }
    }
}

//Ajout d'éléments sur la page si l'utilisateur est connecté
const token = window.localStorage.getItem("token");
let body = document.querySelector("body");
let login = document.querySelector(".loginBtn");
let logout = document.querySelector(".logoutBtn");
let project = document.querySelector("#portfolio h2");
if (token !== null) {
    let editionMenu = `
        <div class="editionMenu">
            <i class="fa-regular fa-pen-to-square"></i>
            <p>Mode édition</p>
        </div>`; 
    body.insertAdjacentHTML("afterbegin", editionMenu);
    login.classList.add("hidden");
    logout.classList.remove("hidden");
    let editbutton = `
        <button class="editbutton">
            <i class="fa-regular fa-pen-to-square"></i>
            <p>modifier</p>
        </button>`;
    project.insertAdjacentHTML("afterend", editbutton);
    filterarea.classList.add("hidden");
}


//Suppression du token lorsque l'on clique sur logout
logout.addEventListener("click", () => {
    token = window.localStorage.removeItem("token");
})

//Mise en place de l'ouverture et de la fermeture de la modale
let modalstep = null;
let modalOpening = document.querySelector(".editbutton");
let modal = document.querySelector(".modal");
let modalClosing = document.querySelectorAll(".modal__closeBtn");
let modalStop = document.querySelectorAll(".modal__stopJs"); 
let modalArrow = document.querySelector(".modal2__returntomodal1");
modalOpening.addEventListener("click", openModal);

//Fonction ouverture de la modale
function openModal() {
    modal.classList.remove("hidden");
    modal.removeAttribute("aria-hidden");
    modal.setAttribute("aria-modal", "true");
    modalstep = modal;
    modalstep.addEventListener("click", closeModal);
    modalStop.forEach(btn => {
        btn.addEventListener("click", stopPropagation);
    })
    modalClosing.forEach(btn => {
        btn.addEventListener("click", closeModal);
    })
    trashbuttonselector();
}

//Fermeture de la modale
function closeModal() {
    if (modalstep === null) return;
    modal.classList.add("hidden");
    modal.setAttribute("aria-hidden", "true");
    modal.removeAttribute("aria-modal");
    modalstep.removeEventListener("click", closeModal);
    modalStop.forEach(btn => {
        btn.removeEventListener("click", stopPropagation);
    })
    modalstep = null;
    modalClosing.forEach(btn => {
        btn.removeEventListener("click", closeModal);
    })
    closeModal2();
}

//Empêcher la propagation à la modal__wrapper pour que la modale ne se ferme pas quand on appuie dessus
function stopPropagation(e) {
    e.stopPropagation();
}

//Quand on appuie sur le bouton "Ajouter photo" de la première modale, on fait apparaître la deuxième page (modal2)
let modal2opening = document.querySelector(".modal__additionBtn");
let modal2 = document.querySelector(".modal2");
let modal1 = document.querySelector(".modal1");
const modal2Form = document.querySelector(".modal2__form");
let photopreview = document.querySelector(".photoAddition__preview");
modal2opening.addEventListener("click", openModal2);
modalArrow.addEventListener("click", closeModal2);

function openModal2() {
    modal2.classList.remove("hidden");
    modal1.classList.add("hidden");
}

function closeModal2() {
    modal2.classList.add("hidden");
    modal1.classList.remove("hidden");
    modal2Form.reset();
    photopreview.removeChild(photopreview.firstChild);
}

//Quand on appuie sur la poubelle, on doit supprimer l'image concernée de la minigallery et de la gallery avec un appel à l'API concernée
function trashbuttonselector() {
    let trashbuttons = document.querySelectorAll(".fa-trash-can");
    trashbuttons.forEach(btn => {
        btn.addEventListener("click", (event) => {
            let idphoto = event.target.dataset.id;
            const confirmation = confirm("Attention, cette action est définitive. Etes-vous sûre de vouloir supprimer cette photo ?");
            if (confirmation) {
                deletePhoto(idphoto);
            }            
        })
    })
}

//Fonction d'appel à l'API pour supprimer une photo
async function deletePhoto(idphoto) {
    const response = await fetch(`http://localhost:5678/api/works/${idphoto}`, {
        method: "DELETE",
        headers: {'Authorization': `Bearer ${token}`}
    });
    if (response.ok) {
        alert ("L'image a bien été supprimée");
        windowdeletionPhoto(idphoto);        
    }
    else {
        alert("Erreur : vous n'êtes pas autorisé à supprimer cette photo");
    }
}

//Fonction permettant de supprimer la photo de l'écran avant le rechargement de la page
function windowdeletionPhoto(idphoto) {
    const galleryPhoto = document.querySelectorAll(".gallery figure");
    const minigalleryPhoto = document.querySelectorAll(".minigallery__photo");
    for (let i=0; i<=idphoto; i++){
        if ((galleryPhoto[i].dataset.id === idphoto)) {
            galleryPhoto[i].classList.add("hidden");
            minigalleryPhoto[i].classList.add("hidden");
        }
    }
}

//Quand on appuie sur le bouton "Ajout photo" de la deuxième, on peut ajouter la photo
let input = document.getElementById("photoAddition__btn");
let curFiles;
input.addEventListener("change", openPhoto);

function openPhoto() {
    while (photopreview.firstChild) {
        photopreview.removeChild(photopreview.firstChild);
    }
    curFiles = input.files;
    if ((curFiles.length !== 0) && (curFiles[0].size < 4000000) && validFiles(curFiles[0])) {
        let newImage = document.createElement("img");
        newImage.src = window.URL.createObjectURL(curFiles[0]);
        newImage.alt = `${curFiles[0].name}`; 
        photopreview.appendChild(newImage);
    }
    else {
        alert("Le fichier choisi n'est pas un fichier valide, merci d'importer une autre image");
    }
}

function validFiles(file) {
    let fileTypes = ["image/jpeg", "image/pjpeg", "image/png"];
    for (let i=0; i<fileTypes.length; i++) {
        if (file.type === fileTypes[i]) {
            return true;
        }
    }
    return false;
}


//Quand on remplit tous les champs, le bouton validé devient vert et est cliquable, sinon alert de l'utilisateur
let photosubmitbtn = document.querySelector(".photoAddition__validBtn");
let formData = new FormData();
modal2Form.addEventListener("change", changeBtnValid);
photosubmitbtn.addEventListener("click", newWorkupdate);

function changeBtnValid() {
    let title = document.querySelector(".title");
    let newimage = document.querySelector(".photoAddition__preview img");
    let newTitle = title.value;
    let newCategory = categorySelection.options[categorySelection.selectedIndex].id;
    if ((newimage !== null) && validForm(newTitle) && (newCategory !== "")) {
        photosubmitbtn.disabled = false;
    }
    else {
        photosubmitbtn.disabled = true;
    }
}

function newWorkupdate(event) {
    event.preventDefault();
    let title = document.querySelector(".title");
    let newimage = input.files[0];
    let newTitle = title.value;
    let newCategory = categorySelection.options[categorySelection.selectedIndex].id;
    if ((newimage !== null) && validForm(newTitle) && (newCategory !== "")) {
        formData.append("title", newTitle);
        formData.append("image", newimage);
        formData.append("category", newCategory);
        photoAddition(formData);
    }
    else {
        alert("merci de remplir tous les champs")
    }
}
    
function validForm(i) {
    if (i.length > 0) {
        return true;
    }
    return false;
}

//Quand on clique sur valider, cela ajoute la photo dans la gallerie et la mini-gallerie. 
async function photoAddition(formData) {
    const response = await fetch("http://localhost:5678/api/works", {
        method: "POST",
        headers: {authorization: `Bearer ${token}`},
        body: formData       
    });
    const photoAdditionValid = await response.json(); 
    if (response.status === 401) {
        alert("l'utilisateur n'est pas autorisé à rajouter une image");
        closeModal();
    }
    else if (response.status === 201) {
        alert("La photo a bien été ajouté");
        closeModal();
        loadPhoto(photoAdditionValid.title, photoAdditionValid.imageUrl, photoAdditionValid.categoryId, photoAdditionValid.id);
    }
    else {
        alert("Une erreur s'est produite, veuillez recommencer");
    }
}
        