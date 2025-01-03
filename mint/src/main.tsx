import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";

import App from "./App.tsx";
import LoginForm from "./components/LoginForm.tsx";
import SignUpForm from "./components/SignUpForm.tsx";

const router = createBrowserRouter([
    {
        path: "/",
        element: <LoginForm />,
    },
    {
        path: "/home",
        element: <App />,
    },
    {
        path: "/login",
        element: <LoginForm />,
    },
    {
        path: "/signup",
        element: <SignUpForm />,
    },
]);

createRoot(document.getElementById("root")!).render(
    <StrictMode>
        <RouterProvider router={router} />
    </StrictMode>
);
