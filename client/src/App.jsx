import { Routes, Route } from 'react-router-dom';

// Page Imports
import LandingPage from './pages/Landing';
import PostFoundPage from './pages/PostFound';
import FindLostItemPage from './pages/FindLostItem';
import MyAccountPage from './pages/MyAccount';
import FoundItemsPage from './pages/FoundItems';
import ReceivedItemsPage from './pages/ReceivedItems';
import HelpPage from './pages/Help';

// Auth Imports
import ProtectedRoute from './components/auth/ProtectedRoute';

function App() {
  return (
    <Routes>
      {/* public route */}
      <Route path="/" element={<LandingPage />} />

      {/* protected routes */}
      <Route element={<ProtectedRoute />}>
        <Route path="/post-found" element={<PostFoundPage />} />
        <Route path="/find-lost-item" element={<FindLostItemPage />} />
        <Route path="/account" element={<MyAccountPage />} />
        <Route path="/my-found-items" element={<FoundItemsPage />} />
        <Route path="/my-received-items" element={<ReceivedItemsPage />} />
        <Route path="/help" element={<HelpPage />} />
      </Route>
    </Routes>
  );
}

export default App;
