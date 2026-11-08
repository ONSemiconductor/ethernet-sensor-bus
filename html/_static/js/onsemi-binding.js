/**
 * Copyright (c) 2024 onsemi
 * SPDX-License-Identifier: Apache-2.0
 *
 * Turns each `.onsemi-proptabs` group of `.onsemi-proptab` panels into a
 * tabbed control (Node-specific / Deprecated / Base properties). Degrades
 * gracefully: without JS, every panel (and its label) stays visible.
 */
(function () {
  function initGroup(group) {
    var panels = Array.prototype.filter.call(
      group.children,
      function (child) {
        return child.classList && child.classList.contains("onsemi-proptab");
      }
    );
    if (panels.length < 1) {
      return;
    }

    var bar = document.createElement("div");
    bar.className = "onsemi-proptab-bar";
    bar.setAttribute("role", "tablist");

    function activate(index) {
      panels.forEach(function (panel, i) {
        var selected = i === index;
        panel.classList.toggle("active", selected);
        var button = bar.children[i];
        button.classList.toggle("active", selected);
        button.setAttribute("aria-selected", selected ? "true" : "false");
        button.setAttribute("tabindex", selected ? "0" : "-1");
      });
    }

    panels.forEach(function (panel, i) {
      var labelEl = panel.querySelector(".onsemi-proptab-label");
      var label = labelEl ? labelEl.textContent.trim() : "Tab " + (i + 1);
      if (labelEl) {
        labelEl.style.display = "none";
      }
      var button = document.createElement("button");
      button.type = "button";
      button.className = "onsemi-proptab-btn";
      button.setAttribute("role", "tab");
      button.textContent = label;
      button.addEventListener("click", function () {
        activate(i);
      });
      bar.appendChild(button);
    });

    group.insertBefore(bar, panels[0]);
    group.classList.add("onsemi-tabs-ready");
    activate(0);
  }

  document.addEventListener("DOMContentLoaded", function () {
    document.querySelectorAll(".onsemi-proptabs").forEach(initGroup);
  });
})();
