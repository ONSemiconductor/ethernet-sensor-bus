/**
 * Copyright (c) 2024 onsemi
 * SPDX-License-Identifier: Apache-2.0
 *
 * Client-side filtering for the onsemi board catalog. Filters the board cards
 * by name, architecture, vendor and SoC using the data-* attributes rendered
 * by board-card.html.
 */

function onsemiGetFilters() {
  return {
    name: (document.getElementById("onsemi-board-name")?.value || "").trim().toLowerCase(),
    arch: document.getElementById("onsemi-board-arch")?.value || "",
    vendor: document.getElementById("onsemi-board-vendor")?.value || "",
    soc: document.getElementById("onsemi-board-soc")?.value || "",
    status: document.getElementById("onsemi-board-status")?.value || "",
  };
}

function onsemiFilterBoards() {
  const filters = onsemiGetFilters();
  const cards = document.querySelectorAll("#onsemi-catalog .onsemi-board-card");
  let matches = 0;

  cards.forEach((card) => {
    const name = (card.dataset.name || "").toLowerCase();
    const archs = (card.dataset.arch || "").split(/\s+/).filter(Boolean);
    const vendor = card.dataset.vendor || "";
    const socs = (card.dataset.socs || "").split(/\s+/).filter(Boolean);

    const supported = card.dataset.supported || "";

    const matchesName = !filters.name || name.includes(filters.name);
    const matchesArch = !filters.arch || archs.includes(filters.arch);
    const matchesVendor = !filters.vendor || vendor === filters.vendor;
    const matchesSoc = !filters.soc || socs.includes(filters.soc);
    const matchesStatus = !filters.status || supported === filters.status;

    if (matchesName && matchesArch && matchesVendor && matchesSoc && matchesStatus) {
      card.classList.remove("onsemi-hidden");
      matches += 1;
    } else {
      card.classList.add("onsemi-hidden");
    }
  });

  onsemiUpdateMatchCount(matches, cards.length);
}

function onsemiUpdateMatchCount(matches, total) {
  const el = document.getElementById("onsemi-nb-matches");
  if (!el) return;
  el.textContent =
    matches === total
      ? `Showing all ${total} board${total === 1 ? "" : "s"}`
      : `Showing ${matches} of ${total} boards`;
}

function onsemiResetForm() {
  const name = document.getElementById("onsemi-board-name");
  const arch = document.getElementById("onsemi-board-arch");
  const vendor = document.getElementById("onsemi-board-vendor");
  const soc = document.getElementById("onsemi-board-soc");
  const status = document.getElementById("onsemi-board-status");
  if (name) name.value = "";
  if (arch) arch.value = "";
  if (vendor) vendor.value = "";
  if (soc) soc.value = "";
  if (status) status.value = "";
  onsemiFilterBoards();
}

document.addEventListener("DOMContentLoaded", () => {
  const cards = document.querySelectorAll("#onsemi-catalog .onsemi-board-card");
  onsemiUpdateMatchCount(cards.length, cards.length);
});
