import Home from './pages/Home.jsx';
import About from './pages/About.jsx';
import Contact from './pages/Contact.jsx';

export const homeRoute = {
    index: true,
    element: <Home />,
};

export const guestRoutes = [
    { path: 'about',   element: <About /> },
    { path: 'contact', element: <Contact /> },
];