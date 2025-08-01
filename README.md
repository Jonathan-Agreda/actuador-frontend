# 🌐 Actuador Frontend

Interfaz web en tiempo real para el sistema de gestión de actuadores centralizados (Lora + Gateway). Esta aplicación permite monitorear y controlar remotamente múltiples dispositivos conectados mediante una arquitectura moderna con WebSockets, filtros inteligentes y visualización en mapa.

---

## 🚀 Tecnologías utilizadas

- [Next.js 14](https://nextjs.org/) – App Router
- [Tailwind CSS 4](https://tailwindcss.com/)
- [Zustand](https://zustand-demo.pmnd.rs/) – manejo de estado global
- [TanStack Query](https://tanstack.com/query) – fetching de datos y caché
- [Leaflet](https://leafletjs.com/) – visualización de dispositivos en mapa
- [html2canvas](https://html2canvas.hertzen.com/) + [jsPDF](https://github.com/parallax/jsPDF) – generación de carnets con QR
- [WebSocket](https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API) – actualización en tiempo real

---

## ⚙️ Instalación local

```bash
git clone https://github.com/tu-usuario/actuador-frontend.git
cd actuador-frontend
npm install
npm run dev
```

Accede desde: [http://localhost:3000](http://localhost:3000)

---

## 🔧 Variables de entorno

Crea un archivo `.env.local` con las siguientes variables:

```env
NEXT_PUBLIC_API_WS_URL=http://localhost:4000
```

---

## 🧩 Estructura del proyecto

```
/app                # Rutas Next.js
/components         # Componentes reutilizables
/hooks              # Custom hooks (React Query, filtros, etc.)
/lib                # Config global (Axios, WebSocket, etc.)
/types              # Tipos globales (TypeScript)
/utils              # Funciones utilitarias (íconos, formateo, etc.)
```

---

## 📦 Funcionalidades

- 🔍 Filtros por estado (Lora, Gateway, motor)
- 🧠 Vista en modo árbol o tarjetas
- 📍 Mapa con geolocalización de actuadores
- 🧰 Control ON/OFF y reinicio de Gateways
- 🧑‍🤝‍🧑 Agrupación por grupos de actuadores
- 🕓 Programación de encendido/apagado
- 📄 Exportación de carnet QR como PDF o imagen
- 🔔 Alertas por Gateway caído (sonido, vibración, notificación)

---

## 📦 Backend relacionado

Este frontend se comunica con el backend:  
👉 [`actuador-backend`](https://github.com/tu-usuario/actuador-backend)

---

## 📝 Licencia

Este proyecto está bajo la licencia MIT. Puedes modificarlo y reutilizarlo libremente.
