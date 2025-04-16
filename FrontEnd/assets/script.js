//Définition des variables générales
const token = sessionStorage.getItem("token");
const filterarea = document.querySelector(".filter");
const categorySelection = document.getElementById("category");
const modal = document.querySelector(".modal");
const modal2 = document.querySelector(".modal2");
const modal1 = document.querySelector(".modal1");
const photopreview = document.querySelector(".photoAddition__preview");
const input = document.getElementById("photoAddition__btn");
const photosubmitbtn = document.querySelector(".photoAddition__validBtn");
let modalstep = null;
let newImage;
let newTitle;
let newCategory;
let formData = new FormData();

//Initialisation de la gallerie de la page d'accueil
galleryLoad();

//Chargements des fonctionnalités du site en fonction de la connexion de l'utilisateur
if (token !== null) {
    editionPage();
    categoriesSelect();
    document.querySelector(".logoutBtn").addEventListener("click", tokenRemoval);
    document.querySelector(".editbutton").addEventListener("click", () => {
        openModal();
        trashbuttonselector();
    })
    document.querySelector(".modal__additionBtn").addEventListener("click", openModal2);
    document.querySelector(".modal2__returntomodal1").addEventListener("click", closeModal2);
    input.addEventListener("change", openPhoto);
    document.querySelector(".modal2__form").addEventListener("change", changeBtnValid);
    photosubmitbtn.addEventListener("click", newWorkupdate);
}
else {
    filterarea.innerHTML = `<li data-catid = "all" class = "btn clicked">Tous</li>`;
    categoriesLoad();
    filterarea.addEventListener("click", categoriesfilter);
}



//Fonction permettant de récupérer les données de l'API (images et textes)
async function galleryLoad() {
    try {
        const response = await fetch('http://localhost:5678/api/works/');
        const elements = await response.json();
        if (!elements) return false;
        for (let i=0; i<elements.length; i++) {
            loadPhoto(elements[i].title, elements[i].imageUrl, elements[i].categoryId, elements[i].id);
        }
    } catch {
        alert("L'API ne répond pas");
        return false;
    }  
}

//Fonction permettant de charger une photo de la gallerie et de la mini-gallerie en fonction de son titre et sa catégorie
function loadPhoto(newTitle, newImage, newCategory, newid) {
    let photosGallery = `
    <figure data-id = "${newid}" data-catid = "${newCategory}">
        <img src="${newImage}" alt="${newTitle}">
        <figcaption>${newTitle}</figcaption>
    </figure>
    `;
    const galleryArea = document.querySelector(".gallery");
    galleryArea.innerHTML += photosGallery;
    let photosminiGallery = `
    <figure class="minigallery__photo" data-id="${newid}">
        <img src="${newImage}" alt="${newTitle}">
        <button class="minigallery__trash"><i class="fa-solid fa-trash-can" data-id="${newid}"></i></button>
    </figure>
    `;
    const minigalleryArea = document.querySelector(".modal__minigallery");
    minigalleryArea.innerHTML += photosminiGallery;
}

//Fonction permettant de récupérer les catégories de l'API et suppression des doublons
async function getUniqueCategories() {
    try {
        const categoriesResponse = await fetch('http://localhost:5678/api/categories');
        let categories = await categoriesResponse.json()
        if(!categories) return false;
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
    } catch {
        alert("L'API ne répond pas");
        return false;
    }
}

//Fonction pour générer les boutons de filtres sur la page d'accueil
async function categoriesLoad() {
    let categories = await getUniqueCategories();
    if (!categories) return false;
    for (let i=0; i<categories.length; i++) {
        let categoriesButton = document.createElement("li");
        categoriesButton.textContent = categories[i].name;
        categoriesButton.dataset.catid = `${categories[i].id}`;
        categoriesButton.classList.add("btn");
        filterarea.appendChild(categoriesButton); 
    }
}

