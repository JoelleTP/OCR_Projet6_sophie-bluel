//Création du bouton tous
let filterarea = document.querySelector(".filter");
filterarea.innerHTML = `<li data-catid = "all" class = "btn clicked">Tous</li>`;

//Initialisation de la page d'accueil (gallerie et catégorie)
galleryLoad();
categoriesLoad();

//Fonction permettant de récupérer les données de l'API (images et textes)
async function galleryLoad() {
    const response = await fetch('http://localhost:5678/api/works/');
    const elements = await response.json();
    for (let i=0; i<elements.length; i++) {
        let photosGallery = `
        <figure data-catid = "${elements[i].categoryId}">
            <img src="${elements[i].imageUrl}" alt="${elements[i].title}">
            <figcaption>${elements[i].title}</figcaption>
        </figure>
        `;
        const galleryArea = document.querySelector(".gallery");
        galleryArea.innerHTML += photosGallery;
    }
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