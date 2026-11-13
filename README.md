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

## 💻 Guía de Instalación y Ejecución

Sigue estos pasos para poner en marcha tanto el backend como el frontend en tu entorno local.

### 1. Configuración y Ejecución del Backend (Spring Boot)

1. **Clonar el repositorio del backend:**
   ```bash
   git clone https://github.com/juanignacio08/sigte-backend.git
   ```
2. Crea en ***PostgreSQL*** una base de datos con el nombre **bd_sigte**. (solo una base de datos sencilla).
```sql
CREATE DATABASE bd_sigte;
```

3. Cambia a la rama ***dev*** del proyecto desde un editor de codigo como **IntelliJ IDEA**. **(IMPORTANTE!!)**

4. Entra a la carpeta **resource** (*./src/main/resources*) y busca el archivo **application.yaml.example**

5. Renómbralo a **application.yaml** y configura tus credenciales locales de PostgreSql (DB_USERNAME, DB_PASSWORD, MAIL_USERNAME y MAIL_PASSWORD). **modifica únicamente estos 4 campos** con tus datos:

* `spring.datasource.username`: Usuario de tu base de datos PostgreSQL (ej. `postgres`).
* **`spring.datasource.password`** 🔴 **(Crucial):** Contraseña de acceso a tu base de datos.
* `spring.mail.username`: Tu dirección de correo electrónico para el envío de notificaciones.
* **`spring.mail.password`** 🔴 **(Crucial):** **Contraseña de aplicación** de tu correo.

> **Nota importante sobre el correo:** Si usas Gmail u otro proveedor con verificación en dos pasos, **no** coloques tu contraseña habitual. Debes generar una **contraseña de aplicación** de 16 caracteres desde la configuración de seguridad de tu cuenta y pegarla aquí.

5. Ejecuta el proyecto desde tu IDE (*ir a ./src/main/java/unsch/fcsa/sigte/* encontraras el archivo **SigteApplication.java** habrelo y ejecutalo) o consola. (El backend correrá por defecto en http://localhost:8080).

6. Si ejecuto correctamente prueba desde postman o el navegador la siguiente url: http://localhost:8080/sigte/api/v1/departamentos/listarPorFacultad/1  deberia de devolver algo como esto.

```json
{
    "data": [
        {
            "id": 1,
            "facultadId": 1,
            "abreviatura": "DAENF",
            "denominacion": "Departamento Académico de Enfermería",
            "estado": 1,
            "totalEscuelas": 1
        }
    ],
    "message": "Lista de departamentos académicos",
    "status": "success",
    "code": "200"
}
```

### 2. Clonar y configurar el Frontend (Angular)
1. Clona este repositoriO:
   ```bash
   git clone https://github.com/juanignacio08/sigte-frontend.git
    ```
    
2. Cámbiate a la rama **dev** (IMPORTANTE!!), te recomiendo que lo hagas desde visual studio code.

3. Instala las dependencias:
   ```bash
   npm install
    ```
3. Importante: Abre el archivo src/environments/environment.ts y environment.development.ts y asegúrate de que useMock esté en false (si es que existe, si no hay no hacer nada):
```ts
export const environment = {
  production: false,
  useMock: false, // <--- Desactiva los mocks para usar el backend real
  apiUrl: 'http://localhost:8080/sigte/api/v1'
};
```

4. Inicia el servidor:
```bash
npm start
```
5. Abre http://localhost:4200 en tu navegador.
