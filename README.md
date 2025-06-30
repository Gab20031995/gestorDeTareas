![LOGO ULEAD](https://github.com/user-attachments/assets/6f54a45a-9049-4952-8bd9-ffe2d4983bf3)

# **2025- II Programación Web**
# **Entregable grupal #1**

## Profesor: Alejandro Zamora Esquivel

Alumnos:
- Gabriel Corrales Mora.
- Jeralin Mayerlin Flores Hernández.
- Jean Rabbat Sánchez.


# **FasTaks: Gestor de Tareas Kanban**


## **1\. Introducción**

FasTaks es una aplicación web sencilla pero funcional para la gestión de tareas, implementando un tablero Kanban básico. Permite a los usuarios organizar tareas en diferentes estados (Por Hacer, En Progreso, Hecho), crear nuevas tareas, editarlas, moverlas entre estados y eliminarlas. El diseño se centra en la usabilidad y la responsividad, adaptándose a diferentes tamaños de pantalla.

## **2\. Tecnologías Utilizadas**

### **Frontend: HTML, CSS, JS**

* **HTML:** Estructura de la aplicación, incluyendo la barra de navegación, el tablero Kanban y el modal de tareas.  
* **CSS:** Estilizado moderno, con un tema oscuro y componentes con bordes redondeados. Incluye reglas de flexbox para el diseño responsivo de las columnas del tablero y @media queries para la adaptación a dispositivos móviles.  
* **Js:** Lógica del lado del cliente. Maneja la interacción del usuario, la comunicación con el backend a través de fetch API, la manipulación del DOM, el arrastrar y soltar (Drag and Drop) para mover tareas y la gestión del modal de creación/edición.

### **Backend: FastAPI (Python)**

* **FastAPI:** Framework web moderno y de alto rendimiento para construir APIs con Python. Proporciona validación de datos automática con Pydantic y una excelente documentación interactiva (Swagger UI/ReDoc).  
* **Pydantic:** Utilizado para definir la estructura de los datos de las tareas (Tarea BaseModel), asegurando que los datos recibidos y enviados por la API sean consistentes y válidos.  
* **Uvicorn:** Servidor ASGI de alta velocidad utilizado para ejecutar la aplicación FastAPI.  
* **mysql.connector:** Conector oficial de MySQL para Python, utilizado para interactuar con la base de datos.

### **Base de Datos: MySQL**

* **MySQL:** Sistema de gestión de bases de datos relacionales utilizado para almacenar la información de las tareas.  
* **Estructura de la tabla** tasks:  
  * `id`: Clave primaria autoincremental.  
  * `taskname`: Nombre de la tarea.  
  * `taskdescription`: Descripción detallada.  
  * `taskpriority`: Prioridad de la tarea (Low, Medium, High).  
  * `taskdeadline`: Fecha límite de la tarea.  
  * `status`: Estado actual de la tarea (To Do, In Progress, Done).

## **3\. Arquitectura y Diseño**

La aplicación sigue una arquitectura cliente-servidor (Frontend-Backend):

* **Frontend (Navegador):** Carga el archivo index.html que a su vez carga styles.css y script.js. Toda la lógica de presentación y la interacción directa con el usuario se maneja aquí. Se comunica con el backend a través de solicitudes HTTP (GET, POST, PUT, DELETE).  
* **Backend (FastAPI):** Expone una API RESTful. Recibe solicitudes del frontend, interactúa con la base de datos MySQL para realizar las operaciones CRUD y devuelve las respuestas al frontend.

### **Implementación CRUD (Crear, Leer, Actualizar, Eliminar)**

* **Crear (Create):**  
  * **Frontend:** El botón "Add Task" abre un modal. El formulario en el modal recopila los detalles de la tarea. Al enviar, se hace una solicitud POST a `/guardar-task` con los datos de la nueva tarea.  
  * **Backend:** El endpoint `@app.post("/guardar-task")` recibe los datos, valida con el modelo Tarea y los inserta en la tabla tasks de MySQL.  
* **Leer (Read):**  
  * **Frontend:** Al cargar la página (DOMContentLoaded) y después de cada operación CRUD, la función cargartarea() hace una solicitud GET a /tasks para obtener todas las tareas. Las tareas se renderizan dinámicamente en sus respectivas columnas.  
  * **Backend:** El endpoint `@app.get("/tasks")` consulta todas las tareas de la base de datos y las devuelve como una lista de objetos JSON.  
* **Actualizar (Update):**  
  * **Frontend:**  
    * **Cambio de Estado:** Las tarjetas de tarea son arrastrables. Al soltar una tarjeta en otra columna, o al usar los botones de "Mover a...", se dispara una solicitud PUT a `/tasks/{task\_id}` con el nuevo estado.  
    * **Edición de Tarea:** El botón "Edit" en cada tarjeta abre el mismo modal de creación, pero lo precarga con los datos de la tarea seleccionada y cambia el texto del botón de envío a "Update Task". Al enviar el formulario en modo edición, se hace una solicitud PUT a `/tasks/{task\_id}` con todos los datos actualizados de la tarea.  
  * **Backend:** El endpoint `@app.put("/tasks/{task\_id}")` recibe el ID de la tarea y los datos actualizados, y realiza una operación UPDATE en la base de datos.  
* **Eliminar (Delete):**  
  * **Frontend:** El botón "Delete" en cada tarjeta de tarea, después de una confirmación (usando `confirm()`), envía una solicitud DELETE a `/tasks/{task\_id}`.  
  * **Backend:** El endpoint `@app.delete("/tasks/{task\_id}")` recibe el ID de la tarea y realiza una operación DELETE en la base de datos.

### **Diseño Responsivo y Estilizado**

* **CSS:** Se utiliza un tema oscuro (\#2c2f33 y variantes para los elementos) para una estética moderna y agradable a la vista.  
* **Flexbox:** El layout principal del kanban-board y las .column utiliza display: flex para una distribución flexible y responsiva de las columnas, que ocupan todo el ancho disponible.  
* **Media Queries:** Se utilizan @media (max-width: 768px) para adaptar el diseño en pantallas más pequeñas (teléfonos y tablets). Las columnas se apilan verticalmente, y los elementos del formulario dentro del modal también se ajustan para una mejor visualización.  
* **Experiencia de Usuario:** Animaciones sutiles en los botones y tarjetas, y un indicador visual de "drag-over" para las columnas.

## **4\. Configuración y Ejecución**

Para ejecutar la aplicación:

1. **Asegúrate de tener Python, Pip y MySQL instalados** en tu sistema.  
2. **Configura tu servidor MySQL:** Asegúrate de que MySQL esté en ejecución en `localhost:3307` y que las credenciales `user='root'`, `password='123Queso.'` sean válidas y tengan permisos para crear bases de datos y tablas, en caso de que no debes de cambiar a tu user y password.  
3. **Clona o descarga el proyecto.**  
4. **Abre una terminal** en el directorio raíz del proyecto.  
5. **Crea un entorno virtual** (si no lo has hecho):  
   `python \-m venv venv`

6. **Activa el entorno virtual:**  
   * **Windows (PowerShell):** `& .\\venv\\Scripts\\activate`  
   * **macOS/Linux:** source `venv/bin/activate  `
     
7. **Instala las dependencias de Python:**  
   `pip install \-r requirements.txt`

8. **Inicia el servidor FastAPI (backend):**  
   `uvicorn main:app \--reload \--port 8000`

   Deja esta terminal abierta y observando los logs. El backend creará automáticamente la base de datos tareas y la tabla tasks la primera vez que se conecte si no existen.  
9. **Abre el archivo** index.html en tu navegador web.

¡Ahora podrás interactuar con tu gestor de tareas FasTaks\!
