import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
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

import CourseListPage from "./pages/CourseListPage";
import CourseAddPage from "./pages/CourseAddPage";
import CourseEditPage from "./pages/CourseEditPage";
import CourseViewPage from "./pages/CourseViewPage";
import CourseBulkUploadPage from "./pages/CourseBulkUploadPage";

import UserListPage from "./pages/UserListPage";
import UserAddPage from "./pages/UserAddPage";
import UserEditPage from "./pages/UserEditPage";

import RolePermissionListPage from "./pages/RolePermissionListPage";
import RolePermissionAddPage from "./pages/RolePermissionAddPage";
import RolePermissionEditPage from "./pages/RolePermissionEditPage";

import ViewProfilePage from "./pages/ViewProfilePage";

import CourseAssignmentListPage from "./pages/CourseAssignmentListPage";
import CourseAssignmentAddPage from "./pages/CourseAssignmentAddPage";
import MyCoursesPage from "./pages/MyCoursesPage";

function App() {
  return (
    <BrowserRouter>
      <ToastContainer position="top-right" autoClose={4000} />
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

        {/* Course Routes */}
        <Route exact path='/courses' element={<ProtectedRoute><CourseListPage /></ProtectedRoute>} />
        <Route exact path='/course-add' element={<ProtectedRoute><CourseAddPage /></ProtectedRoute>} />
        <Route exact path='/course-edit/:id' element={<ProtectedRoute><CourseEditPage /></ProtectedRoute>} />
        <Route exact path='/course-view/:id' element={<ProtectedRoute><CourseViewPage /></ProtectedRoute>} />
        <Route exact path='/course-bulk-upload' element={<ProtectedRoute><CourseBulkUploadPage /></ProtectedRoute>} />

        {/* User Routes */}
        <Route exact path='/users' element={<ProtectedRoute><UserListPage /></ProtectedRoute>} />
        <Route exact path='/user-add' element={<ProtectedRoute><UserAddPage /></ProtectedRoute>} />
        <Route exact path='/user-edit/:id' element={<ProtectedRoute><UserEditPage /></ProtectedRoute>} />

        {/* Role Permission Routes */}
        <Route exact path='/role-permissions' element={<ProtectedRoute><RolePermissionListPage /></ProtectedRoute>} />
        <Route exact path='/role-permission-add' element={<ProtectedRoute><RolePermissionAddPage /></ProtectedRoute>} />
        <Route exact path='/role-permission-edit/:id' element={<ProtectedRoute><RolePermissionEditPage /></ProtectedRoute>} />

        {/* Course Assignment Routes */}
        <Route exact path='/course-assignments' element={<ProtectedRoute><CourseAssignmentListPage /></ProtectedRoute>} />
        <Route exact path='/course-assignment-add' element={<ProtectedRoute><CourseAssignmentAddPage /></ProtectedRoute>} />
        <Route exact path='/my-courses' element={<ProtectedRoute><MyCoursesPage /></ProtectedRoute>} />

        {/* Profile Routes */}
        <Route exact path='/view-profile' element={<ProtectedRoute><ViewProfilePage /></ProtectedRoute>} />

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

