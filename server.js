const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const authRoutes = require('./routes/authRoutes');
const clientRoutes = require('./routes/clientRoutes');

const app = express();
const PORT = process.env.PORT || 8000;

mongoose.connect('mongodb://localhost:27017/carniceria', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

app.use(bodyParser.json());
app.use('/api/auth', authRoutes);
app.use('/api/clients', clientRoutes);

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});