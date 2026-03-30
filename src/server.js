const { app } = require('./app');
const { PORT } = require('./config/env');

app.listen(PORT, () => {
  console.log(`MedTracker API listening on http://localhost:${PORT}`);
});
