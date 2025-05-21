// DOM elements
const taskForm = document.getElementById('task-form');
const taskList = document.getElementById('task-list');
const filterStatus = document.getElementById('filter-status');
const filterCategory = document.getElementById('filter-category');

let tasks = JSON.parse(localStorage.getItem('tasks')) || [];

// Save tasks to localStorage
function saveTasks() {
  localStorage.setItem('tasks', JSON.stringify(tasks));
}

// Capitalize first letter of a string
function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// Populate category filter dropdown
function updateCategoryFilterOptions() {
  const categories = [...new Set(tasks.map(task => task.category.toLowerCase()))];
  filterCategory.innerHTML = '<option value="all" selected>All</option>';
  categories.forEach(category => {
    const option = document.createElement('option');
    option.value = category;
    option.textContent = capitalize(category);
    filterCategory.appendChild(option);
  });
}

// Mark overdue tasks
function checkOverdueTasks() {
  const today = new Date().toISOString().split('T')[0];
  let updated = false;
  tasks.forEach(task => {
    if (task.status !== 'Completed' && task.deadline < today && task.status !== 'Overdue') {
      task.status = 'Overdue';
      updated = true;
    }
  });
  if (updated) saveTasks();
}

// Render filtered task list
function renderTasks() {
  checkOverdueTasks();

  const statusFilter = filterStatus.value;
  const categoryFilterValue = filterCategory.value.toLowerCase();
  taskList.innerHTML = '';

  const filteredTasks = tasks.filter(task => {
    const statusMatch = statusFilter === 'all' || task.status === statusFilter;
    const categoryMatch = categoryFilterValue === 'all' || task.category.toLowerCase() === categoryFilterValue;
    return statusMatch && categoryMatch;
  });

  if (filteredTasks.length === 0) {
    taskList.innerHTML = '<li aria-live="polite">No tasks found matching the filter criteria.</li>';
    return;
  }

  filteredTasks.forEach((task, index) => {
    const li = document.createElement('li');
    li.className = 'task-item';
    li.setAttribute('role', 'listitem');
    li.tabIndex = 0;
    li.setAttribute('aria-label', `Task: ${task.name}, category: ${task.category}, deadline: ${task.deadline}, status: ${task.status}`);

    // Status selector to allow status updates
    const statusSelect = document.createElement('select');
    ['In Progress', 'Completed', 'Overdue'].forEach(optionText => {
      const option = document.createElement('option');
      option.value = optionText;
      option.textContent = optionText;
      if (task.status === optionText) option.selected = true;
      statusSelect.appendChild(option);
    });

    statusSelect.addEventListener('change', () => {
      tasks[index].status = statusSelect.value;
      saveTasks();
      renderTasks();
    });

    li.innerHTML = `
      <span class="task-info">${task.name}</span>
      <span class="task-info">${task.category}</span>
      <span class="task-info">${task.deadline}</span>
    `;
    li.appendChild(statusSelect);
    taskList.appendChild(li);
  });
}

// Form submission handler
taskForm.addEventListener('submit', e => {
  e.preventDefault();

  const nameInput = taskForm.elements['task-name'];
  const categoryInput = taskForm.elements['task-category'];
  const deadlineInput = taskForm.elements['task-deadline'];
  const statusInput = taskForm.elements['task-status'];

  if (!nameInput.value.trim() || !categoryInput.value.trim() || !deadlineInput.value || !statusInput.value) {
    alert('Please fill in all the fields');
    return;
  }

  const newTask = {
    name: nameInput.value.trim(),
    category: categoryInput.value.trim(),
    deadline: deadlineInput.value,
    status: statusInput.value
  };

  tasks.push(newTask);
  saveTasks();

  taskForm.reset();
  statusInput.value = 'In Progress';

  updateCategoryFilterOptions();
  renderTasks();
});

// Filter dropdown listeners
filterStatus.addEventListener('change', renderTasks);
filterCategory.addEventListener('change', renderTasks);

// Initial setup
updateCategoryFilterOptions();
renderTasks();
