document.addEventListener("DOMContentLoaded", function () {
    // scroll và tô đậm task đã tìm kiếm 
    const urlParams = new URLSearchParams(window.location.search);
    const highlightId = urlParams.get("highlight");

    // Nếu có highlight, đánh dấu và scroll đến task tương ứng
    if (highlightId) {
        const targetTask = document.getElementById(`task-${highlightId}`);
        if (targetTask) {
            targetTask.classList.add("bg-warning", "border", "border-dark", "rounded", "fw-bold");
            targetTask.scrollIntoView({ behavior: "smooth", block: "center" });

            // Bỏ highlight sau vài giây nếu muốn (tùy chọn)
            setTimeout(() => {
                targetTask.classList.remove("bg-warning", "border", "border-dark", "fw-bold");
            }, 4000);
        }
    }



    // ADD TASK
    const addForm = document.getElementById("add-task-form");
    const input = document.getElementById("new-task");
    const todoItems = document.getElementById("todo-items");
    const successMessage = document.getElementById("success-message");

    addForm.addEventListener("submit", async function (e) {
        e.preventDefault();

        const title = input.value.trim();
        if (!title) return;

        const res = await fetch("/todolist/add", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ title })
        });

        const data = await res.json();
        if (data.success) {
            const task = data.task;
            const html = `
                <div class="task-itemTodo d-flex justify-content-between align-items-center mb-2" id="task-${task.id}">
                    <span>${task.title}</span>
                    <div>
                        <button type="button" class="btn btn-sm text-primary edit-task" data-id="${task.id}">
                            <i class="bi bi-check-circle"></i>
                        </button>
                        <button type="button" class="btn btn-sm text-danger delete-task" data-id="${task.id}">
                            <i class="bi bi-trash"></i>
                        </button>
                    </div>
                </div>
            `;
            todoItems.insertAdjacentHTML("beforeend", html);
            input.value = "";

            successMessage.classList.remove("d-none");
            setTimeout(() => successMessage.classList.add("d-none"), 2000);
        }
    });

    // DELEGATE EVENT - Edit & Delete buttons
    todoItems.addEventListener("click", async function (e) {
        const editBtn = e.target.closest(".edit-task");
        const deleteBtn = e.target.closest(".delete-task");

        // EDIT
        if (editBtn) {
            const taskId = editBtn.dataset.id;
            const res = await fetch(`/todolist/complete/${taskId}`, {
                method: "PUT"
            });
            const data = await res.json();
            if (data.success) {
                const taskDiv = document.getElementById(`task-${taskId}`);
                const span = taskDiv.querySelector("span");
                if (data.task.isCompleted) {
                    span.classList.add("text-decoration-line-through", "text-muted");
                } else {
                    span.classList.remove("text-decoration-line-through", "text-muted");
                }
            }
        }

        // DELETE
        if (deleteBtn) {
            const taskId = deleteBtn.dataset.id;
            const res = await fetch(`/todolist/delete/${taskId}`, {
                method: "DELETE"
            });
            const data = await res.json();
            if (data.success) {
                const taskDiv = document.getElementById(`task-${taskId}`);
                taskDiv.remove();
            }
        }
    });
});
