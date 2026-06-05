import { HashRouter as Router } from 'react-router-dom';
import { AppRouter } from './routers/app.routers';

function App() {
  return (
    <Router>
      <AppRouter />
    </Router>
  );
}

export default App;
