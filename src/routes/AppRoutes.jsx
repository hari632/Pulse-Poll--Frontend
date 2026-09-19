import { BrowserRouter, Routes, Route } from "react-router-dom";

import Landing from "../pages/Landing/Landing";
import CreatePoll from "../pages/CreatePoll/CreatePoll";
import Vote from "../pages/Vote/Vote";
import Results from "../pages/Results/Results";
import Login from "../pages/Login/Login.jsx";
import SignUp from "../pages/SignUp/SignUp.jsx";
import JoinPoll from "../pages/JoinPoll/JoinPoll.jsx";
import MyPolls from "../pages/MyPolls/MyPolls.jsx";
import PollSharing from "../pages/PollSharing/PollSharing.jsx";
import QrCode from "../pages/QrCode/QrCode.jsx";
import VoteSuccess from "../pages/VoteSuccess/VoteSuccess.jsx";
import PollClosed from "../pages/PollClosed/PollClosed.jsx";
import PollNotFound from "../pages/PollNotFound/PollNotFound.jsx";
import PollDetails from "../pages/PollDetails/PollDetails.jsx";
import Settings from "../pages/Settings/Settings.jsx";
import ProtectedRoute from "../components/auth/ProtectedRoute.jsx";

function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        {/* =========================================
            LANDING
        ========================================= */}

        <Route path="/" element={<Landing />} />

        {/* =========================================
            AUTHENTICATION
        ========================================= */}

        <Route path="/login" element={<Login />} />

        <Route path="/signup" element={<SignUp />} />

        {/* =========================================
            POLL CREATION
        ========================================= */}

        <Route
          path="/create"
          element={
            <ProtectedRoute>
              <CreatePoll />
            </ProtectedRoute>
          }
        />

        {/* =========================================
            JOINING
        ========================================= */}

        <Route path="/join" element={<JoinPoll />} />

        {/* =========================================
            POLL SHARING
        ========================================= */}

        <Route
          path="/share/:pollId"
          element={<PollSharing />}
        />

        {/* =========================================
            QR CODE
        ========================================= */}

        <Route
          path="/qr/:pollId"
          element={<QrCode />}
        />

        {/* =========================================
            VOTING
        ========================================= */}

        <Route
          path="/poll/:pollId"
          element={<Vote />}
        />

        <Route
          path="/vote-success/:pollId"
          element={<VoteSuccess />}
        />

        {/* =========================================
            RESULTS
        ========================================= */}

        <Route
          path="/results/:pollId"
          element={<Results />}
        />

        {/* =========================================
            POLL DETAILS / ANALYTICS
        ========================================= */}

        <Route
          path="/poll-details/:pollId"
          element={
            <ProtectedRoute>
              <PollDetails />
            </ProtectedRoute>
          }
        />

        <Route
          path="/p/:pollId"
          element={<Vote />}
        />

        {/* =========================================
            USER POLLS
        ========================================= */}

        <Route
          path="/mypolls"
          element={
            <ProtectedRoute>
              <MyPolls />
            </ProtectedRoute>
          }
        />

        {/* =========================================
            POLL CLOSED
        ========================================= */}

        <Route
          path="/poll-closed/:pollId"
          element={<PollClosed />}
        />

        {/* =========================================
            SETTINGS
        ========================================= */}

        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <Settings />
            </ProtectedRoute>
          }
        />

        {/* =========================================
            POLL NOT FOUND
        ========================================= */}

        <Route
          path="/poll-not-found"
          element={<PollNotFound />}
        />

        {/* =========================================
            FALLBACK
        ========================================= */}

        <Route
          path="*"
          element={<PollNotFound />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRoutes;