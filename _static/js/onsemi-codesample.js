/**
 * Copyright (c) 2024 onsemi
 * SPDX-License-Identifier: Apache-2.0
 *
 * Live filtering for onsemi code-sample listings. Adapted from Zephyr's
 * codesample-livesearch.js.
 */

function filterSamples(input) {
  const searchQuery = input.value.toLowerCase();
  const container = input.closest(".code-sample-listing");

  function removeHighlights(element) {
    if (!element) return;
    const marks = element.querySelectorAll("mark");
    marks.forEach((mark) => {
      const parent = mark.parentNode;
      while (mark.firstChild) {
        parent.insertBefore(mark.firstChild, mark);
      }
      parent.removeChild(mark);
      parent.normalize();
    });
  }

  function highlightMatches(node, query) {
    if (!node) return;
    if (node.nodeType === Node.TEXT_NODE) {
      const text = node.textContent;
      const index = text.toLowerCase().indexOf(query);
      if (index !== -1 && query.length > 0) {
        const fragment = document.createDocumentFragment();
        fragment.appendChild(document.createTextNode(text.substring(0, index)));
        const highlight = document.createElement("mark");
        highlight.textContent = text.substring(index, index + query.length);
        fragment.appendChild(highlight);
        fragment.appendChild(document.createTextNode(text.substring(index + query.length)));
        node.parentNode.replaceChild(fragment, node);
      }
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      node.childNodes.forEach((child) => highlightMatches(child, query));
    }
  }

  function processSection(section) {
    let sectionVisible = false;
    const lists = section.querySelectorAll(":scope > ul.code-sample-list");
    const childSections = section.querySelectorAll(":scope > section");

    lists.forEach((list) => {
      let listVisible = false;
      const items = list.querySelectorAll("li");

      items.forEach((item) => {
        const nameElement = item.querySelector(".code-sample-name");
        const descElement = item.querySelector(".code-sample-description");

        removeHighlights(nameElement);
        removeHighlights(descElement);

        const sampleName = nameElement ? nameElement.textContent.toLowerCase() : "";
        const sampleDescription = descElement ? descElement.textContent.toLowerCase() : "";

        if (sampleName.includes(searchQuery) || sampleDescription.includes(searchQuery)) {
          if (searchQuery) {
            highlightMatches(nameElement, searchQuery);
            highlightMatches(descElement, searchQuery);
          }
          item.style.display = "";
          listVisible = true;
          sectionVisible = true;
        } else {
          item.style.display = "none";
        }
      });

      list.style.display = listVisible ? "" : "none";
    });

    childSections.forEach((childSection) => {
      if (processSection(childSection)) {
        sectionVisible = true;
      }
    });

    const heading = section.querySelector(
      ":scope > h2, :scope > h3, :scope > h4, :scope > h5, :scope > h6"
    );
    if (sectionVisible) {
      if (heading) heading.style.display = "";
      section.style.display = "";
    } else {
      if (heading) heading.style.display = "none";
      section.style.display = "none";
    }

    return sectionVisible;
  }

  processSection(container);

  input.style.display = "";
  container.style.display = "";
}
