# FlowEnglish

Aprende inglés desde tu vida real. App personal con IA.

---

## Cómo publicar en Vercel (5 minutos)

### Paso 1 — Sube el proyecto a GitHub

1. Ve a github.com → botón verde "New" → crea un repo llamado `flowenglish`
2. Abre una terminal en tu PC y ejecuta:

```bash
cd flowenglish
git init
git add .
git commit -m "primera versión"
git remote add origin https://github.com/TU_USUARIO/flowenglish.git
git push -u origin main
```

### Paso 2 — Conecta con Vercel

1. Ve a vercel.com → "Sign up" → elige "Continue with GitHub"
2. Una vez dentro: "Add New Project" → selecciona el repo `flowenglish`
3. En la sección "Environment Variables" agrega:
   - **Name:** `ANTHROPIC_API_KEY`
   - **Value:** tu API key (empieza con `sk-ant-...`)
4. Click en "Deploy"

✅ En 2 minutos Vercel te da una URL pública como `flowenglish.vercel.app`

---

## Cómo correrlo localmente (opcional)

```bash
npm install
cp .env.local.example .env.local
# Edita .env.local y agrega tu API key
npm run dev
```

Abre http://localhost:3000

---

## Obtener tu API key de Anthropic

1. Ve a console.anthropic.com
2. Crea una cuenta gratuita
3. En "API Keys" → "Create Key"
4. Copia la key (empieza con `sk-ant-`)

---

## Estructura del proyecto

```
flowenglish/
├── src/app/
│   ├── page.js          # La app completa
│   ├── layout.js        # Layout base
│   └── api/chat/
│       └── route.js     # Servidor que habla con Claude
├── .env.local           # Tu API key (no se sube a GitHub)
└── package.json
```
