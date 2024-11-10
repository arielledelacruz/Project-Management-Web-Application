import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import './cssFiles/index.css';
import SprintBoard from './pages/Board/SprintBoard.jsx';
import AccountPage from './pages/Account/AccountPage.jsx';
import AdminView from './pages/Admin/AdminView.jsx';
import SprintBacklogPage from './pages/SprintBacklog/SprintBacklogPage.jsx';
import SprintPlanPage from './pages/SprintPlan/SprintPlanPage.jsx';
import {
    createBrowserRouter,
    RouterProvider,
  } from "react-router-dom";
import LoginPage from './pages/Login/LoginPage.jsx';

  const router = createBrowserRouter([
    {
      path: "/",
      element: <LoginPage />,   
    },
    {
      path: "/app",
      element: <App />, 
    },    
    {
      path: "/sprintboard",
      element: <SprintBoard />, 
    },
    {
      path: "/account",
      element: <AccountPage/>, 
    },
    {
      path: "/admin",
      element: <AdminView/>, 
    },
    {
      path: "/sprintbacklog",
      element: <SprintBacklogPage/>,
    },
    {
      path: "/sprintplan", // Add route for SprintPlanPage
      element: <SprintPlanPage />,
    },
  ]);


createRoot(document.getElementById('root')).render(
    <RouterProvider router={router}/>
)
