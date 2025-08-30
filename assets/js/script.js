document.addEventListener('DOMContentLoaded', () => {
    const API_URL = 'http://127.0.0.1:5000';

    const taskForm = document.getElementById('task-form');
    const taskTitleInput = document.getElementById('task-title');
    const taskDescriptionInput = document.getElementById('task-description');
    
    const todoColumn = document.getElementById('todo-column');
    const doingColumn = document.getElementById('doing-column');
    const doneColumn = document.getElementById('done-column');

    let taskIdToDelete = null;

    async function fetchAndDisplayTasks() {
        try {
            const response = await fetch(`${API_URL}/buscar_tarefas`);
            const tasks = await response.json();

            todoColumn.innerHTML = '';
            doingColumn.innerHTML = '';
            doneColumn.innerHTML = '';

            tasks.forEach(task => {
                const taskCard = createTaskCard(task);
                if (task.status === 'A Fazer') {
                    todoColumn.appendChild(taskCard);
                } else if (task.status === 'Em Andamento') {
                    doingColumn.appendChild(taskCard);
                } else {
                    doneColumn.appendChild(taskCard);
                }
            });
        } catch (error) {
            console.error('Erro ao buscar tarefas:', error);
        }
    }

    function createTaskCard(task) {
        const card = document.createElement('div');
        card.className = 'card task-card mb-3';
        card.setAttribute('data-task-id', task.id);

        card.innerHTML = `
            <div class="card-body">
                <h5 class="card-title">${task.titulo}</h5>
                <p class="card-text">${task.descricao}</p>
                <div class="btn-group" role="group">
                    <button class="btn btn-sm btn-info move-btn" data-status="A Fazer">A Fazer</button>
                    <button class="btn btn-sm btn-warning move-btn" data-status="Em Andamento">Em Andamento</button>
                    <button class="btn btn-sm btn-success move-btn" data-status="Concluído">Concluído</button>
                </div>
                <button class="btn btn-sm btn-danger float-end delete-btn">Excluir</button>
            </div>
        `;
        
        const deleteBtn = card.querySelector('.delete-btn');
        deleteBtn.addEventListener('click', () => deleteTask(task.id));

        const moveBtns = card.querySelectorAll('.move-btn');
        moveBtns.forEach(btn => {
            btn.addEventListener('click', () => updateTaskStatus(task.id, btn.dataset.status));
        });

        return card;
    }

    async function addTask(event) {
        event.preventDefault();

        const title = taskTitleInput.value;
        const description = taskDescriptionInput.value;

        if (!title) return;

        try {
            await fetch(`${API_URL}/adicionar_tarefa`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ titulo: title, descricao: description }),
            });
            taskForm.reset();
            fetchAndDisplayTasks();
        } catch (error) {
            console.error('Erro ao adicionar tarefa:', error);
        }
    }

    function deleteTask(taskId) {
        taskIdToDelete = taskId;
        const modal = new bootstrap.Modal(document.getElementById('deleteModal'));
        modal.show();
    }

    document.getElementById('confirmDeleteBtn').addEventListener('click', async () => {
        if (!taskIdToDelete) return;

        try {
            await fetch(`${API_URL}/deletar_tarefa/${taskIdToDelete}`, { method: 'DELETE' });
            taskIdToDelete = null;

            const modalEl = document.getElementById('deleteModal');
            const modalInstance = bootstrap.Modal.getInstance(modalEl);
            modalInstance.hide();

            fetchAndDisplayTasks();
        } catch (error) {
            console.error('Erro ao deletar tarefa:', error);
        }
    });

    async function updateTaskStatus(taskId, newStatus) {
        try {
            await fetch(`${API_URL}/atualizar_tarefa/${taskId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus }),
            });
            fetchAndDisplayTasks();
        } catch (error) {
            console.error('Erro ao atualizar status:', error);
        }
    }

    taskForm.addEventListener('submit', addTask);
    fetchAndDisplayTasks();
});
