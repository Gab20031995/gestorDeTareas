document.addEventListener('DOMContentLoaded', () => {
    const addTaskBtn = document.getElementById('add-task-btn');
    const addTaskModal = document.getElementById('add-task-modal');
    const closeButton = addTaskModal.querySelector('.close-button');
    const cancelTaskBtn = document.getElementById('cancel-task-btn');
    const taskForm = document.getElementById('task-form');
    const taskIdInput = document.getElementById('task-id');
    const modalTitle = document.getElementById('modal-title');
    const modalSubmitBtn = document.getElementById('modal-submit-btn');
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
            if (!respuesta.ok) {
                const errorText = await respuesta.text();
                throw new Error(`HTTP error! status: ${respuesta.status}, message: ${errorText}`);
            }
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
                <button class="edit-task-btn button button-info button-sm">Edit</button>
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

        taskCard.querySelector('.move-to-inprogress-btn')?.addEventListener('click', () => updateTaskStatus(task.id, 'In Progress'));
        taskCard.querySelector('.move-to-done-btn')?.addEventListener('click', () => updateTaskStatus(task.id, 'Done'));
        taskCard.querySelector('.move-to-todo-btn')?.addEventListener('click', () => updateTaskStatus(task.id, 'To Do'));
        taskCard.querySelector('.delete-task-btn').addEventListener('click', () => deleteTask(task.id));
        taskCard.querySelector('.edit-task-btn').addEventListener('click', () => openEditModal(task));

        return taskCard;
    }

    function openEditModal(task) {
        resetFormAndModal();
        modalTitle.textContent = 'Edit Task';
        modalSubmitBtn.textContent = 'Update Task';
        taskIdInput.value = task.id;

        document.getElementById('task-name').value = task.name;
        document.getElementById('task-description').value = task.description;
        document.getElementById('task-priority').value = task.priority;
        document.getElementById('task-deadline').value = task.deadline;

        addTaskModal.style.display = 'flex';
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

    async function updateTaskStatus(taskId, newStatus) {
        const taskIndex = tasks.findIndex(task => task.id === taskId);
        if (taskIndex === -1) {
            console.error('Tarea no encontrada para actualizar estado:', taskId);
            return;
        }

        const taskToUpdate = { ...tasks[taskIndex] };
        taskToUpdate.status = newStatus;

        try {
            const respuesta = await fetch(`http://localhost:8000/tasks/${taskId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    taskname: taskToUpdate.name,
                    taskdescription: taskToUpdate.description,
                    taskpriority: taskToUpdate.priority,
                    taskdeadline: taskToUpdate.deadline,
                    status: taskToUpdate.status
                })
            });

            if (!respuesta.ok) {
                const errorText = await respuesta.text();
                throw new Error(`HTTP error! status: ${respuesta.status}, message: ${errorText}`);
            }

            const resultado = await respuesta.json();
            console.log(resultado.mensaje);
            await cargartarea();
        } catch (error) {
            console.error("Error al actualizar el estado de la tarea:", error);
        }
    }

    async function deleteTask(taskId) {
        if (!confirm('¿Estás seguro de que quieres eliminar esta tarea?')) {
            return;
        }

        try {
            const respuesta = await fetch(`http://localhost:8000/tasks/${taskId}`, {
                method: "DELETE",
            });

            if (!respuesta.ok) {
                const errorText = await respuesta.text();
                throw new Error(`HTTP error! status: ${respuesta.status}, message: ${errorText}`);
            }

            const resultado = await respuesta.json();
            console.log(resultado.mensaje);
            await cargartarea();
        } catch (error) {
            console.error("Error al eliminar tarea:", error);
        }
    }

    function resetFormAndModal() {
        taskForm.reset();
        taskIdInput.value = '';
        modalTitle.textContent = 'Add New Task';
        modalSubmitBtn.textContent = 'Save Task';
        mensaje.textContent = '';
        mensaje.style.color = '';
    }

    addTaskBtn.addEventListener('click', () => {
        resetFormAndModal();
        addTaskModal.style.display = 'flex';
    });

    closeButton.addEventListener('click', () => {
        addTaskModal.style.display = 'none';
    });

    cancelTaskBtn.addEventListener('click', () => {
        addTaskModal.style.display = 'none';
    });

    window.addEventListener('click', (event) => {
        if (event.target === addTaskModal) {
            addTaskModal.style.display = 'none';
        }
    });

    taskForm.addEventListener('submit', async function (event) {
        event.preventDefault();

        const taskId = taskIdInput.value;
        const isEditing = !!taskId;

        const taskName = document.getElementById('task-name').value;
        const taskDescription = document.getElementById('task-description').value;
        const taskPriority = document.getElementById('task-priority').value;
        const taskDeadline = document.getElementById('task-deadline').value;

        if (isEditing) {
            const originalTask = tasks.find(t => t.id == taskId);
            if (!originalTask) {
                console.error("No se encontró la tarea para editar.");
                return;
            }

            try {
                const respuesta = await fetch(`http://localhost:8000/tasks/${taskId}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        taskname: taskName,
                        taskdescription: taskDescription,
                        taskpriority: taskPriority,
                        taskdeadline: taskDeadline,
                        status: originalTask.status
                    })
                });

                if (!respuesta.ok) {
                    const errorText = await respuesta.text();
                    throw new Error(`HTTP error! status: ${respuesta.status}, message: ${errorText}`);
                }

                const resultado = await respuesta.json();
                mensaje.textContent = resultado.mensaje;
                mensaje.style.color = "green";

                await cargartarea();
                addTaskModal.style.display = 'none';
            } catch (error) {
                console.error("Error al actualizar tarea:", error);
                mensaje.textContent = "Error al actualizar tarea.";
                mensaje.style.color = "red";
            }
        } else {
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

                if (!respuesta.ok) {
                    const errorText = await respuesta.text();
                    throw new Error(`HTTP error! status: ${respuesta.status}, message: ${errorText}`);
                }

                const resultado = await respuesta.json();
                mensaje.textContent = resultado.mensaje;
                mensaje.style.color = "green";

                await cargartarea();
                addTaskModal.style.display = 'none';
            } catch (error) {
                console.error("Error al guardar tarea:", error);
                mensaje.textContent = "Error al guardar tarea.";
                mensaje.style.color = "red";
            }
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

        column.addEventListener('drop', async e => {
            e.preventDefault();
            column.classList.remove('drag-over');
            const taskId = parseInt(e.dataTransfer.getData('text/plain'));
            const newStatus = statusMap[column.parentElement.id];
            await updateTaskStatus(taskId, newStatus);
        });
    });

    cargartarea();
});
