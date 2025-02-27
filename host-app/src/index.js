// You can write your own logic here to determine the actual url
window.reactAppUrl = "http://localhost:3002"
window.reactAppViteUrl = "http://localhost:3005"
window.vueAppUrl = "http://localhost:3004"

// Use dynamic import here to allow webpack to interface with module federation code
import("./bootstrap");
