const express = require('express');
const cors = require('cors');

const { v4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {

  const { username } = request.headers;

  const user = users.find(x => x.username === username);

  if (user != undefined) {
    request.user = user;
  } else {
    return response.status(404).json({ "error": "User does not exist!" })
  }

  next();

}
/**
 * user :{id, name, username, todos:[id, title, deadline, done]}
 * 
 * 
 * 
 * 
 */
app.post('/users', (request, response) => {
  const id = v4();
  const { name, username } = request.body;

  const userExists = users.some(x => x.username === username);

  const user = {
    id: id, // precisa ser um uuid
    name: 'John Doe',
    username: 'johndoe',
    todos: []
  };

  if (userExists) {
    return response.status(400).json({ error: 'User already exists' });
  } else {
    users.push(user);

    return response.status(201).send(user);
  }


});

app.get('/todos', checksExistsUserAccount, (request, response) => {

  const user = request.user;

  return response.status(200).send(user.todos);

});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { title, deadline } = request.body;
  const id = v4();
  const todos = user.todos;

  const newTodo = {
    id: id, // precisa ser um uuid
    title: title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date()
  }
  todos.push(newTodo);

  return response.status(201).send(newTodo);

});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  // Complete aqui
  const { id } = request.params
  const { title, deadline } = request.body
  const { username } = request.headers

  const todo = users.find(x => x.username === username).todos.find(y => y.id === id)//.todos.find(x => x.id === id)

  if (todo === undefined) {
    return response.status(404).json({ "error": "Todo does not exist!" })
  } else {
    todo.title = title
    todo.deadline = deadline

    return response.status(200).send(todo);
  }
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const id = request.params.id
  const username = request.headers.username

  const todo = users.find(x => x.username === username).todos.find(x => x.id === id);

  if (todo == undefined) {
    return response.status(404).json({ "error": "ToDo does not exist!" })
  } else {
    todo.done = true
    return response.status(200).send(todo)
  }
})

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { id } = request.params
  const { username } = request.headers

  const user = users.find(x => x.username === username)
  const todoIndex = user.todos.findIndex(x => x.id === id)


  //console.log(user, todoIndex, user.todos)

  if (user.todos[todoIndex] == undefined) {
    return response.status(404).json({ "error": "Todo does not exist!" })
  } else {
    user.todos.splice(todoIndex, 1)

    return response.status(204);
  }



});

module.exports = app;