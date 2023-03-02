import React from "react";
import {
    createBrowserRouter,
    createRoutesFromElements,
    Route,
    RouterProvider,
} from "react-router-dom";
import { Navbar } from "./components";
import "./App.css";

function App() {
    const router = createBrowserRouter(
        createRoutesFromElements(
            <Route path="/" element={<Navbar />}>
                <Route path="" element={<div>Home Page</div>} />
                <Route path="page1" element={<div>Page 1</div>} />
                <Route path="page2" element={<div>Page 2</div>} />
            </Route>
        )
    );

    return <RouterProvider router={router} />;
}

export default App;
