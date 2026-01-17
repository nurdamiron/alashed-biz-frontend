# 🚀 Быстрый деплой на Vercel

## ⚡ Что изменилось

- ✅ Обновлены PWA иконки (ваш логотип слеш + молния)
- ✅ Настроен Service Worker
- ✅ Offline кэширование работает
- ✅ iOS PWA готов

---

## 📦 Деплой (3 простых шага)

### Шаг 1: Commit и Push

```bash
cd /Users/nurdauletakhmatov/Desktop/alashed-biz/alashed-biz-frontend

git add .
git commit -m "feat: update PWA icons with new logo"
git push
```

### Шаг 2: Vercel автоматически задеплоит

Заходите на [https://vercel.com](https://vercel.com) и смотрите прогресс деплоя.

Или вручную: Deployments → Redeploy

### Шаг 3: Тестируйте на iPhone

1. Safari → `https://alashed-biz-frontend.vercel.app`
2. Поделиться → "На экран Домой"
3. Готово! 📱

---

## 🔍 После деплоя

### Проверьте что работает:

✅ Новая иконка на домашнем экране
✅ Полноэкранный режим (без Safari UI)
✅ Черный фон при запуске
✅ Название "ALASHED" под иконкой

---

## ⏭️ Следующий шаг

Соединить с бэкендом на EC2:

См. файл `QUICK_START.md`

---

**Удачи!** 🚀
