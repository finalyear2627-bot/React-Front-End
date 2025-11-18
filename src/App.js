import { BrowserRouter, Route, Routes } from "react-router-dom";
import HomePageSix from "./pages/HomePageSix";
import CardPage from "./pages/CardPage";
import ChatEmptyPage from "./pages/ChatEmptyPage";
import ChatProfilePage from "./pages/ChatProfilePage";
import CodeGeneratorNewPage from "./pages/CodeGeneratorNewPage";
import CodeGeneratorPage from "./pages/CodeGeneratorPage";
import ColumnChartPage from "./pages/ColumnChartPage";
import CompanyPage from "./pages/CompanyPage";
import ErrorPage from "./pages/ErrorPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import FormValidationPage from "./pages/FormValidationPage";
import ImageGeneratorPage from "./pages/ImageGeneratorPage";
import LineChartPage from "./pages/LineChartPage";
import PieChartPage from "./pages/PieChartPage";
import RoleAccessPage from "./pages/RoleAccessPage";
import SignInPage from "./pages/SignInPage";
import SignUpPage from "./pages/SignUpPage";
import StarredPage from "./pages/StarredPage";
import TableDataPage from "./pages/TableDataPage";
import TextGeneratorPage from "./pages/TextGeneratorPage";
import UsersGridPage from "./pages/UsersGridPage";
import UsersListPage from "./pages/UsersListPage";
import ViewDetailsPage from "./pages/ViewDetailsPage";
import VideoGeneratorPage from "./pages/VideoGeneratorPage";
import ViewProfilePage from "./pages/ViewProfilePage";
import VoiceGeneratorPage from "./pages/VoiceGeneratorPage";
import WizardPage from "./pages/WizardPage";
import RouteScrollToTop from "./helper/RouteScrollToTop";
import TextGeneratorNewPage from "./pages/TextGeneratorNewPage";

function App() {
  return (
    <BrowserRouter>
      <RouteScrollToTop />
      <Routes>
      
        <Route exact path='/dasboard' element={<HomePageSix />} />
       

        {/* SL */}
        <Route exact path='/card' element={<CardPage />} />
        <Route exact path='/chat-empty' element={<ChatEmptyPage />} />
        <Route exact path='/chat-profile' element={<ChatProfilePage />} />
        <Route exact path='/code-generator' element={<CodeGeneratorPage />} />
        <Route
          exact
          path='/code-generator-new'
          element={<CodeGeneratorNewPage />}
        />
        <Route exact path='/column-chart' element={<ColumnChartPage />} />
        <Route exact path='/company' element={<CompanyPage />} />
        <Route exact path='/forgot-password' element={<ForgotPasswordPage />} />
        <Route exact path='/form-validation' element={<FormValidationPage />} />



        <Route exact path='/image-generator' element={<ImageGeneratorPage />} />
        <Route exact path='/line-chart' element={<LineChartPage />} />
        
        <Route exact path='/pie-chart' element={<PieChartPage />} />
        <Route exact path='/role-access' element={<RoleAccessPage />} />
        <Route exact path='/sign-in' element={<SignInPage />} />
        <Route exact path='/sign-up' element={<SignUpPage />} />
        <Route exact path='/starred' element={<StarredPage />} />
        <Route exact path='/table-data' element={<TableDataPage />} />
        <Route
          exact
          path='/text-generator-new'
          element={<TextGeneratorNewPage />}
        />
        <Route exact path='/text-generator' element={<TextGeneratorPage />} />
        <Route exact path='/users-grid' element={<UsersGridPage />} />
        <Route exact path='/users-list' element={<UsersListPage />} />
        <Route exact path='/view-details' element={<ViewDetailsPage />} />
        <Route exact path='/video-generator' element={<VideoGeneratorPage />} />
        <Route exact path='/view-profile' element={<ViewProfilePage />} />
        <Route exact path='/voice-generator' element={<VoiceGeneratorPage />} />
        <Route exact path='/wizard' element={<WizardPage />} />

        <Route exact path='*' element={<ErrorPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
