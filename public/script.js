document.addEventListener('DOMContentLoaded', () => {
    const deleteButtons = document.querySelectorAll('.delete-btn');
    
    deleteButtons.forEach(button => {
        button.addEventListener('click', async (event) => {
            const taskId = event.target.dataset.taskId;
            
            try {
                const response = await fetch(`/todos/${taskId}`, {
                    method: 'DELETE'
                });

                if (response.ok) {
                    // here we are removing the delete task from DOM
                    event.target.parentElement.remove();
                } else {
                    console.error('Failed to delete task:', response.statusText);
                }
            } catch (error) {
                console.error('Error deleting task:', error);
            }
        });
    });
});