//Fonction pour générer la sélection de catégories lors de l'ajout de photo dans la modale
async function categoriesSelect() {
    let categories = await getUniqueCategories();
    if (!categories) return false;
    for (let i=0; i<categories.length; i++) {
        let categoryoption = document.createElement("option");
        categoryoption.value = categories[i].name;
        categoryoption.textContent = categories[i].name;
        categoryoption.id = categories[i].id;
        categorySelection.appendChild(categoryoption);
    }
}

//Permet de récupérer le clic sur les boutons tous et catégories et de lancer la fonction filtrée. 
function categoriesfilter(event) {
    if (event.target.tagName === "LI") {
        document.querySelectorAll(".btn").forEach(btn => {
            btn.classList.remove("clicked");
        })
        event.target.classList.add("clicked");
        let categoriesClicked = event.target.dataset.catid;
        filterByCategories(categoriesClicked);
    }
} 

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

//Fonction permettant d'ajouter le menu d'édition sur la page d'accueil lorsque l'utilisateur est connecté
function editionPage() {
    const editionMenu = `
    <div class="editionMenu">
        <i class="fa-regular fa-pen-to-square"></i>
        <p>Mode édition</p>
    </div>`; 
    const body = document.querySelector("body");
    body.insertAdjacentHTML("afterbegin", editionMenu);
    const editbutton = `
        <button class="editbutton">
            <i class="fa-regular fa-pen-to-square"></i>
            <p>modifier</p>
        </button>`;
    const project = document.querySelector("#portfolio h2");
    project.insertAdjacentHTML("afterend", editbutton);
    const login = document.querySelector(".loginBtn");
    login.classList.add("hidden");
    document.querySelector(".logoutBtn").classList.remove("hidden");
}

//Fonction permettant de se déconnecter
function tokenRemoval(token) {
    const confirmation = confirm("Attention, vous allez être déconnecté. Merci de confirmer.");
        if (confirmation) {
            token = sessionStorage.removeItem("token");
            return token;
        }            
}


//Fonction permettant l'ouverture de la modale
function openModal() {
    if (modalstep !== null) return;
    modal.classList.remove("hidden");
    modal.removeAttribute("aria-hidden");
    modal.setAttribute("aria-modal", "true");
    modalstep = modal;
    modalstep.addEventListener("click", closeModal);
    document.querySelectorAll(".modal__stopJs").forEach(btn => {
        btn.addEventListener("click", stopPropagation);
    })
    document.querySelectorAll(".modal__closeBtn").forEach(btn => {
        btn.addEventListener("click", closeModal);
    })
}

//Fonction permettant la fermeture de la modale
function closeModal() {
    if (modalstep === null) return;
    modal.classList.add("hidden");
    modal.setAttribute("aria-hidden", "true");
    modal.removeAttribute("aria-modal");
    modalstep = null;
    closeModal2();
}

//Fonction permettant d'empêcher la propagation à la modal__wrapper (1 et 2) pour que la modale ne se ferme pas quand on clique dessus
function stopPropagation(e) {
    e.stopPropagation();
}

//Fonction permettant l'ouverture de la deuxième page de la modale
function openModal2() {
    modal2.classList.remove("hidden");
    modal1.classList.add("hidden");
}

//Fonction permettant la fermeture de la deuxième page de la modale
function closeModal2() {
    modal2.classList.add("hidden");
    modal1.classList.remove("hidden");
    document.querySelector(".modal2__form").reset();
    if (photopreview.firstChild) {
        photopreview.removeChild(photopreview.firstChild);
    }
    photosubmitbtn.disabled = true;
}

//Fonction permettant de sélectionner l'image à supprimer dans la mini-gallerie
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

