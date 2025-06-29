from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import mysql.connector

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class Tarea(BaseModel):
    taskname: str
    taskdescription: str
    taskpriority: str
    taskdeadline: str
    status: str

def conectar_db():
    db = None
    cursor = None
    try:
        # Primero intenta conectar al servidor MySQL sin especificar una base de datos
        # para poder crearla si no existe

        db_server = mysql.connector.connect(
            host="localhost",
            port=3307, #Cambiar puerto a 3306 o 3307 dependiendo de que tenga
            user="root", #Cambia el Usuario
            password="123Queso." #Cambia la contrasela
        )
        cursor_server = db_server.cursor()

        # Crea la base de datos 'tareas' si no existe
        cursor_server.execute("CREATE DATABASE IF NOT EXISTS tareas")
        db_server.commit()
        cursor_server.close()
        db_server.close()

        # Acá se conecta a la base de datos 'tareas'
        db = mysql.connector.connect(
            host="localhost",
            port=3307,
            user="root",
            password="123Queso.",
            database="tareas"
        )
        cursor = db.cursor()

        # Crea la tabla 'tasks' si no existe
        create_table_sql = """
        CREATE TABLE IF NOT EXISTS tasks (
            id INT AUTO_INCREMENT PRIMARY KEY,
            taskname VARCHAR(255) NOT NULL,
            taskdescription TEXT,
            taskpriority VARCHAR(50),
            taskdeadline DATE,
            status VARCHAR(50)
        );
        """
        cursor.execute(create_table_sql)
        db.commit()
        cursor.close()
        return db # Retorna la conexión a la base de datos 'tareas'
    except mysql.connector.Error as err:
        print(f"Error de conexión o creación en la base de datos: {err}")
        if db and db.is_connected():
            db.close()
        raise # Reenvia el error para que FastAPI sepa que algo salió mal


@app.post("/guardar-task")
def guardar_tarea(tarea: Tarea):
    db = conectar_db()
    cursor = db.cursor()
    sql = """
    INSERT INTO tasks (taskname, taskdescription, taskpriority, taskdeadline, status)
    VALUES (%s, %s, %s, %s, %s)
    """
    valores = (tarea.taskname, tarea.taskdescription, tarea.taskpriority, tarea.taskdeadline, tarea.status)
    cursor.execute(sql, valores)
    db.commit()
    cursor.close()
    db.close()
    return {"mensaje": "Task guardada con éxito"}

@app.get("/tasks")
def obtener_tareas():
    db = conectar_db()
    cursor = db.cursor(dictionary=True)
    cursor.execute("SELECT * FROM tasks")
    tareas = cursor.fetchall()
    cursor.close()
    db.close()
    return tareas


@app.put("/tasks/{task_id}")
def actualizar_tarea(task_id: int, tarea: Tarea):
    db = conectar_db()
    cursor = db.cursor()
    sql = """
        UPDATE tasks
        SET taskname = %s, taskdescription = %s, taskpriority = %s, taskdeadline = %s, status = %s
        WHERE id = %s
    """
    valores = (
        tarea.taskname,
        tarea.taskdescription,
        tarea.taskpriority,
        tarea.taskdeadline,
        tarea.status,
        task_id
    )
    cursor.execute(sql, valores)
    db.commit()
    cursor.close()
    db.close()
    return {"mensaje": f"Tarea con ID {task_id} actualizada"}

@app.delete("/tasks/{task_id}")
def eliminar_tarea(task_id: int):
    db = conectar_db()
    cursor = db.cursor()
    sql = "DELETE FROM tasks WHERE id = %s"
    cursor.execute(sql, (task_id,))
    db.commit()
    cursor.close()
    db.close()
    return {"mensaje": f"Tarea con ID {task_id} eliminada"}