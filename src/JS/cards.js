function renderCards(data) {
  const cardsGrid = document.getElementById("cardsGrid");
  if (!cardsGrid) return;

  if (!data || data.length === 0) {
    cardsGrid.innerHTML = `<p>No destinations found.</p>`;
    return;
  }

  const isManagementPage = window.location.pathname.includes("/pages/destinations.html");
  const imgBase = isManagementPage ? "../assets/images/" : "./assets/images/";

  const resolveImg = (img) => {
    if (!img) return "";
    if (img.startsWith("http")) return img;
    if (img.startsWith("./assets") || img.startsWith("../assets")) return img;
    return `${imgBase}${img}`;
  };

  cardsGrid.innerHTML = data
    .map(
      (item) => `
      <div class="card" data-id="${item.id}">
        <div class="card-image">
          <img src="${resolveImg(item.img)}" alt="${item.name}">
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

const setStatus = (msg, isError = false) => {
  const el = document.getElementById("crudStatus");
  if (!el) return;
  el.textContent = msg;
  el.style.color = isError ? "crimson" : "inherit";
};

const readForm = () => ({
  id: document.getElementById("destId")?.value
    ? Number(document.getElementById("destId").value)
    : undefined,
  name: document.getElementById("destName")?.value?.trim(),
  price: document.getElementById("destPrice")?.value?.trim(),
  img: document.getElementById("destImg")?.value?.trim(),
  description: document.getElementById("destDescription")?.value?.trim(),
});

const clearForm = () => {
  const form = document.getElementById("destinationForm");
  if (form) form.reset();
  setStatus("Ready.");
};

const bindUI = () => {
  const isManagementPage = window.location.pathname.includes("/pages/destinations.html");
  if (!isManagementPage) return;

  const createBtn = document.getElementById("createBtn");
  const updateBtn = document.getElementById("updateBtn");
  const deleteBtn = document.getElementById("deleteBtn");
  const resetBtn = document.getElementById("resetBtn");
  const refreshBtn = document.getElementById("refreshBtn");

  // CREATE
  createBtn?.addEventListener("click", async () => {
    const { name, price, img, description } = readForm();
    if (!name || !price || !img || !description)
      return setStatus("All fields except ID are required.", true);

    try {
      await window.destinationsAPI.add({ name, price, img, description });
      clearForm();
      setStatus("Added successfully.");
    } catch {
      setStatus("Add failed.", true);
    }
  });

  // UPDATE
  updateBtn?.addEventListener("click", async () => {
    const { id, name, price, img, description } = readForm();
    if (!id) return setStatus("ID required for update.", true);

    try {
      await window.destinationsAPI.update(id, { name, price, img, description });
      clearForm();
      setStatus("Updated successfully.");
    } catch {
      setStatus("Update failed.", true);
    }
  });

  // DELETE
  deleteBtn?.addEventListener("click", async () => {
    const { id } = readForm();
    if (!id) return setStatus("ID required for delete.", true);

    try {
      await window.destinationsAPI.remove(id);
      clearForm();
      setStatus("Deleted successfully.");
    } catch {
      setStatus("Delete failed.", true);
    }
  });

  // RESET
  resetBtn?.addEventListener("click", async () => {
    try {
      await clearDatabase();
      const seed = await fetch(DATA_URL).then((r) => r.json());
      await populateDatabase(seed);
      await window.destinationsAPI.get().then(renderCards);
      clearForm();
      setStatus("Reset successfully.");
    } catch {
      setStatus("Reset failed.", true);
    }
  });

  // REFRESH
  refreshBtn?.addEventListener("click", async () => {
    try {
      const data = await window.destinationsAPI.get();
      renderCards(data);
      setStatus("Refreshed.");
    } catch {
      setStatus("Refresh failed.", true);
    }
  });
};

document.addEventListener("DOMContentLoaded", bindUI);
