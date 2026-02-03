require('dotenv').config();
const Note = require('./models/note');
const express = require('express');
const app = express();

app.use(express.static('dist'));
app.use(express.json());

const requestLogger = (request, response, next) => {
  console.log(`METHOD: ${request.method}`);
  console.log(`PATH: ${request.path}`);
  console.log(`BODY: ${request.body}`);
  console.log('----------------');
  next();
}
app.use(requestLogger);

// app.use(cors());

let notes = [
  {
    id: "1",
    content: "HTML is easy",
    important: true
  },
  {
    id: "2",
    content: "Browser can execute only JavaScript",
    important: false
  },
  {
    id: "3",
    content: "GET and POST are the most important methods of HTTP protocol",
    important: true
  }
];

app.get('/', (request, response) => {
  response.send('<h1>Hello World!</h1>');
});

app.get('/api/notes', (request, response) => {
  Note.find({}).then(notes => {
    response.json(notes);
  });
});

app.delete('/api/notes/:id', (request, response, next) => {
  const id = request.params.id;
  
  Note.findByIdAndDelete(id)
    .then(result => {
      response.status(204).end();
    })
    .catch(error => next(error));
});

const generateId = () => {
  const maxId = notes.length > 0
    ? Math.max(...notes.map(n => Number(n.id)))
    : 0;
  return String(maxId + 1);
};

app.post('/api/notes', (request, response) => {
  const body = request.body;

  if (!body.content) {
    return response.status(400).json({
      error: "content missing"
    });
  }

  const newNote = new Note({
    content: body.content,
    important: body.important || false,
  });

  newNote.save().then(savedNote => {
    console.log(`The note "${newNote.content}" was saved!`);
    response.json(savedNote);
  });

});

app.get('/api/notes/:id', (request, response, next) => {
  const id = request.params.id;
  Note.findById(id)
    .then(note => {
      if (note) {
      } else {
        response.json(note);
        response.status(404).end();
      }
    })
    .catch(error => next(error));
});

app.put('/api/notes/:id', (request, response, next) => {
  const { content, important } = request.body;
  
  const id = request.params.id;
  Note.findById(id)
    .then(note => {
      if (!note) {
        return response.status(404).end();
      }

      note.content = content;
      note.important = important;

      return note.save().then(savedNote => {
        response.json(updatedNote);
      })
    })

});

const unknownEndpoint = (request, response, next) => {
  response.status(404).json({error: "Unknown Endpoint"});
  next();
}

app.use(unknownEndpoint);

const errorHandler = (error, request, response, next) => {
  // console.log(error);
  console.error(error.message)

  if (error.name === 'CastError') {
    return response.status(400).json({ error: 'malformatted id' })
  } 

  next(error)
}

app.use(errorHandler);

const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

