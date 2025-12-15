const DB_NAME = "OdysseyDB";
const DB_VERSION = 1;
const STORE_NAME = "destinations";

// Detect if we're on the destinations management page
const isManagementPage = window.location.pathname.includes("/pages/destinations.html");
const DATA_URL = isManagementPage ? "../assets/data/destinations.json" : "./assets/data/destinations.json";

let db;
let cardsGrid;
const transaction = (mode) => db.transaction(STORE_NAME, mode).objectStore(STORE_NAME);

// Status message helper (only on management page)
const setStatus = (msg, isError = false) => {
  const statusEl = document.getElementById("crudStatus");
  if (!statusEl) return;
  statusEl.textContent = msg;
  statusEl.style.color = isError ? "crimson" : "inherit";
};

function openDatabase() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onerror = () => reject(req.error);
    req.onsuccess = () => { db = req.result; resolve(db); };
    req.onupgradeneeded = (e) => {
      const store = e.target.result.createObjectStore(STORE_NAME, { keyPath: "id", autoIncrement: true });
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
    req.onsuccess = () => { resolve(req.result); loadAndRenderDestinations(); };
    req.onerror = () => reject(req.error);
  });

const updateDestination = (id, updates) =>
  new Promise((resolve, reject) => {
    const store = transaction("readwrite");
    const getReq = store.get(id);
    getReq.onsuccess = () => {
      if (!getReq.result) return reject(new Error("Not found"));
      const putReq = store.put({ ...getReq.result, ...updates });
      putReq.onsuccess = () => { resolve(putReq.result); loadAndRenderDestinations(); };
      putReq.onerror = () => reject(putReq.error);
    };
    getReq.onerror = () => reject(getReq.error);
  });

const deleteDestination = (id) =>
  new Promise((resolve, reject) => {
    const req = transaction("readwrite").delete(id);
    req.onsuccess = () => { resolve(); loadAndRenderDestinations(); };
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

function renderCards(data) {
  if (!cardsGrid) return;
  if (!data || data.length === 0) {
    cardsGrid.innerHTML = `<p>No destinations found.</p>`;
    return;
  }
 
  const imgBase = isManagementPage ? "../assets/images/" : "./assets/images/";
  const resolveImg = (img) => {
    if (!img) return "";
    if (img.startsWith("http://") || img.startsWith("https://")) return img;
    if (img.startsWith("./assets/") || img.startsWith("../assets/")) return img;
    return `${imgBase}${img}`;
  };
  cardsGrid.innerHTML = data
    .map(
      (item) => `
        <div class="card" data-id="${item.id ?? ""}">
          <div class="card-image">
            <img src="${resolveImg(item.img)}" alt="${item.name}" loading="lazy">
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

// Form handlers (only on management page)
const readForm = () => ({
  id: document.getElementById("destId")?.value ? Number(document.getElementById("destId").value) : undefined,
  name: document.getElementById("destName")?.value?.trim(),
  price: document.getElementById("destPrice")?.value?.trim(),
  img: document.getElementById("destImg")?.value?.trim(),
  description: document.getElementById("destDescription")?.value?.trim()
});

const clearForm = () => {
  const form = document.getElementById("destinationForm");
  if (form) form.reset();
  setStatus("Ready.");
};

const bindUI = () => {
  if (!isManagementPage) return;

  const createBtn = document.getElementById("createBtn");
  const updateBtn = document.getElementById("updateBtn");
  const deleteBtn = document.getElementById("deleteBtn");
  const resetBtn = document.getElementById("resetBtn");
  const refreshBtn = document.getElementById("refreshBtn");

  createBtn?.addEventListener("click", async () => {
    const { name, price, img, description } = readForm();
    if (!name || !price || !img || !description) {
      setStatus("All fields (except ID) are required.", true);
      return;
    }
    try {
      await addDestination({ name, price, img, description });
      clearForm();
      setStatus("Destination added successfully!");
    } catch (err) {
      console.error(err);
      setStatus("Failed to add destination.", true);
    }
  });

  updateBtn?.addEventListener("click", async () => {
    const { id, name, price, img, description } = readForm();
    if (!id) {
      setStatus("ID required for update.", true);
      return;
    }
    try {
      await updateDestination(id, { name, price, img, description });
      clearForm();
      setStatus("Destination updated successfully!");
    } catch (err) {
      console.error(err);
      setStatus("Failed to update destination.", true);
    }
  });

  deleteBtn?.addEventListener("click", async () => {
    const { id } = readForm();
    if (!id) {
      setStatus("ID required for delete.", true);
      return;
    }
    try {
      await deleteDestination(id);
      clearForm();
      setStatus("Destination deleted successfully!");
    } catch (err) {
      console.error(err);
      setStatus("Failed to delete destination.", true);
    }
  });

  resetBtn?.addEventListener("click", async () => {
    try {
      await clearDatabase();
      const seed = await fetchFromJson();
      await populateDatabase(seed);
      await loadAndRenderDestinations();
      clearForm();
      setStatus("Reset to defaults successful!");
    } catch (err) {
      console.error(err);
      setStatus("Reset failed.", true);
    }
  });

  refreshBtn?.addEventListener("click", async () => {
    try {
      await loadAndRenderDestinations();
      setStatus("Refreshed.");
    } catch (err) {
      console.error(err);
      setStatus("Refresh failed.", true);
    }
  });
};

async function init() {
  try {
    cardsGrid = document.getElementById("cardsGrid");
    if (!cardsGrid) {
      console.error("cardsGrid element not found");
      return;
    }
    await openDatabase();
    bindUI();
    await loadAndRenderDestinations();
  } catch (err) {
    console.error("Init error", err);
    if (cardsGrid) {
      cardsGrid.innerHTML = `<p>Failed to initialize.</p>`;
    }
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