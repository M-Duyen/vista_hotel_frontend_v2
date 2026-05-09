import './index.css';
import './App.css';
import { RouterProvider } from 'react-router-dom';
import { router } from './routes';
import { NotificationProvider } from './context/NotificationContextAPI';

function App() {
    return (
        <NotificationProvider>
            <RouterProvider router={router} />
        </NotificationProvider>
    );
}

export default App;
