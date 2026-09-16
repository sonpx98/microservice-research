import "@testing-library/jest-dom/vitest";

// jsdom has no layout, so scrollIntoView is undefined — stub it for components that auto-scroll.
if (typeof Element !== "undefined" && !Element.prototype.scrollIntoView) {
  Element.prototype.scrollIntoView = () => {};
}
