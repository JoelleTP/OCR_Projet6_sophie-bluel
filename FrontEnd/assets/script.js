//Fonction permettant de récupérer les données de l'API (images et textes)
async function elementsrecovery() {
    const response = await fetch('http://localhost:5678/api/works/');
    const elements = await response.json();
    for (let i=0; i<elements.length; i++) {
        let figure = `
        <figure>
            <img src="${elements[i].imageUrl}" alt="${elements[i].title}">
            <figcaption>${elements[i].title}</figcaption>
        </figure>
        `;
        const parent = document.querySelector(".gallery");
        parent.innerHTML += figure;
    }
}
elementsrecovery();



