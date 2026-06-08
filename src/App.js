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

import ViewProfilePage from "./pages/ViewProfilePage";

import CourseAssignmentListPage from "./pages/CourseAssignmentListPage";
import CourseAssignmentAddPage from "./pages/CourseAssignmentAddPage";
import MyCoursesPage from "./pages/MyCoursesPage";

import SemesterListPage from "./pages/SemesterListPage";
import SemesterAddPage from "./pages/SemesterAddPage";
import SemesterEditPage from "./pages/SemesterEditPage";
import SemesterViewPage from "./pages/SemesterViewPage";

import PLOListPage from "./pages/PLOListPage";
import PLOAddPage from "./pages/PLOAddPage";
import PLOEditPage from "./pages/PLOEditPage";
import PLOBulkUploadPage from "./pages/PLOBulkUploadPage";

import CLOListPage from "./pages/CLOListPage";
import CLOAddPage from "./pages/CLOAddPage";
import CLOEditPage from "./pages/CLOEditPage";
import CLOBulkUploadPage from "./pages/CLOBulkUploadPage";
import CLOPLOStatementPage from "./pages/CLOPLOStatementPage";
import CLOPLOGeneratorPage from "./pages/CLOPLOGeneratorPage";

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

        {/* Course Assignment Routes */}
        <Route exact path='/course-assignments' element={<ProtectedRoute><CourseAssignmentListPage /></ProtectedRoute>} />
        <Route exact path='/course-assignment-add' element={<ProtectedRoute><CourseAssignmentAddPage /></ProtectedRoute>} />
        <Route exact path='/my-courses' element={<ProtectedRoute><MyCoursesPage /></ProtectedRoute>} />

        {/* Semester Routes */}
        <Route exact path='/semesters' element={<ProtectedRoute><SemesterListPage /></ProtectedRoute>} />
        <Route exact path='/semester-add' element={<ProtectedRoute><SemesterAddPage /></ProtectedRoute>} />
        <Route exact path='/semester-edit/:id' element={<ProtectedRoute><SemesterEditPage /></ProtectedRoute>} />
        <Route exact path='/semester-view/:id' element={<ProtectedRoute><SemesterViewPage /></ProtectedRoute>} />

        {/* PLO Routes — admin only */}
        <Route exact path='/plos' element={<ProtectedRoute><PLOListPage /></ProtectedRoute>} />
        <Route exact path='/plo-add' element={<ProtectedRoute><PLOAddPage /></ProtectedRoute>} />
        <Route exact path='/plo-edit/:id' element={<ProtectedRoute><PLOEditPage /></ProtectedRoute>} />
        <Route exact path='/plo-bulk-upload' element={<ProtectedRoute><PLOBulkUploadPage /></ProtectedRoute>} />

        {/* CLO Routes — admin only */}
        <Route exact path='/clos' element={<ProtectedRoute><CLOListPage /></ProtectedRoute>} />
        <Route exact path='/clo-add' element={<ProtectedRoute><CLOAddPage /></ProtectedRoute>} />
        <Route exact path='/clo-edit/:id' element={<ProtectedRoute><CLOEditPage /></ProtectedRoute>} />
        <Route exact path='/clo-bulk-upload' element={<ProtectedRoute><CLOBulkUploadPage /></ProtectedRoute>} />
        <Route exact path='/clo-plo-statement/:courseId' element={<ProtectedRoute><CLOPLOStatementPage /></ProtectedRoute>} />
        <Route exact path='/clo-plo-generator' element={<ProtectedRoute><CLOPLOGeneratorPage /></ProtectedRoute>} />

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

