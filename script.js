document.addEventListener('DOMContentLoaded', () => {
    const addTaskBtn = document.getElementById('add-task-btn');
    const addTaskModal = document.getElementById('add-task-modal');
    const closeButton = addTaskModal.querySelector('.close-button');
    const cancelTaskBtn = document.getElementById('cancel-task-btn');
    const taskForm = document.getElementById('task-form');

    const todoTaskList = document.querySelector('#todo-column .task-list');
    const inProgressTaskList = document.querySelector('#inprogress-column .task-list');
    const doneTaskList = document.querySelector('#done-column .task-list');

    const todoCount = document.querySelector('#todo-column .task-count');
    const inProgressCount = document.querySelector('#inprogress-column .task-count');
    const doneCount = document.querySelector('#done-column .task-count');

    let tasks = []; // Aquí se almacenarán las tareas, en un entorno real usarías un backend o localStorage

    // Función para actualizar los contadores de tareas
    function updateTaskCounts() {
        todoCount.textContent = todoTaskList.children.length;
        inProgressCount.textContent = inProgressTaskList.children.length;
        doneCount.textContent = doneTaskList.children.length;
    }

    // Función para crear una tarjeta de tarea
    function createTaskCard(task) {
        const taskCard = document.createElement('div');
        taskCard.classList.add('task-card');
        taskCard.dataset.id = task.id; // Asigna un ID único a cada tarea
        taskCard.dataset.status = task.status; // Para saber el estado de la tarea
        taskCard.draggable = true; // Hacer la tarjeta arrastrable

        // Si la tarea está en "Done", preparamos un estilo para tachar el título.
        const titleStyle = task.status === 'Done' ? 'style="text-decoration: line-through; color: #6c757d;"' : '';

        taskCard.innerHTML = `
            <h3 ${titleStyle}>${task.name}</h3>
            <p>${task.description || 'No description provided.'}</p>
            <div class="task-meta">
                <span class="task-priority ${task.priority}">${task.priority}</span>
                <span class="task-deadline">${task.deadline || 'No Deadline'}</span>
            </div>
            <div class="task-actions" style="margin-top: 10px; display: flex; flex-wrap: wrap; gap: 5px;">
                ${task.status !== 'In Progress' ? '<button class="move-to-inprogress-btn button-secondary" style="font-size: 12px; padding: 5px 10px;">Move to In Progress</button>' : ''}
                ${task.status !== 'Done' ? '<button class="move-to-done-btn button-primary" style="font-size: 12px; padding: 5px 10px;">Move to Done</button>' : ''}
                ${task.status !== 'To Do' ? '<button class="move-to-todo-btn button-secondary" style="font-size: 12px; padding: 5px 10px;">Move to To Do</button>' : ''}
                <button class="delete-task-btn" style="font-size: 12px; padding: 5px 10px; background-color: #dc3545; color: white; border: none; border-radius: 4px; cursor: pointer; margin-left: auto;">Delete</button>
            </div>
        `;

        // Eventos para arrastrar y soltar (Drag and Drop)
        taskCard.addEventListener('dragstart', e => {
            // Guardamos el ID de la tarea que se está arrastrando
            e.dataTransfer.setData('text/plain', task.id);
            // Añadimos una clase para dar feedback visual
            setTimeout(() => {
                taskCard.classList.add('dragging');
            }, 0);
        });

        taskCard.addEventListener('dragend', () => {
            taskCard.classList.remove('dragging');
        });

        // Añadir listeners para los botones de movimiento
        taskCard.querySelector('.move-to-inprogress-btn')?.addEventListener('click', () => moveTask(task.id, 'In Progress'));
        taskCard.querySelector('.move-to-done-btn')?.addEventListener('click', () => moveTask(task.id, 'Done'));
        taskCard.querySelector('.move-to-todo-btn')?.addEventListener('click', () => moveTask(task.id, 'To Do'));
        taskCard.querySelector('.delete-task-btn').addEventListener('click', () => deleteTask(task.id));

        return taskCard;
    }

    // Función para renderizar todas las tareas
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

    // Función para mover una tarea entre columnas
    function moveTask(taskId, newStatus) {
        const taskIndex = tasks.findIndex(task => task.id === taskId);
        if (taskIndex !== -1) {
            tasks[taskIndex].status = newStatus;
            renderTasks(); // Volver a renderizar todas las tareas
        }
    }

    // Función para eliminar una tarea
    function deleteTask(taskId) {
        // Pedir confirmación antes de borrar para evitar accidentes
        if (confirm('¿Estás seguro de que quieres eliminar esta tarea?')) {
            tasks = tasks.filter(task => task.id !== taskId);
            renderTasks(); // Volver a renderizar para que la tarea desaparezca
        }
    }

    // Abrir el modal
    addTaskBtn.addEventListener('click', () => {
        addTaskModal.style.display = 'flex'; // Usar flex para centrar
    });

    // Cerrar el modal con el botón X
    closeButton.addEventListener('click', () => {
        addTaskModal.style.display = 'none';
        taskForm.reset(); // Limpiar el formulario al cerrar
    });

    // Cerrar el modal con el botón Cancelar
    cancelTaskBtn.addEventListener('click', () => {
        addTaskModal.style.display = 'none';
        taskForm.reset(); // Limpiar el formulario al cancelar
    });

    // Cerrar el modal al hacer clic fuera de él
    window.addEventListener('click', (event) => {
        if (event.target === addTaskModal) {
            addTaskModal.style.display = 'none';
            taskForm.reset(); // Limpiar el formulario al hacer clic fuera
        }
    });

    // Manejar el envío del formulario
    taskForm.addEventListener('submit', (event) => {
        event.preventDefault(); // Prevenir el envío por defecto del formulario

        const taskName = document.getElementById('task-name').value;
        const taskDescription = document.getElementById('task-description').value;
        const taskPriority = document.getElementById('task-priority').value;
        const taskDeadline = document.getElementById('task-deadline').value;

        const newTask = {
            id: Date.now(), // ID único basado en el timestamp
            name: taskName,
            description: taskDescription,
            priority: taskPriority,
            deadline: taskDeadline,
            status: 'To Do' // Las nuevas tareas siempre comienzan en "To Do"
        };

        tasks.push(newTask);
        renderTasks(); // Actualizar el tablero con la nueva tarea
        addTaskModal.style.display = 'none'; // Cerrar el modal
        taskForm.reset(); // Limpiar el formulario
    });

    // Lógica para arrastrar y soltar en las columnas
    const columns = document.querySelectorAll('.task-list');
    const statusMap = {
        'todo-column': 'To Do',
        'inprogress-column': 'In Progress',
        'done-column': 'Done'
    };

    columns.forEach(column => {
        column.addEventListener('dragover', e => {
            e.preventDefault(); // Necesario para permitir que se suelte un elemento
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

    // Inicializar el tablero al cargar la página
    renderTasks();
});