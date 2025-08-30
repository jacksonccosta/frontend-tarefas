// Espera o conteúdo da página carregar completamente antes de executar o script
document.addEventListener('DOMContentLoaded', () => {

    // URL base da nossa API (certifique-se que o backend está rodando)
    const API_URL = 'http://127.0.0.1:5000';

    // Elementos do DOM que vamos manipular
    const taskForm = document.getElementById('task-form');
    const taskTitleInput = document.getElementById('task-title');
    const taskDescriptionInput = document.getElementById('task-description');
    
    const todoColumn = document.getElementById('todo-column');
    const doingColumn = document.getElementById('doing-column');
    const doneColumn = document.getElementById('done-column');

    // Função para buscar as tarefas da API e exibi-las na tela
    async function fetchAndDisplayTasks() {
        try {
            // Chama a rota GET /tarefas da API
            const response = await fetch(`${API_URL}/tarefas`);
            const tasks = await response.json();

            // Limpa as colunas antes de adicionar as tarefas
            todoColumn.innerHTML = '';
            doingColumn.innerHTML = '';
            doneColumn.innerHTML = '';

            // Itera sobre cada tarefa e a adiciona na coluna correta
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

    // Função para criar o HTML de um card de tarefa
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
        
        // Adiciona evento ao botão de deletar
        const deleteBtn = card.querySelector('.delete-btn');
        deleteBtn.addEventListener('click', () => deleteTask(task.id));

        // Adiciona eventos aos botões de mover
        const moveBtns = card.querySelectorAll('.move-btn');
        moveBtns.forEach(btn => {
            btn.addEventListener('click', () => updateTaskStatus(task.id, btn.dataset.status));
        });

        return card;
    }

    // Função para adicionar uma nova tarefa (chamada pelo formulário)
    async function addTask(event) {
        event.preventDefault(); // Impede o recarregamento da página

        const title = taskTitleInput.value;
        const description = taskDescriptionInput.value;

        if (!title) return; // Não adiciona se o título estiver vazio

        try {
            // Chama a rota POST /tarefas
            await fetch(`${API_URL}/tarefas`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ titulo: title, descricao: description }),
            });
            // Limpa o formulário e atualiza a lista de tarefas
            taskForm.reset();
            fetchAndDisplayTasks();
        } catch (error) {
            console.error('Erro ao adicionar tarefa:', error);
        }
    }
    
    // Função para deletar uma tarefa
    async function deleteTask(taskId) {
        if (!confirm('Tem certeza que deseja excluir esta tarefa?')) return;
        
        try {
            // Chama a rota DELETE /tarefas/<id>
            await fetch(`${API_URL}/tarefas/${taskId}`, { method: 'DELETE' });
            fetchAndDisplayTasks(); // Atualiza a lista
        } catch (error) {
            console.error('Erro ao deletar tarefa:', error);
        }
    }

    // Função para atualizar o status de uma tarefa
    async function updateTaskStatus(taskId, newStatus) {
        try {
            // Chama a rota PUT /tarefas/<id>
            await fetch(`${API_URL}/tarefas/${taskId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus }),
            });
            fetchAndDisplayTasks(); // Atualiza a lista
        } catch (error) {
            console.error('Erro ao atualizar status:', error);
        }
    }

    // Adiciona o listener para o evento de submit do formulário
    taskForm.addEventListener('submit', addTask);

    // Carrega as tarefas existentes quando a página é aberta pela primeira vez
    fetchAndDisplayTasks();
});