const cardsGrid = document.getElementById("cardsGrid");
const loader = document.getElementById("loader");
const sortSelect = document.getElementById("sortSelect");
const themeToggle = document.getElementById("themeToggle");
const burgerBtn = document.getElementById('burger');
const menu = document.getElementById('menu');
const favFilterBtn = document.getElementById("favFilterBtn");
const favItemsContainer = document.getElementById("fav-items-container");
const globalSearchInput = document.getElementById("searchInput");
const globalSearchBtn = document.getElementById("searchBtn");

let allCourses = [];
let showOnlyFavorites = false;

// ძებნა
const sitePages = {
  "მთავარი": "./index.html", "home": "./index.html", "main": "./index.html",
  "კურსები": "./cabinet.html", "faq": "./faq.html", "ფაქ": "./faq.html",
  "კითხვები": "./faq.html", "კონტაქტი": "./contact.html", "contact": "./contact.html",
  "კაბინეტი": "./cabinet.html", "cabinet": "./cabinet.html", "სტუდენტი": "./cabinet.html"
};

// მონაცემების წამოღება
async function fetchCourses() {
  if (!cardsGrid) return; 
  
  try {
    if (loader) loader.style.display = "flex";
    cardsGrid.innerHTML = "";
    await new Promise(resolve => setTimeout(resolve, 800));
    allCourses = [
      { id: 1, title: "ქართული ენა", rating: "4.8", image: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&q=80" },
      { id: 2, title: "მათემატიკა", rating: "4.9", image: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=400&q=80" },
      { id: 3, title: "ინგლისური ენა", rating: "4.7", image: "https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?w=400&q=80" },
      { id: 4, title: "რუსული ენა", rating: "4.3", image: "https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=400&q=80" },
      { id: 5, title: "ისტორია", rating: "4.6", image: "https://images.unsplash.com/photo-1461360370896-922624d12aa1?w=400&q=80" },
      { id: 6, title: "გეოგრაფია", rating: "4.5", image: "https://images.unsplash.com/photo-1524661135-423995f22d0b?w=400&q=80" }
    ];

    if (loader) loader.style.display = "none";

  // სორტირება
    allCourses.sort((a, b) => parseFloat(b.rating) - parseFloat(a.rating));
    
    filterAndSort();
    renderFavorites();

  } catch (error) {
    if (loader) loader.style.display = "none";
    cardsGrid.innerHTML = `<div class="error-container">⚠️ კურსების ჩატვირთვა ვერ მოხერხდა.</div>`;
    console.error(error);
  }
}

// ბარათები
function renderCourses(coursesList) {
  if (!cardsGrid) return;
  cardsGrid.innerHTML = "";
  
  const savedFavIds = JSON.parse(localStorage.getItem("dashboard_fav_ids")) || [];

  if (coursesList.length === 0) {
    cardsGrid.innerHTML = "<p style='grid-column: 1/-1; text-align:center; font-family: Poppins;'>საგნები ვერ მოიძებნა.</p>";
    return;
  }

  coursesList.forEach(course => {
    const isFav = savedFavIds.includes(course.id);
    const card = document.createElement("div");
    card.className = "course-card";
    card.innerHTML = `
      <img src="${course.image}" alt="${course.title}">
      <h3>${course.title}</h3>
      <div class="card-rating">⭐ ${course.rating}</div>
      <button class="fav-btn ${isFav ? 'active' : ''}" data-id="${course.id}" onclick="toggleFavorite(${course.id}, '${course.title}', '${course.image}', '${course.rating}')">
        ❤️ ${isFav ? 'ფავორიტებშია' : 'ფავორიტებში დამატება'}
      </button>
    `;
    cardsGrid.appendChild(card);
  });
}

window.toggleFavorite = function(id, title, image, rating) {
  let savedFavIds = JSON.parse(localStorage.getItem("dashboard_fav_ids")) || [];
  let savedFavDetails = JSON.parse(localStorage.getItem("dashboard_fav_details")) || [];

  if (savedFavIds.includes(id)) {
    savedFavIds = savedFavIds.filter(favId => favId !== id);
    savedFavDetails = savedFavDetails.filter(item => item.id !== id);
  } else {
    savedFavIds.push(id);
    savedFavDetails.push({ id, title, image, rating });
  }

  localStorage.setItem("dashboard_fav_ids", JSON.stringify(savedFavIds));
  localStorage.setItem("dashboard_fav_details", JSON.stringify(savedFavDetails));
  
  filterAndSort();
  renderFavorites();
};

function renderFavorites() {
  if (!favItemsContainer) return;
  
  const savedFavDetails = JSON.parse(localStorage.getItem("dashboard_fav_details")) || [];

  if (savedFavDetails.length === 0) {
    favItemsContainer.innerHTML = '<p class="empty-msg">ფავორიტები ცარიელია</p>';
    return;
  }

  favItemsContainer.innerHTML = savedFavDetails.map(item => `
    <div class="fav-item">
      <img src="${item.image}" alt="${item.title}">
      <div class="fav-item-info">
        <h4>${item.title}</h4>
        <p>რეიტინგი: ⭐ ${item.rating}</p>
      </div>
      <button class="remove-fav-btn" onclick="removeFavorite(${item.id})">
        <i class="fas fa-trash"></i> წაშლა
      </button>
    </div>
  `).join('');
}

window.removeFavorite = function(id) {
  let savedFavIds = JSON.parse(localStorage.getItem("dashboard_fav_ids")) || [];
  let savedFavDetails = JSON.parse(localStorage.getItem("dashboard_fav_details")) || [];

  savedFavIds = savedFavIds.filter(favId => favId !== id);
  savedFavDetails = savedFavDetails.filter(item => item.id !== id);

  localStorage.setItem("dashboard_fav_ids", JSON.stringify(savedFavIds));
  localStorage.setItem("dashboard_fav_details", JSON.stringify(savedFavDetails));

  filterAndSort();
  renderFavorites();
};

function filterAndSort() {
  let filtered = [...allCourses];

  if (showOnlyFavorites) {
    const savedFavIds = JSON.parse(localStorage.getItem("dashboard_fav_ids")) || [];
    filtered = filtered.filter(course => savedFavIds.includes(course.id));
  }

  if (sortSelect) {
    const sortValue = sortSelect.value;
    if (sortValue === "alphabet") {
      filtered.sort((a, b) => a.title.localeCompare(b.title, 'ka'));
    } else if (sortValue === "rating") {
      filtered.sort((a, b) => parseFloat(b.rating) - parseFloat(a.rating));
    }
  }

  renderCourses(filtered);
}

if (sortSelect) sortSelect.addEventListener("change", filterAndSort);

if (favFilterBtn) {
  favFilterBtn.addEventListener("click", () => {
    showOnlyFavorites = !showOnlyFavorites;
    favFilterBtn.textContent = showOnlyFavorites ? "ყველა კურსი" : "მხოლოდ ფავორიტები";
    favFilterBtn.style.backgroundColor = showOnlyFavorites ? "#ff4757" : "#f0f0f0";
    favFilterBtn.style.color = showOnlyFavorites ? "#fff" : "#333";
    filterAndSort();
  });
}

// ბურგერ მენიუ
if (burgerBtn && menu) {
  burgerBtn.addEventListener('click', () => menu.classList.toggle('active'));
}

// თემის გადამრთველი
if (themeToggle) {
  if (localStorage.getItem("theme") === "dark") {
    document.body.classList.add("dark");
    themeToggle.checked = true;
  }

  themeToggle.addEventListener("change", () => {
    document.body.classList.toggle("dark", themeToggle.checked);
    localStorage.setItem("theme", themeToggle.checked ? "dark" : "light");
  });
}

// FAQ
const accordionBox = document.querySelector(".acordion");
if (accordionBox) {
  accordionBox.addEventListener("click", function (event) {
    let list = event.target.closest(".acordion__list");
    if (!list) return;

    const allLists = document.querySelectorAll(".acordion__list");
    allLists.forEach((item) => {
      if (item !== list) item.classList.remove("list-opened");
    });

    list.classList.toggle("list-opened");
  });
}

// გვერდებზე გადასვლა
function performGlobalSearch() {
  if (!globalSearchInput) return;
  const query = globalSearchInput.value.trim().toLowerCase();
  if (query === "") return;

  let foundPage = null;
  for (let key in sitePages) {
    if (key.toLowerCase().includes(query) || query.includes(key.toLowerCase())) {
      foundPage = sitePages[key];
      break;
    }
  }

  if (foundPage) {
    window.location.href = foundPage;
  } else {
    alert("გვერდი ვერ მოიძებნა. სცადეთ: მთავარი, FAQ, კონტაქტი ან კაბინეტი.");
  }
}

if (globalSearchInput) {
  globalSearchInput.addEventListener("keypress", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      performGlobalSearch();
    }
  });
}

if (globalSearchBtn) {
  globalSearchBtn.addEventListener("click", (event) => {
    event.preventDefault();
    performGlobalSearch();
  });
}

fetchCourses();