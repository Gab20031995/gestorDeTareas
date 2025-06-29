document.addEventListener('DOMContentLoaded', () => {
    const addTaskBtn = document.getElementById('add-task-btn');
    const addTaskModal = document.getElementById('add-task-modal');
    const closeButton = addTaskModal.querySelector('.close-button');
    const cancelTaskBtn = document.getElementById('cancel-task-btn');
    const taskForm = document.getElementById('task-form');
    const mensaje = document.getElementById('mensaje');

    const todoTaskList = document.querySelector('#todo-column .task-list');
    const inProgressTaskList = document.querySelector('#inprogress-column .task-list');
    const doneTaskList = document.querySelector('#done-column .task-list');

    const todoCount = document.querySelector('#todo-column .task-count');
    const inProgressCount = document.querySelector('#inprogress-column .task-count');
    const doneCount = document.querySelector('#done-column .task-count');

    let tasks = [];

    async function cargartarea() {
        try {
            const respuesta = await fetch("http://localhost:8000/tasks");
            const datos = await respuesta.json();
            tasks = datos.map(t => ({
                id: t.id,
                name: t.taskname,
                description: t.taskdescription,
                priority: t.taskpriority,
                deadline: t.taskdeadline,
                status: t.status
            }));
            renderTasks();
        } catch (error) {
            console.error("Error al cargar tareas:", error);
        }
    }

    function updateTaskCounts() {
        todoCount.textContent = todoTaskList.children.length;
        inProgressCount.textContent = inProgressTaskList.children.length;
        doneCount.textContent = doneTaskList.children.length;
    }

    function createTaskCard(task) {
        const taskCard = document.createElement('div');
        taskCard.classList.add('task-card');
        taskCard.dataset.id = task.id;
        taskCard.dataset.status = task.status;
        taskCard.draggable = true;

        const titleStyle = task.status === 'Done' ? 'style="text-decoration: line-through; color: #6c757d;"' : '';

        taskCard.innerHTML = `
            <h3 ${titleStyle}>${task.name}</h3>
            <p>${task.description || 'No description provided.'}</p>
            <div class="task-meta">
                <span class="task-priority ${task.priority}">${task.priority}</span>
                <span class="task-deadline">${task.deadline || 'No Deadline'}</span>
            </div>
            <div class="task-actions">
                ${task.status !== 'In Progress' ? '<button class="move-to-inprogress-btn button button-secondary button-sm">In Progress</button>' : ''}
                ${task.status !== 'Done' ? '<button class="move-to-done-btn button button-primary button-sm">Done</button>' : ''}
                ${task.status !== 'To Do' ? '<button class="move-to-todo-btn button button-secondary button-sm">To Do</button>' : ''}
                <button class="delete-task-btn button button-danger button-sm">Delete</button>
            </div>
        `;

        taskCard.addEventListener('dragstart', e => {
            e.dataTransfer.setData('text/plain', task.id);
            setTimeout(() => taskCard.classList.add('dragging'), 0);
        });

        taskCard.addEventListener('dragend', () => {
            taskCard.classList.remove('dragging');
        });

        taskCard.querySelector('.move-to-inprogress-btn')?.addEventListener('click', () => moveTask(task.id, 'In Progress'));
        taskCard.querySelector('.move-to-done-btn')?.addEventListener('click', () => moveTask(task.id, 'Done'));
        taskCard.querySelector('.move-to-todo-btn')?.addEventListener('click', () => moveTask(task.id, 'To Do'));
        taskCard.querySelector('.delete-task-btn').addEventListener('click', () => deleteTask(task.id));

        return taskCard;
    }

    function renderTasks() {
        todoTaskList.innerHTML = '';
        inProgressTaskList.innerHTML = '';
        doneTaskList.innerHTML = '';

        tasks.forEach(task => {
            const taskCard = createTaskCard(task);
            if (task.status === 'To Do') {
                todoTaskList.appendChild(taskCard);
            } else if (task.status === 'In Progress') {
                inProgressTaskList.appendChild(taskCard);
            } else if (task.status === 'Done') {
                doneTaskList.appendChild(taskCard);
            }
        });

        updateTaskCounts();
    }

    function moveTask(taskId, newStatus) {
        const taskIndex = tasks.findIndex(task => task.id === taskId);
        if (taskIndex !== -1) {
            tasks[taskIndex].status = newStatus;
            renderTasks();
        }
    }

    function deleteTask(taskId) {
        if (confirm('¿Estás seguro de que quieres eliminar esta tarea?')) {
            tasks = tasks.filter(task => task.id !== taskId);
            renderTasks();
        }
    }

    addTaskBtn.addEventListener('click', () => {
        addTaskModal.style.display = 'flex';
    });

    closeButton.addEventListener('click', () => {
        addTaskModal.style.display = 'none';
        taskForm.reset();
    });

    cancelTaskBtn.addEventListener('click', () => {
        addTaskModal.style.display = 'none';
        taskForm.reset();
    });

    window.addEventListener('click', (event) => {
        if (event.target === addTaskModal) {
            addTaskModal.style.display = 'none';
            taskForm.reset();
        }
    });

    taskForm.addEventListener('submit', async function (event) {
        event.preventDefault();

        const taskName = document.getElementById('task-name').value;
        const taskDescription = document.getElementById('task-description').value;
        const taskPriority = document.getElementById('task-priority').value;
        const taskDeadline = document.getElementById('task-deadline').value;

        const newTask = {
            name: taskName,
            description: taskDescription,
            priority: taskPriority,
            deadline: taskDeadline,
            status: 'To Do'
        };

        try {
            const respuesta = await fetch("http://localhost:8000/guardar-task", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    taskname: newTask.name,
                    taskdescription: newTask.description,
                    taskpriority: newTask.priority,
                    taskdeadline: newTask.deadline,
                    status: newTask.status
                })
            });

            const resultado = await respuesta.json();
            mensaje.textContent = resultado.mensaje;
            mensaje.style.color = "green";

            await cargartarea(); // Recarga las tareas desde la base de datos
            addTaskModal.style.display = 'none';
            taskForm.reset();
        } catch (error) {
            mensaje.textContent = "Error al guardar tarea.";
            mensaje.style.color = "red";
        }
    });

    const columns = document.querySelectorAll('.task-list');
    const statusMap = {
        'todo-column': 'To Do',
        'inprogress-column': 'In Progress',
        'done-column': 'Done'
    };

    columns.forEach(column => {
        column.addEventListener('dragover', e => {
            e.preventDefault();
            column.classList.add('drag-over');
        });

        column.addEventListener('dragleave', () => {
            column.classList.remove('drag-over');
        });

        column.addEventListener('drop', e => {
            e.preventDefault();
            column.classList.remove('drag-over');
            const taskId = parseInt(e.dataTransfer.getData('text/plain'));
            const newStatus = statusMap[column.parentElement.id];
            moveTask(taskId, newStatus);
        });
    });

    cargartarea(); // Carga inicial
});
