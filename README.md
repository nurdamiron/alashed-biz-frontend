# 🚀 ALASHED Business Frontend

> React + TypeScript PWA для управления бизнесом, адаптированный под новый DDD backend

## ✅ Что реализовано (Foundation - Phase 1)

### Базовая структура
- ✅ Vite + React 19 + TypeScript
- ✅ Tailwind CSS (CDN)
- ✅ Material Symbols Icons
- ✅ React Router (HashRouter)

### Core компоненты
- ✅ Icon.tsx - Material Symbols wrapper
- ✅ Loading.tsx - Loading spinner с анимацией
- ✅ BottomNav.tsx - Mobile navigation

### State Management
- ✅ AppContext с stale-while-revalidate кешированием
- ✅ WebSocket real-time updates
- ✅ Auto-refresh JWT tokens

### API Integration
- ✅ API client адаптирован под новый DDD backend
- ✅ WebSocket client с auto-reconnect
- ✅ ИИН/БИН валидация

## 🚀 Запуск

```bash
npm install
npm run dev
```

Открыть: http://localhost:5173/

## 📁 Структура

```
src/
├── components/     ✅ UI компоненты
├── context/        ✅ State management
├── lib/            ✅ API, WebSocket, validators
├── types/          ✅ TypeScript DTOs
└── App.tsx         ✅ Роутинг
```

## 🎨 Design System

**Сохранен полностью из старого проекта:**
- Pure black dark mode (#000000)
- Glassmorphism (backdrop-blur)
- Material Symbols Icons
- Extreme rounded corners (40px)

## 📚 Документация

- COMPONENT_PLAN.md - Детальный план
- FRONTEND_MIGRATION_PLAN.md - План миграции

---

**Dev server:** http://localhost:5173/
**Backend API:** http://localhost:3000
**WebSocket:** ws://localhost:3000/ws
