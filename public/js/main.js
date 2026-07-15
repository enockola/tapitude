const menuToggle = document.querySelector("[data-menu-toggle]");
const menu = document.querySelector("[data-menu]");

if (menuToggle && menu) {
  menuToggle.addEventListener("click", () => {
    const isOpen = menu.classList.toggle("is-open");
    menuToggle.setAttribute("aria-expanded", String(isOpen));
    menuToggle.setAttribute(
      "aria-label",
      isOpen ? "Close navigation menu" : "Open navigation menu"
    );
  });
}

/*
==========================================
==========================================
UTILS
==========================================
==========================================
*/


async function showDialog({
  description,
  confirmText = "Ok",
  danger = false,
  onConfirm = null
}) {
  const dialog = document.createElement("dialog");

  if (onConfirm) {//Confirmation box
    dialog.innerHTML = `
    <p>${description}</p>

    <form method="dialog" class="button_panel">
      <button value="cancel">Cancel</button>
      <button
        value="confirm"
        class="${danger ? "danger" : ""}"
      >
        ${confirmText}
      </button>
    </form>
  `;
  } else { //Simple alert
    dialog.innerHTML = `
    <p>${description}</p>
    <form method="dialog" class="button_panel">
      <button value="cancel"> ${confirmText}</button>
    </form>
  `;
  }

  document.body.appendChild(dialog);

  const result = await new Promise(resolve => {
    dialog.addEventListener(
      "close",
      () => resolve(dialog.returnValue),
      { once: true }
    );

    dialog.showModal();
  });

  dialog.remove();

  if (result === "confirm") {
    await onConfirm();
    return true;
  }

  return false;
}

/*
==========================================
==========================================
TIMEZONE UTILS
==========================================
==========================================
*/

function formatEtDateTime(value) {
  if (!value) {
    return "No date";
  }

  return new Intl.DateTimeFormat("en-US", {
    timeZone: "America/New_York",
    month: "numeric",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(new Date(value)) + " ET";
}