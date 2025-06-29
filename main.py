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
    return mysql.connector.connect(
        host="localhost",
        port=3306,
        user="root",
        password="0818Jeank*",
        database="tareas"
    )

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