import { createApp } from "vue";
import Dashboard from "./components/Dashboard.vue";
import App from "./App.vue";
import Login from "./components/Login.vue";
import { createRouter, createWebHistory } from "vue-router";
import "bootstrap/dist/css/bootstrap.css"; // Import the Bootstrap CSS

const routes = [
  {
    name: "DasboardPage",
    path: "/",
    component: Dashboard,
    meta: {
      needAuth: true,
    },
  },
  {
    name: "loginPage",
    path: "/login",
    component: Login,
    meta: {
      needAuth: false,
    },
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// Authentication middleware using Navigation Guards
router.beforeEach((to, from, next) => {
  let isAuthenticated = false; // Replace with your actual authentication check logic
  let token = localStorage.getItem("token");
  if (token) isAuthenticated = true;

  const requiresAuth = to.matched.some((record) => record.meta.needAuth);
  if (requiresAuth && !isAuthenticated) {
    next("/login");
  }
  next();
});
const app = createApp(App);
app.use(router);
app.mount("#app");
