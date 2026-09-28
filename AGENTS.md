# Contexto y Guía para Agentes de IA - front.pagaloseguro.com

Este archivo contiene la arquitectura, convenciones, comandos clave y directrices para agentes de IA (Antigravity, Gemini, Copilot, etc.) que trabajen en este repositorio.

---

## 1. Visión General del Proyecto

`front.pagaloseguro.com` es la aplicación web (SPA) del frontend para **Págalo Seguro** y la plataforma de ahorro **PASE (Programa de Ahorro y Sistemática Especial)**.

- **Tecnología Principal:** Angular 19 (`@angular/core` `^19.2.0`)
- **Lenguaje:** TypeScript (`~5.7.2`)
- **Estilos:** SCSS (Sass)
- **Manejo de Estado / Reactividad:** RxJS (`~7.8.0`) y Zone.js (`~0.15.0`)
- **Testing:** Karma + Jasmine
- **Gestor de Paquetes:** `npm`

---

## 2. Estructura del Proyecto

La estructura del código fuente dentro de `src/app/` sigue un patrón modular por características (Feature Modules) y un núcleo centralizado (`core`):

```text
src/
├── app/
│   ├── core/                        # Singleton logic & global infrastructure
│   │   ├── components/              # Componentes globales (ej. modales, diálogos)
│   │   ├── guards/                  # Protecciones de rutas (authGuard, pase-dashboard.guard)
│   │   ├── interceptors/            # authInterceptor (inyección de Bearer Token JWT)
│   │   └── services/                # Servicios de API HTTP (Auth, Ahorro, Abonos, User, etc.)
│   ├── home/                        # Módulo público / Landing / Autenticación
│   │   ├── components/
│   │   ├── home-layout/
│   │   ├── pages/
│   │   ├── home-routing.module.ts
│   │   └── home.module.ts
│   ├── pase/                        # Módulo privado de la Plataforma PASE
│   │   ├── components/
│   │   ├── pages/                   # Páginas de usuario (Saver), ejecutivo y administrador
│   │   ├── pase-layout/
│   │   ├── pase-routing.module.ts
│   │   └── pase.module.ts
│   ├── app.component.ts
│   ├── app.config.ts                # Configuración global (Providers, Router, HttpClient Interceptors)
│   └── app.routes.ts                # Rutas raíz y carga perezosa (Lazy Loading)
├── environments/
│   ├── environment.ts               # Configuración de desarrollo (dev-api.pagaloseguro.com)
│   └── environment.prod.ts          # Configuración de producción (api.pagaloseguro.com)
└── styles.scss                      # Estilos globales y utilidades
```

---

## 3. Arquitectura y Patrones de Diseño

### 3.1 Carga Perezosa (Lazy Loading)
- La ruta raíz `''` carga diferidamente `HomeModule`.
- La ruta `'pase'` carga diferidamente `PaseModule` y está protegida por `authGuard`.

### 3.2 Capa de Servicios (`src/app/core/services/`)
- `AuthService`: Gestión de tokens JWT, login, sesión de usuario.
- `AhorroService` / `AbonosService` / `CicloService` / `SemanasService`: Gestión de operaciones financieras y ciclos de ahorro.
- `UserService`: Administración de perfiles y usuarios.
- `DialogService` / `EvidenciasService` / `CatalogService`: Servicios auxiliares e interfaz de usuario.

### 3.3 Autenticación e Interceptores
- **Interceptor:** `authInterceptor` (`src/app/core/interceptors/auth.interceptor.ts`) intercepta las peticiones HTTP e incluye el token JWT recuperado de `localStorage` en los headers de autorización (`Bearer <token>`).
- **Guards:** `authGuard` redirige a la página principal si el usuario no cuenta con una sesión válida.

---

## 4. Entornos y Despliegue CI/CD

### Entornos
- **Desarrollo:** API en `https://dev-api.pagaloseguro.com`
- **Producción:** API en `https://api.pagaloseguro.com`

### Workflows de GitHub Actions (`.github/workflows/`)
- `deploy-dev.yml`: Se ejecuta en cada push a la rama `dev`. Realiza la compilación del proyecto y despliega mediante FTP hacia el servidor de desarrollo (`195.35.10.186`).
- `deploy.yaml`: Despliegue a producción.

---

## 5. Comandos de Desarrollo

| Comando | Descripción |
| :--- | :--- |
| `npm install` | Instala las dependencias del proyecto. |
| `npm start` / `ng serve` | Inicia el servidor de desarrollo local. |
| `npm run build` / `ng build` | Compila la aplicación para producción en `dist/`. |
| `npm run watch` | Compila en modo desarrollo con observador de cambios. |
| `npm run test` | Ejecuta las pruebas unitarias mediante Karma. |

---

## 6. Reglas e Instrucciones para Agentes de IA

Al realizar cambios o proponer código en este proyecto:

1. **Cumplimiento estricto con Angular 19:**
   - Respetar el uso de `app.config.ts` para proveedores globales.
   - Utilizar funciones inyectables o decoradores acordes a Angular 19.
2. **Separación de Responsabilidades:**
   - No colocar lógica de llamadas HTTP directamente en componentes; delegar siempre en los servicios de `src/app/core/services/`.
3. **Manejo de Estilos SCSS:**
   - Importar `@import '../../../../styles.scss';` o utilidades compartidas si se requieren variables globales.
   - Mantener el encapsulamiento de estilos por componente (`component.scss`).
4. **Protección de Rutas y Seguridad:**
   - Asegurar que cualquier nueva ruta privada dentro de PASE esté protegida por los Guards correspondientes.
5. **Comprobación antes de declarar finalizado:**
   - Ejecutar `npm run build` o verificar sintaxis TypeScript para garantizar que el proyecto compila sin errores.
