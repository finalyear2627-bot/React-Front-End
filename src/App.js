import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import HomePageOne from "./pages/HomePageOne";
import HomePageThree from "./pages/HomePageThree";
import HomePageFour from "./pages/HomePageFour";
import HomePageFive from "./pages/HomePageFive";
import HomePageSix from "./pages/HomePageSix";
import HomePageSeven from "./pages/HomePageSeven";
import AddUserPage from "./pages/AddUserPage";
import AssignRolePage from "./pages/AssignRolePage";
import ChatEmptyPage from "./pages/ChatEmptyPage";
import ChatProfilePage from "./pages/ChatProfilePage";
import CodeGeneratorNewPage from "./pages/CodeGeneratorNewPage";
import CodeGeneratorPage from "./pages/CodeGeneratorPage";


import ErrorPage from "./pages/ErrorPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import FormLayoutPage from "./pages/FormLayoutPage";
import FormValidationPage from "./pages/FormValidationPage";
import FormPage from "./pages/FormPage";
import InvoiceAddPage from "./pages/InvoiceAddPage";


import MarketplaceDetailsPage from "./pages/MarketplaceDetailsPage";
import MarketplacePage from "./pages/MarketplacePage";



import PortfolioPage from "./pages/PortfolioPage";
import RoleAccessPage from "./pages/RoleAccessPage";
import SignInPage from "./pages/SignInPage";
import SignUpPage from "./pages/SignUpPage";
import StarredPage from "./pages/StarredPage";
import TableBasicPage from "./pages/TableBasicPage";
import TableDataPage from "./pages/TableDataPage";
import TextGeneratorPage from "./pages/TextGeneratorPage";

import UsersGridPage from "./pages/UsersGridPage";
import UsersListPage from "./pages/UsersListPage";
import ViewDetailsPage from "./pages/ViewDetailsPage";

import ViewProfilePage from "./pages/ViewProfilePage";

import WizardPage from "./pages/WizardPage";
import RouteScrollToTop from "./helper/RouteScrollToTop";
import TextGeneratorNewPage from "./pages/TextGeneratorNewPage";
import HomePageEight from "./pages/HomePageEight";
import HomePageNine from "./pages/HomePageNine";
import HomePageTen from "./pages/HomePageTen";
import HomePageEleven from "./pages/HomePageEleven";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <BrowserRouter>
      <RouteScrollToTop />
      <Routes>
        <Route exact path='/' element={<Navigate to='/sign-in' />} />
        <Route exact path='/dashboard' element={<ProtectedRoute><HomePageOne /></ProtectedRoute>} />
        <Route exact path='/index-3' element={<ProtectedRoute><HomePageThree /></ProtectedRoute>} />
        <Route exact path='/index-4' element={<ProtectedRoute><HomePageFour /></ProtectedRoute>} />
        <Route exact path='/index-5' element={<ProtectedRoute><HomePageFive /></ProtectedRoute>} />
        <Route exact path='/index-6' element={<ProtectedRoute><HomePageSix /></ProtectedRoute>} />
        <Route exact path='/index-7' element={<ProtectedRoute><HomePageSeven /></ProtectedRoute>} />
        <Route exact path='/index-8' element={<ProtectedRoute><HomePageEight /></ProtectedRoute>} />
        <Route exact path='/index-9' element={<ProtectedRoute><HomePageNine /></ProtectedRoute>} />
        <Route exact path='/index-10' element={<ProtectedRoute><HomePageTen /></ProtectedRoute>} />
        <Route exact path='/index-11' element={<ProtectedRoute><HomePageEleven /></ProtectedRoute>} />

        {/* SL */}
        <Route exact path='/add-user' element={<ProtectedRoute><AddUserPage /></ProtectedRoute>} />
        <Route exact path='/assign-role' element={<ProtectedRoute><AssignRolePage /></ProtectedRoute>} />
        <Route exact path='/chat-empty' element={<ProtectedRoute><ChatEmptyPage /></ProtectedRoute>} />
        <Route exact path='/chat-profile' element={<ProtectedRoute><ChatProfilePage /></ProtectedRoute>} />
        <Route exact path='/code-generator' element={<ProtectedRoute><CodeGeneratorPage /></ProtectedRoute>} />
        <Route exact path='/code-generator-new' element={<ProtectedRoute><CodeGeneratorNewPage /></ProtectedRoute>} />
        <Route exact path='/forgot-password' element={<ForgotPasswordPage />} />
        <Route exact path='/form-layout' element={<ProtectedRoute><FormLayoutPage /></ProtectedRoute>} />
        <Route exact path='/form-validation' element={<ProtectedRoute><FormValidationPage /></ProtectedRoute>} />
        <Route exact path='/form' element={<ProtectedRoute><FormPage /></ProtectedRoute>} />
        <Route exact path='/invoice-add' element={<ProtectedRoute><InvoiceAddPage /></ProtectedRoute>} />
        <Route exact path='/marketplace-details' element={<ProtectedRoute><MarketplaceDetailsPage /></ProtectedRoute>} />
        <Route exact path='/marketplace' element={<ProtectedRoute><MarketplacePage /></ProtectedRoute>} />
        <Route exact path='/portfolio' element={<ProtectedRoute><PortfolioPage /></ProtectedRoute>} />
        <Route exact path='/role-access' element={<ProtectedRoute><RoleAccessPage /></ProtectedRoute>} />
        <Route exact path='/sign-in' element={<SignInPage />} />
        <Route exact path='/sign-up' element={<SignUpPage />} />
        <Route exact path='/starred' element={<ProtectedRoute><StarredPage /></ProtectedRoute>} />
        <Route exact path='/table-basic' element={<ProtectedRoute><TableBasicPage /></ProtectedRoute>} />
        <Route exact path='/table-data' element={<ProtectedRoute><TableDataPage /></ProtectedRoute>} />
        <Route exact path='/text-generator-new' element={<ProtectedRoute><TextGeneratorNewPage /></ProtectedRoute>} />
        <Route exact path='/text-generator' element={<ProtectedRoute><TextGeneratorPage /></ProtectedRoute>} />
        <Route exact path='/users-grid' element={<ProtectedRoute><UsersGridPage /></ProtectedRoute>} />
        <Route exact path='/users-list' element={<ProtectedRoute><UsersListPage /></ProtectedRoute>} />
        <Route exact path='/view-details' element={<ProtectedRoute><ViewDetailsPage /></ProtectedRoute>} />
        <Route exact path='/view-profile' element={<ProtectedRoute><ViewProfilePage /></ProtectedRoute>} />
        <Route exact path='/wizard' element={<ProtectedRoute><WizardPage /></ProtectedRoute>} />

        <Route exact path='*' element={<ErrorPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
