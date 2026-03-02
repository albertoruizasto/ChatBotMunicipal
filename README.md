# 🏛️ ChatBot Municipal

Portal ciudadano digital con asistente virtual integrado a n8n. Construido con React + TypeScript + Vite, Supabase Auth y TailwindCSS.

---

## ✨ Características

- **Autenticación** — Email/password y Google OAuth vía Supabase
- **Registro en 3 pasos** — Datos de cuenta, personales y dirección
- **Dashboard protegido** — Con sidebar colapsable y roles de usuario
- **Chat tipo WhatsApp** — Historial desde Supabase, integración con webhook n8n
- **Protección de rutas** — Por rol: ciudadano, funcionario, administrador

---

## 🚀 Deploy en Vercel

### 1. Importar el repositorio

1. Ir a [vercel.com/new](https://vercel.com/new)
2. Conectar con GitHub y seleccionar **ChatBotMunicipal**
3. Vercel detecta automáticamente el framework (Vite)

### 2. Configurar variables de entorno

En **Project Settings → Environment Variables**, agregar:

| Variable | Descripción | Ejemplo |
|---|---|---|
| `VITE_SUPABASE_URL` | URL del proyecto Supabase | `https://xxxx.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | Clave pública anónima de Supabase | `eyJhbGci...` |
| `VITE_GOOGLE_CLIENT_ID` | Client ID de Google OAuth | `xxxx.apps.googleusercontent.com` |
| `VITE_API_URL` | URL base de la API o webhook de n8n | `https://your-n8n.com/webhook/...` |

> ⚠️ Nunca subas el archivo `.env` al repositorio. Ya está en `.gitignore`.

### 3. Configurar Supabase para producción

En **Supabase → Authentication → URL Configuration**:

```
Site URL:          https://tu-proyecto.vercel.app
Redirect URLs:     https://tu-proyecto.vercel.app/auth/callback
```

### 4. Configurar Google OAuth para producción

En **Google Cloud Console → APIs & Services → Credentials**:

- **Authorized JavaScript origins:** `https://tu-proyecto.vercel.app`
- **Authorized redirect URIs:** `https://tu-proyecto.vercel.app/auth/callback`

### 5. Deploy

Vercel hace deploy automáticamente en cada push a `main`. El build usa:

```
Build Command:   npm run build
Output Dir:      dist
Install Command: npm install
```

---

## 🛠️ Desarrollo local

### Requisitos

- Node.js 18+
- npm 9+
- Cuenta en [Supabase](https://supabase.com)

### Instalación

```bash
# Clonar el repositorio
git clone https://github.com/albertoruizasto/ChatBotMunicipal.git
cd ChatBotMunicipal

# Instalar dependencias
npm install

# Copiar variables de entorno
cp .env.example .env
# Editar .env con tus credenciales reales
```

### Variables de entorno (`.env`)

```env
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu-anon-key
VITE_GOOGLE_CLIENT_ID=tu-client-id.apps.googleusercontent.com
VITE_API_URL=https://tu-n8n.com/webhook/municipal-chat
```

### Comandos disponibles

```bash
npm run dev          # Servidor de desarrollo en http://localhost:5173
npm run build        # Build de producción
npm run preview      # Preview del build de producción
npm run type-check   # Verificar tipos TypeScript sin compilar
npm run lint         # Linting con ESLint
```

---

## 🗄️ Base de datos (Supabase)

Ejecutar el archivo SQL en **Supabase → SQL Editor**:

```
supabase/migrations/001_initial_schema.sql
```

Crea las tablas con Row Level Security (RLS):

| Tabla | Descripción |
|---|---|
| `profiles` | Datos extendidos del usuario (rol, DNI, dirección) |
| `conversations` | Sesiones del chatbot |
| `messages` | Mensajes individuales (user / assistant / system) |

Para crear el primer administrador:

```sql
UPDATE public.profiles
SET role = 'admin'
WHERE email = 'tu-email@dominio.com';
```

---

## 📁 Estructura del proyecto

```
src/
├── components/
│   ├── auth/          # ProtectedRoute
│   ├── chat/          # MessageBubble, MessageInput, TypingIndicator, ConversationList
│   ├── dashboard/     # DashboardLayout, Sidebar, DashboardHeader
│   ├── layout/        # Layout público, Navbar, Footer
│   └── ui/            # Button, Input
├── contexts/          # AuthContext (AuthProvider + useAuth)
├── hooks/             # useConversations, useMessages
├── lib/               # Cliente Supabase
├── pages/
│   ├── auth/          # AuthCallbackPage (OAuth redirect)
│   ├── dashboard/     # OverviewPage, ChatPage
│   └── ...            # Login, Register, Home, 404
├── services/          # auth.service, chat.service + webhook n8n
└── types/             # Tipos TypeScript globales
supabase/
└── migrations/        # Schema SQL inicial
```

---

## 🔗 Stack tecnológico

| Tecnología | Versión | Uso |
|---|---|---|
| React | 18 | UI |
| TypeScript | 5.6 | Tipado estático |
| Vite | 7 | Bundler |
| TailwindCSS | 4 | Estilos |
| Supabase | 2.47 | Auth + Base de datos |
| React Router | 6 | Enrutamiento |
| React Hook Form | 7 | Formularios |
| Zod | 3 | Validación de esquemas |
| n8n | — | Orquestación del chatbot (webhook) |
