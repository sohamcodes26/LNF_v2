import React, { useEffect, useState } from "react";
import axios from "axios";
import { FaArrowLeft, FaBoxOpen, FaMapMarkerAlt, FaCalendarAlt } from "react-icons/fa";
import { CheckCircle, Tag, Droplet, Ruler, Fingerprint } from "lucide-react";

const ReceivedItems = () => {
  const [lostItems, setLostItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchLostItems = async () => {
      try {
        const response = await axios.get("https://lnf-v2.onrender.com/apis/lost-and-found/my-items/my-lost-items", { withCredentials: true });
        setLostItems(response.data.lostItems);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to fetch lost items.");
      } finally {
        setLoading(false);
      }
    };
    fetchLostItems();
  }, []);

  return (
    <div className="min-h-screen bg-slate-100 p-4 sm:p-6">
      <a href="/" className="absolute top-4 left-4 flex items-center text-blue-700 hover:text-blue-900 font-semibold z-10"><FaArrowLeft className="mr-2" /> Back to Home</a>
      <div className="max-w-6xl mx-auto mt-12 bg-white rounded-lg shadow-xl overflow-hidden">
        <div className="bg-gradient-to-r from-purple-600 to-purple-800 p-6 text-white text-center">
          <h1 className="text-3xl font-extrabold">My Lost Items</h1>
          <p className="mt-1 text-purple-200">A list of all items you have reported as lost.</p>
        </div>
        <div className="p-6">
          {loading && <div className="text-center font-medium py-8">Loading...</div>}
          {error && <div className="text-red-600 bg-red-100 p-3 rounded-md text-center my-4">{error}</div>}
          {!loading && !error && (
            lostItems.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {lostItems.map((item) => (
                  <div key={item._id} className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200 flex flex-col">
                    <img
                      src={item.images && item.images[0] ? item.images[0] : "https://placehold.co/400x300/E0E0E0/6C757D?text=No+Image"}
                      alt={item.objectName || "Lost Item"}
                      className="w-full h-48 object-cover"
                    />
                    <div className="p-4 space-y-3 flex-grow flex flex-col">
                      <h3 className="text-xl font-bold text-gray-800 truncate">{item.objectName || "Unnamed Item"}</h3>
                      <div className="text-gray-700 text-sm space-y-2 flex-grow">
                        {item.brand && <p className="flex items-center gap-2"><Tag size={14} className="text-gray-500" /><strong>Brand:</strong> {item.brand}</p>}
                        {item.size && <p className="flex items-center gap-2"><Ruler size={14} className="text-gray-500" /><strong>Size:</strong> {item.size}</p>}
                        {item.colors && item.colors.length > 0 && <p className="flex items-center gap-2"><Droplet size={14} className="text-gray-500" /><strong>Colors:</strong> {item.colors.join(', ')}</p>}
                        {item.markings && <p className="flex items-center gap-2"><Fingerprint size={14} className="text-gray-500" /><strong>Markings:</strong> {item.markings}</p>}
                      </div>
                       <div className="pt-3 mt-auto border-t border-gray-200 text-sm space-y-1">
                          <p className="flex items-center gap-2"><CheckCircle size={14} className="text-green-500" /><strong>Status:</strong> {item.status}</p>
                          <p className="flex items-center gap-2"><FaMapMarkerAlt className="text-blue-500" /><strong>Location:</strong> {item.locationLost || "N/A"}</p>
                          <p className="flex items-center gap-2"><FaCalendarAlt className="text-purple-500" /><strong>Date:</strong> {new Date(item.dateLost).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-gray-600 py-8">
                <FaBoxOpen className="mx-auto text-6xl mb-4 text-gray-400" />
                <p className="text-xl font-semibold">No lost items reported yet.</p>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
};
export default ReceivedItems;
