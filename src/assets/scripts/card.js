
const destinations = [
  {
    img: "assets/images/Paris.png",
    price: "From ₹89,999",
    name: "Paris",
    description: "City of Light"
  },
  {
    img: "assets/images/Tokyo.png",
    price: "From ₹1,05,000",
    name: "Tokyo",
    description: "Tradition & Technology"
  },
  {
    img: "assets/images/London.png",
    price: "From ₹99,500",
    name: "London",
    description: "Royal Heritage"
  },
  {
    img: "assets/images/Dubai.png",
    price: "From ₹48,999",
    name: "Dubai",
    description: "City of Gold"
  },
  {
    img: "assets/images/Sydney.png",
    price: "From ₹1,15,500",
    name: "Sydney",
    description: "Harbour City"
  },
  {
    img: "assets/images/Zurich.png",
    price: "From ₹1,30,000",
    name: "Zurich",
    description: "Swiss Paradise"
  },
  {
    img: "assets/images/LA.jpeg",
    price: "From ₹1,20,000",
    name: "Los Angeles",
    description: "Hollywood Experience"
  },
  {
    img: "assets/images/Berlin.png",
    price: "From ₹87,000",
    name: "Berlin",
    description: "History & Culture"
  },
  {
    img: "assets/images/Cape-Town.png",
    price: "From ₹95,000",
    name: "Cape Town",
    description: "Beaches & Mountains"
  }
];

const cardsGrid = document.getElementById("cardsGrid");

function renderCards(data) {
  cardsGrid.innerHTML = data
    .map(
      (item) => `
        <div class="card">
          <div class="card-image">
            <img src="${item.img}" alt="${item.name}" loading="lazy">
          </div>
          <div class="card-info">
            <p class="card-price">${item.price}</p>
            <p class="card-name">${item.name}</p>
          </div>
          <div class="card-description">${item.description}</div>
        </div>
      `
    )
    .join("");
}

renderCards(destinations);
