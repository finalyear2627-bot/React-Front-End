import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import HomePageOne from "./pages/HomePageOne";
import ErrorPage from "./pages/ErrorPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import SignInPage from "./pages/SignInPage";
import SignUpPage from "./pages/SignUpPage";
import ProtectedRoute from "./components/ProtectedRoute";
import RouteScrollToTop from "./helper/RouteScrollToTop";

import ProgramListPage from "./pages/ProgramListPage";
import ProgramAddPage from "./pages/ProgramAddPage";
import ProgramEditPage from "./pages/ProgramEditPage";
import ProgramViewPage from "./pages/ProgramViewPage";
import ProgramBulkUploadPage from "./pages/ProgramBulkUploadPage";

function App() {
  return (
    <BrowserRouter>
      <RouteScrollToTop />
      <Routes>
        <Route exact path='/' element={<Navigate to='/sign-in' />} />
        <Route exact path='/dashboard' element={<ProtectedRoute><HomePageOne /></ProtectedRoute>} />

        {/* Program Routes */}
        <Route exact path='/programs' element={<ProtectedRoute><ProgramListPage /></ProtectedRoute>} />
        <Route exact path='/program-add' element={<ProtectedRoute><ProgramAddPage /></ProtectedRoute>} />
        <Route exact path='/program-edit/:id' element={<ProtectedRoute><ProgramEditPage /></ProtectedRoute>} />
        <Route exact path='/program-view/:id' element={<ProtectedRoute><ProgramViewPage /></ProtectedRoute>} />
        <Route exact path='/program-bulk-upload' element={<ProtectedRoute><ProgramBulkUploadPage /></ProtectedRoute>} />

        {/* Auth Routes */}
        <Route exact path='/forgot-password' element={<ForgotPasswordPage />} />
        <Route exact path='/sign-in' element={<SignInPage />} />
        <Route exact path='/sign-up' element={<SignUpPage />} />

        <Route exact path='*' element={<ErrorPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

