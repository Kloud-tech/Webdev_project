import { createRouter, createWebHistory } from 'vue-router'

import AppShell from '../components/AppShell.vue'
import pinia from '../stores/index.js'
import { useAuthStore } from '../stores/auth.js'
import DashboardView from '../views/DashboardView.vue'
import LandingView from '../views/LandingView.vue'
import LoginView from '../views/LoginView.vue'
import ProfileView from '../views/ProfileView.vue'
import RegisterView from '../views/RegisterView.vue'
import TradeFormView from '../views/TradeFormView.vue'
import TradesView from '../views/TradesView.vue'
import VerifyEmailView from '../views/VerifyEmailView.vue'

const routes = [
  {
    path: '/',
    name: 'landing',
    component: LandingView,
    meta: {
      title: 'Accueil',
    },
  },
  {
    path: '/login',
    name: 'login',
    component: LoginView,
    meta: {
      title: 'Connexion',
    },
  },
  {
    path: '/register',
    name: 'register',
    component: RegisterView,
    meta: {
      title: 'Inscription',
    },
  },
  {
    path: '/verify-email',
    name: 'verify-email',
    component: VerifyEmailView,
    meta: {
      title: 'Validation email',
    },
  },
  {
    path: '/app',
    component: AppShell,
    meta: {
      requiresAuth: true,
    },
    children: [
      {
        path: '',
        redirect: '/app/dashboard',
      },
      {
        path: 'dashboard',
        name: 'dashboard',
        component: DashboardView,
        meta: {
          title: 'Dashboard',
          requiresAuth: true,
        },
      },
      {
        path: 'trades',
        name: 'trades',
        component: TradesView,
        meta: {
          title: 'Trades',
          requiresAuth: true,
        },
      },
      {
        path: 'trades/new',
        name: 'trade-new',
        component: TradeFormView,
        meta: {
          title: 'Nouveau trade',
          requiresAuth: true,
        },
      },
      {
        path: 'trades/:id/edit',
        name: 'trade-edit',
        component: TradeFormView,
        meta: {
          title: 'Modifier le trade',
          requiresAuth: true,
        },
      },
      {
        path: 'profile',
        name: 'profile',
        component: ProfileView,
        meta: {
          title: 'Profil',
          requiresAuth: true,
        },
      },
    ],
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

router.beforeEach(async (to) => {
  const authStore = useAuthStore(pinia)

  if (!authStore.initialized) {
    await authStore.restoreSession()
  }

  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    return {
      path: '/login',
      query: { redirect: to.fullPath },
    }
  }

  if (to.meta.guestOnly && authStore.isAuthenticated) {
    return '/app/dashboard'
  }

  return true
})

export default router
