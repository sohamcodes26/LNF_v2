import { Routes, Route } from 'react-router-dom';

// Page Imports
import LandingPage from '../client/src/pages/Landing';
import PostFoundPage from '../client/src/pages/PostFound';
import FindLostItemPage from '../client/src/pages/FindLostItem';
import MyAccountPage from '../client/src/pages/MyAccount';
import FoundItemsPage from '../client/src/pages/FoundItems';
import ReceivedItemsPage from '../client/src/pages/ReceivedItems';
import HelpPage from '../client/src/pages/Help';

// Auth Imports
import ProtectedRoute from '../client/src/components/auth/ProtectedRoute';

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
