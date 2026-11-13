# SIGTE - Sistema de Gestión de Tesis

🌐 **[Ver Demo en Vivo (Mocks)](https://sigte-frontend.vercel.app)** 

Este proyecto es el frontend del Sistema de Gestión de Tesis (SIGTE), desarrollado para la Facultad de Ciencias de la Salud. Está construido con **Angular 22** y consume una API REST desarrollada en **Spring Boot**.

## 🚧 Estado del Proyecto: En Desarrollo (Avance)

**Importante:** Este sistema **no se encuentra terminado**. Actualmente cuenta con los módulos base funcionales, pero continúo en el desarrollo de nuevas características y la integración completa con el backend. 
*   **Lo que ya está funcional:** CRUDs de organización académica, gestión de personas (docentes/estudiantes), flujo de tesis, generación de documentos y arquitectura de simulación de datos.
*   **En desarrollo:** Reportes avanzados, optimización de consultas en base de datos, validaciones complejas y algunos módulos de configuración.

## ⚠️ Nota importante sobre las ramas y el despliegue

Para facilitar la revisión del proyecto sin necesidad de levantar un servidor backend local, el repositorio está estructurado de la siguiente manera:

*   **Rama `main` (Despliegue en Vercel):** Esta rama es la que se visualiza en el enlace de la demo. Utiliza una **capa de simulación (Mocks) a través de un Interceptor HTTP**. Esto permite probar toda la interfaz, los CRUDs, la paginación y la generación de documentos (PDF/Word) sin necesidad de una base de datos. *Los datos se reinician al recargar la página.*
*   **Rama `dev` (Flujo real):** Si deseas probar la lógica de negocio real, validaciones y persistencia en base de datos, debes clonar esta rama y ejecutarla junto con el backend.

## 🚀 Características principales
*   **Gestión completa:** CRUDs de Departamentos, Escuelas, Docentes, Estudiantes, Tesis y Comisiones.
*   **Generación de Documentos:** Simulación y descarga de archivos PDF y Word.
*   **UI/UX Moderna:** Interfaz construida con Tailwind CSS y Optimus UI (tablas paginadas, modales, dashboards).
*   **Patrón Interceptor:** Separación limpia de responsabilidades para alternar entre el entorno de desarrollo (Mock) y producción (API Real).

---

## 💻 Cómo probar el flujo COMPLETO (Frontend + Backend)

Si quieres ver el sistema funcionando al 100% con base de datos, sigue estos pasos:

### 1. Clonar y configurar el Backend (Spring Boot)
1. Clona el repositorio del backend: 
   ```bash
   git clone https://github.com/juanignacio08/sigte-backend.git

2. Entra a la carpeta y busca el archivo application.yaml.example.
3. Renómbralo a application.yaml y configura tus credenciales locales de PostgreSql.
4. Ejecuta el proyecto desde tu IDE o consola. (El backend correrá por defecto en http://localhost:8080).

### 2. Clonar y configurar el Frontend (Angular)
1. Clona este repositorio y cámbiate a la rama dev:
   ```bash
   git clone https://github.com/juanignacio08/sigte-frontend.git
   cd sigte-frontend
   git checkout dev

2. Instala las dependencias:
   ```bash
   npm install

3. Importante: Abre el archivo src/environments/environment.ts y asegúrate de que useMock esté en false:
```ts
export const environment = {
  production: false,
  useMock: false, // <--- Desactiva los mocks para usar el backend real
  apiUrl: 'http://localhost:8080/sigte/api/v1'
};

4. Inicia el servidor:
```bash
npm start

5. Abre http://localhost:4200 en tu navegador.
