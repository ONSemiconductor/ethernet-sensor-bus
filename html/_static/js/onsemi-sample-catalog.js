/**
 * Copyright (c) 2024 onsemi
 * SPDX-License-Identifier: Apache-2.0
 *
 * Client-side search/filter for the Sample Applications landing page. Filters
 * the sample cards by free-text (name / description / tags) and category using
 * the data-* attributes emitted by the samples index generator.
 */

function onsemiFilterSamples() {
  var query = (document.getElementById("onsemi-sample-name")?.value || "")
    .trim()
    .toLowerCase();
  var category = document.getElementById("onsemi-sample-category")?.value || "";
  var cards = document.querySelectorAll(
    "#onsemi-sample-catalog .onsemi-sample-card"
  );
  var matches = 0;

  cards.forEach(function (card) {
    var haystack = [
      card.dataset.name || "",
      card.dataset.desc || "",
      card.dataset.tags || "",
    ]
      .join(" ")
      .toLowerCase();
    var matchesQuery = !query || haystack.indexOf(query) !== -1;
    var matchesCategory = !category || card.dataset.category === category;

    if (matchesQuery && matchesCategory) {
      card.classList.remove("onsemi-hidden");
      matches += 1;
    } else {
      card.classList.add("onsemi-hidden");
    }
  });

  onsemiUpdateSampleCount(matches, cards.length);
}

function onsemiUpdateSampleCount(matches, total) {
  var el = document.getElementById("onsemi-sample-nb-matches");
  if (!el) {
    return;
  }
  el.textContent =
    matches === total
      ? "Showing all " + total + " sample" + (total === 1 ? "" : "s")
      : "Showing " + matches + " of " + total + " samples";
}

function onsemiResetSampleFilters() {
  var name = document.getElementById("onsemi-sample-name");
  var category = document.getElementById("onsemi-sample-category");
  if (name) {
    name.value = "";
  }
  if (category) {
    category.value = "";
  }
  onsemiFilterSamples();
}

document.addEventListener("DOMContentLoaded", function () {
  var cards = document.querySelectorAll(
    "#onsemi-sample-catalog .onsemi-sample-card"
  );
  onsemiUpdateSampleCount(cards.length, cards.length);
});
