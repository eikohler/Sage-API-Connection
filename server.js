const express = require('express');
const { engine } = require('express-handlebars');

const routes = require('./routes');

const PORT = process.env.PORT || 3001;
const app = express();

app.engine('handlebars', engine());
app.set('view engine', 'handlebars');
app.set("views", "./views");

// Express middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static('public'));

app.use(routes);

// Default response for any other request (Not Found)
app.use((req, res) => {
    res.status(404).end();
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});