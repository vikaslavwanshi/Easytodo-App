const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path'); 

const app = express();
app.use(cors());

app.set('views', path.join(__dirname, 'views'));

// using 'pug' as the view engine
app.set('view engine', 'pug');

// Defining  Mongoose schema for Todo app
const todoSchema = new mongoose.Schema({
    taskName: String,
    taskDescription: String 
});

// Creating the Todo model
const Todo = mongoose.model('Todo', todoSchema);

//  this is the middleware code to parse request body
app.use(express.urlencoded({ extended: true }));

// Connecting to MongoDB, mongoose is use to establish connection string
mongoose.connect('mongodb+srv://vikasnewuser:vikasnewuser@mydatabasecluster.ylqnovv.mongodb.net/justtweetdb')
    .then(() => {
        console.log('Connected to MongoDB');
        // Calling getTodos after connecting to MongoDB
        getTodos();
    })
    .catch(err => console.error('Could not connect to MongoDB', err));

// Function to fetch todo tasks from the database
async function getTodos() {
    try {
        const todos = await Todo.find(); // Fetching all todo tasks
        return todos; // Returning fetched tasks
    } catch (error) {
        console.error('Error fetching todos:', error);
        return []; // Returning an empty array in case of error
    }
}

// ***
// Get requests -- using Route handlers to get posts with different paths
// ***

// Route handler to render todo tasks on the UI with '/'
app.get('/', async (req, res) => {
    const todos = await getTodos(); // Fetching todos
    res.render('todo', { todos }); // Rendering the 'todo' view with fetched todos
});

// Route handler to render todo tasks on the UI with 'localhost:3002/todos'
app.get('/todos', async (req, res) => {
    try {
        const todos = await getTodos(); // Fetch todos
        res.render('todo', { todos }); // Render the 'todo' view with fetched todos
    } catch (error) {
        console.error('Error fetching todos:', error);
        res.status(500).send('Error fetching todos');
    }
});

// Route to get a specific todo task by ID
app.get('/todos/:id', async (req, res) => {
    const taskId = req.params.id;
    try {
        const todo = await Todo.findById(taskId); // Find the task by ID
        if (!todo) {
            return res.status(404).send('Todo not found'); // Return 404 if todo is not found
        }
        res.json(todo); // Send the found todo task as JSON response
    } catch (error) {
        console.error('Error fetching todo:', error);
        res.status(500).send('Error fetching todo');
    }
});

// ***
// Post requests -- using Route handlers to post new todo tasks from UI and saving in mongo db
// ***

// Route to handle POST requests to create a new todo task
app.post('/todos', async (req, res) => {
    const { taskName, taskDescription } = req.body; // Change body to taskDescription
    try {
        const todo = new Todo({ taskName, taskDescription }); // Change body to taskDescription
        await todo.save(); // Saving todo task to database
        res.redirect('/'); // Redirecting to the homepage after adding task
    } catch (error) {
        console.error('Error creating todo:', error);
        res.status(500).send('Error creating todo');
    }
});

// ***
// Deletion requests -- Using deletion function to delete posts/todo tasks from client side and handling deletion on server side as well.
// ***

// Route to handle DELETE requests to delete a todo task
app.delete('/todos/:id', async (req, res) => {
    const taskId = req.params.id;
    try {
        await Todo.findByIdAndDelete(taskId); // Delete the task from the database
        res.sendStatus(204); // Send a 'No Content' response indicating success
    } catch (error) {
        console.error('Error deleting todo:', error);
        res.status(500).send('Error deleting todo');
    }
});

// There is a different file stored in /public folder with name script.js to handle this, we are handling delete functionality of server side from this script.
// client side javascript code to handle delete button click event
app.use(express.static(path.join(__dirname, 'public')));

app.get('/script.js', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'script.js'));
});

// To start the express server on port 3002
const PORT = process.env.PORT || 3002;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
