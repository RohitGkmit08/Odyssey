const DB_NAME = "OdysseyDB";
const DB_VERSION = 1;
const STORE_NAME = "destinations";
const isManagementPage = window.location.pathname.includes("/pages/destinations.html");
const DATA_URL = isManagementPage? "../assets/data/destinations.json": "./assets/data/destinations.json";

let db;
let cardsGrid;

const transaction = (mode) => db.transaction(STORE_NAME, mode).objectStore(STORE_NAME);

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
        autoIncrement: true,
      });
      store.createIndex("name", "name");
    };
  });
}

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
      if (!getReq.result) return reject(new Error("Not found"));
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

const fetchFromJson = async () => {
  const res = await fetch(DATA_URL);
  if (!res.ok) throw new Error("JSON load failed");
  return res.json();
};

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

const clearDatabase = () =>
  new Promise((resolve, reject) => {
    const req = transaction("readwrite").clear();
    req.onsuccess = resolve;
    req.onerror = () => reject(req.error);
  });

async function loadAndRenderDestinations() {
  try {
    let list = await getAllDestinations();

    if (list.length === 0) {
      const seed = await fetchFromJson();
      await populateDatabase(seed);
      list = await getAllDestinations();
    }

    renderCards(list); // renderCards comes from cards.js
  } catch (err) {
    console.error(err);
    if (cardsGrid) cardsGrid.innerHTML = `<p>Failed to load destinations.</p>`;
  }
}

async function init() {
  try {
    cardsGrid = document.getElementById("cardsGrid");
    if (!cardsGrid) return;

    await openDatabase();
    await loadAndRenderDestinations();
  } catch (err) {
    console.error("Init failed", err);
  }
}

window.destinationsAPI = {
  get: getAllDestinations,
  add: addDestination,
  update: updateDestination,
  remove: deleteDestination,
};

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
