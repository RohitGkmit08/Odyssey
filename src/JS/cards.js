const DB_NAME = "OdysseyDB";
const DB_VERSION = 1;
const STORE_NAME = "destinations";
const DATA_URL = "./assets/data/destinations.json";
const cardsGrid = document.getElementById("cardsGrid");

let db;
// helper
const transaction = (mode) => db.transaction(STORE_NAME, mode).objectStore(STORE_NAME);
// Open DB
function openDatabase() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onerror = () => reject(req.error);
    req.onsuccess = () => {
      db = req.result;
      resolve(db);
    };

    req.onupgradeneeded = (e) => {
      const store = e.target.result.createObjectStore(STORE_NAME, {
        keyPath: "id",
        autoIncrement: true
      });
      store.createIndex("name", "name");
    };
  });
}
// CRUD
const getAllDestinations = () =>
  new Promise((resolve, reject) => {
    const req = transaction("readonly").getAll();
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });

const addDestination = (item) =>
  new Promise((resolve, reject) => {
    const req = transaction("readwrite").add(item);
    req.onsuccess = () => {
      resolve(req.result);
      loadAndRenderDestinations();
    };
    req.onerror = () => reject(req.error);
  });

const updateDestination = (id, updates) =>
  new Promise((resolve, reject) => {
    const store = transaction("readwrite");
    const getReq = store.get(id);

    getReq.onsuccess = () => {
      const updated = { ...getReq.result, ...updates };
      const putReq = store.put(updated);
      putReq.onsuccess = () => {
        resolve(putReq.result);
        loadAndRenderDestinations();
      };
      putReq.onerror = () => reject(putReq.error);
    };
    getReq.onerror = () => reject(getReq.error);
  });

const deleteDestination = (id) =>
  new Promise((resolve, reject) => {
    const req = transaction("readwrite").delete(id);
    req.onsuccess = () => {
      resolve();
      loadAndRenderDestinations();
    };
    req.onerror = () => reject(req.error);
  });
// Fetching JSON
const fetchFromJson = async () => {
  const res = await fetch(DATA_URL);
  if (!res.ok) throw new Error("JSON load failed");
  return res.json();
};
// Seed DB (for populating the db)
const populateDatabase = async (data) => {
  const store = transaction("readwrite");
  await Promise.all(
    data.map(
      (item) =>
        new Promise((resolve, reject) => {
          const req = store.add(item);
          req.onsuccess = resolve;
          req.onerror = () => reject(req.error);
        })
    )
  );
};
// Rendering on home page
function renderCards(data) {
  if (!cardsGrid) return;
  if (!data || data.length == 0) {
    cardsGrid.innerHTML = `<p>No destinations found.</p>`;
    return;
  }
  cardsGrid.innerHTML = data.map(
      (item) => 
        `<div class="card" data-id="${item.id}">
        <div class="card-image">
          <img src="${item.img}" alt="${item.name}" loading="lazy">
        </div>
        <div class="card-info">
          <p class="card-price">${item.price}</p>
          <p class="card-name">${item.name}</p>
        </div>
        <div class="card-description">${item.description}</div>
      </div>`
    )
    .join("");
}
// Load & render
async function loadAndRenderDestinations() {
  try {
    let list = await getAllDestinations();
    if (list.length === 0) {
      const seed = await fetchFromJson();
      await populateDatabase(seed);
      list = await getAllDestinations();
    }
    renderCards(list);
  } catch (err) {
    console.error(err);
    cardsGrid.innerHTML = `<p>Failed to load destinations.</p>`;
  }
}
// Init (for rendering it first time).
async function init() {
  try {
    await openDatabase();
    await loadAndRenderDestinations();
  } catch (err) {
    console.error("Init error", err);
    cardsGrid.innerHTML = `<p>Failed to initialize.</p>`;
  }
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}