//Fonction d'appel à l'API pour supprimer la photo sélectionnée
async function deletePhoto(idphoto) {
    try {
        const response = await fetch(`http://localhost:5678/api/works/${idphoto}`, {
            method: "DELETE",
            headers: {'Authorization': `Bearer ${token}`}
        });
        if(!response.ok) {
            alert("Erreur : vous n'êtes pas autorisé à supprimer cette photo");
            return false;
        }
        alert ("L'image a bien été supprimée");
        windowdeletionPhoto(idphoto, document.querySelectorAll(".minigallery__photo")); 
        windowdeletionPhoto(idphoto, document.querySelectorAll(".gallery figure")); 
    } catch {
        alert("L'API ne répond pas");
        return false;
    } 
}

//Fonction permettant de cacher la photo supprimée dans la gallerie et la mini-gallerie avant le rechargement de la page d'accueil
function windowdeletionPhoto(idphoto, selector) {
    selector.forEach(function (photo) {
        if (photo.dataset.id === idphoto) {
            photo.classList.add("hidden");
        }
    })
}

//Fonction permettant de prévisualiser la nouvelle image choisie dans la deuxième page de la modale avant de l'ajouter
function openPhoto() {
    if (photopreview.firstChild) {
        photopreview.removeChild(photopreview.firstChild);
    }
    let imgFiles = input.files;
    if (!imgFiles) return false;
    if (imgFiles.length === 0) return false;
    if ((imgFiles[0].size >= 4000000) || (!validFiles(imgFiles[0]))) {
        alert("Le fichier choisi n'est pas un fichier valide, merci d'importer une autre image");
        return false;
    }
    let imagePreview = document.createElement("img");
    imagePreview.src = window.URL.createObjectURL(imgFiles[0]);
    imagePreview.alt = `${imgFiles[0].name}`; 
    photopreview.appendChild(imagePreview);
}

//Fonction permettant de vérifier que le format de l'image est accepté
function validFiles(file) {
    let fileTypes = ["image/jpeg", "image/jpg", "image/png"];
    for (let i=0; i<fileTypes.length; i++) {
        if (file.type === fileTypes[i]) {
            return true;
        }
    }
    return false;
}

//Fonction permettant de rendre le bouton Valider valide en fonction du remplissage du formulaire
function changeBtnValid() {
    if (!completionForm()) {
        photosubmitbtn.disabled = true;
        return false;
    }
    photosubmitbtn.disabled = false;
}

//Fonction permettant de vérifier que le formulaire de la deuxième page de la modale est entièrement complétée et de modifier le bouton Valider
function completionForm() {
    newTitle = document.querySelector(".title").value;
    newImage = input.files[0];
    newCategory = categorySelection.options[categorySelection.selectedIndex].id;
    if(!newTitle) return false;
    if(!newImage) return false;
    if(!newCategory) return false;
    return true;    
}

//Fonction permettant d'ajouter une nouvelle photo
function newWorkupdate(event) {
    event.preventDefault();
    const confirmation = confirm("Voulez-vous vraiment rajouter cette photo ?");
    if (confirmation) {
        formData.append("title", newTitle);
        formData.append("image", newImage);
        formData.append("category", newCategory);
        photoAddition(formData);
        formData = new FormData(); //réinitialisation de formData pour pouvoir ensuite ajouter de nouvelles photos
    }
}
    
//Fonction pour ajouter une nouvelle photo dans l'API et la charger directement sur la page avec les informations récupérées
async function photoAddition(formData) {
    try {
        const response = await fetch("http://localhost:5678/api/works", {
            method: "POST",
            headers: {authorization: `Bearer ${token}`},
            body: formData       
        });
        const photoAdditionValid = await response.json();
        if (!photoAdditionValid) return false;
        if (response.status!==201) {
            alert("Cette photo n'a pas pu être ajoutée, veuillez réessayer ou vous déconnecter/reconnecter");
            return false;
        } 
        alert("La photo a bien été ajoutée");
        closeModal();
        loadPhoto(photoAdditionValid.title, photoAdditionValid.imageUrl, photoAdditionValid.categoryId, photoAdditionValid.id);
        return true;
    } catch {
        alert("L'API ne répond pas");
        return false;
    }
}
        