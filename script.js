const page = document.querySelector(".page");
const orbTop = document.querySelector(".orb-top");
const orbBottom = document.querySelector(".orb-bottom");
const balanceCard = document.querySelector(".balance-card");
const sideCards = document.querySelectorAll(".side-card");

let introFinished = false;

const isHomePage = document.body.classList.contains("home-page");

setTimeout(() => {
  introFinished = true;
}, isHomePage ? 2400 : 1200);

if (page) {
  page.addEventListener("mousemove", (e) => {
    if (!introFinished) return;

    const x = (e.clientX / window.innerWidth - 0.5) * 20;
    const y = (e.clientY / window.innerHeight - 0.5) * 20;

    if (orbTop) {
      orbTop.style.transform = `translateX(calc(-50% + ${x * 0.35}px)) translateY(${y * 0.10}px)`;
    }

    if (orbBottom) {
      orbBottom.style.transform = `translateX(calc(-50% + ${x * -0.28}px)) translateY(${y * 0.15}px)`;
    }

    if (balanceCard) {
      balanceCard.style.transform = `translate(${x * 0.14}px, ${y * 0.14}px)`;
    }

    sideCards.forEach((card, index) => {
      const factor = 0.08 + index * 0.01;
      card.style.transform = `translate(${x * factor}px, ${y * factor}px)`;
    });
  });

  page.addEventListener("mouseleave", () => {
    if (!introFinished) return;

    if (orbTop) orbTop.style.transform = "translateX(-50%) translateY(0px)";
    if (orbBottom) orbBottom.style.transform = "translateX(-50%) translateY(0px)";
    if (balanceCard) balanceCard.style.transform = "translate(0px, 0px)";

    sideCards.forEach((card) => {
      card.style.transform = "translate(0px, 0px)";
    });
  });
}

const scrollRevealItems = document.querySelectorAll(".reveal-on-scroll");

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add("in-view");
    }
  });
}, {
  threshold: 0.15
});

scrollRevealItems.forEach((item) => {
  revealObserver.observe(item);
});

const onlineCountEl = document.getElementById("onlineCount");
const onlineBtn = document.getElementById("onlineBtn");
const modalOnlineCount = document.getElementById("modalOnlineCount");
const onlineUsersList = document.getElementById("onlineUsersList");
const onlineModal = document.getElementById("onlineModal");
const onlineCloseBtn = document.getElementById("onlineCloseBtn");
const onlineModalBackdrop = document.getElementById("onlineModalBackdrop");

const socket = io();

function getVisitorId() {
  let visitorId = localStorage.getItem("visitorId");

  if (!visitorId) {
    visitorId = "visitor_" + Math.random().toString(36).slice(2) + Date.now().toString(36);
    localStorage.setItem("visitorId", visitorId);
  }

  return visitorId;
}

function renderOnlineUsers(users) {
  if (!onlineUsersList) return;

  if (!users || users.length === 0) {
    onlineUsersList.innerHTML = `<li class="online-empty">No users online</li>`;
    return;
  }

  onlineUsersList.innerHTML = users
    .map((user) => `<li class="online-user-item">${user}</li>`)
    .join("");
}

function openOnlineModal() {
  if (onlineModal) {
    onlineModal.classList.add("active");
  }
}

function closeOnlineModal() {
  if (onlineModal) {
    onlineModal.classList.remove("active");
  }
}

socket.on("connect", () => {
  const visitorId = getVisitorId();
  socket.emit("registerVisitor", visitorId);
  console.log("Socket connected:", socket.id, visitorId);
});

socket.on("onlineData", (data) => {
  console.log("onlineData:", data);

  if (onlineCountEl) {
    onlineCountEl.textContent = data.count;
  }

  if (modalOnlineCount) {
    modalOnlineCount.textContent = data.count;
  }

  renderOnlineUsers(data.users);
});

if (onlineBtn) {
  onlineBtn.addEventListener("click", (e) => {
    e.preventDefault();
    openOnlineModal();
  });
}

if (onlineCloseBtn) {
  onlineCloseBtn.addEventListener("click", closeOnlineModal);
}

if (onlineModalBackdrop) {
  onlineModalBackdrop.addEventListener("click", closeOnlineModal);
}

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    closeOnlineModal();
  }
});