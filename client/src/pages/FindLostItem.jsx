import React, { useState, useMemo } from 'react'; // 1. Import useMemo
import { Link } from 'react-router-dom';
import { Search, ArrowLeft, Lightbulb, Upload } from 'lucide-react';
import Button from '../components/ui/Button';
import Label from '../components/ui/Label';
import axios from 'axios';

const FindLostItemPage = () => {
  const [objectName, setObjectName] = useState('');
  const [objectDescription, setObjectDescription] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const [locationLost, setLocationLost] = useState('');
  const [dateLost, setDateLost] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  // 2. Generate location list
  const campusLocations = useMemo(() => {
    const generalLocations = ['Campus', 'Grounds'];
    const buildings = ['A', 'B', 'C', 'D', 'E'];
    return [...generalLocations, ...buildings];
  }, []);

  const handleImageUpload = (event) => {
    if (event.target.files && event.target.files[0]) {
      setSelectedImage(event.target.files[0]);
    }
  };

  const handleFormSubmit = async (event) => {
    event.preventDefault();
    setMessage('');
    setLoading(true);

    if (!objectName && !objectDescription && !selectedImage && !locationLost && !dateLost) {
      setMessage('Please fill out at least one field to report a lost item.');
      setLoading(false);
      return;
    }

    const formData = new FormData();
    formData.append('objectName', objectName);
    formData.append('objectDescription', objectDescription);
    formData.append('locationLost', locationLost);
    formData.append('dateLost', dateLost);
    if (selectedImage) {
      formData.append('objectImage', selectedImage);
    }

    const config = {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      withCredentials: true,
    };

    try {
      const response = await axios.post('http://localhost:8000/apis/lost-and-found/object-query/report-lost', formData, config);
      setMessage(response.data.message || 'Lost item reported successfully!');
      setObjectName('');
      setObjectDescription('');
      setSelectedImage(null);
      setLocationLost('');
      setDateLost('');
    } catch (err) {
      console.error('Error reporting lost item:', err);
      if (err.response && (err.response.status === 401 || err.response.status === 403)) {
        setMessage('Session expired or not authenticated. Please log in to report an item.');
      } else {
        setMessage(err.response?.data?.message || 'Failed to report lost item. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen w-full grid grid-cols-1 md:grid-cols-2 overflow-hidden bg-gray-100">
      <div className="flex flex-col justify-center p-8">
        <div className="w-full max-w-md mx-auto">
          <Link to="/" className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 font-medium">
              <ArrowLeft size={18} />
              Back to Home
          </Link>
          <div className="bg-white w-full p-8 rounded-2xl shadow-lg border border-gray-200/80">
            <div className="text-left mb-6">
              <h1 className="text-3xl font-bold text-gray-800">Find my Lost Item</h1>
              <p className="text-gray-500 mt-2">Provide details about your lost item to help us find it.</p>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div>
                <Label htmlFor="object-name">Object Name</Label>
                <input
                  id="object-name"
                  type="text"
                  value={objectName}
                  onChange={(e) => setObjectName(e.target.value)}
                  placeholder="e.g., iPhone 14 Pro, Blue Backpack"
                  className="w-full px-4 py-2 text-gray-800 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                  required
                />
              </div>

              <div>
                <Label htmlFor="object-description">Object Description</Label>
                <textarea
                  id="object-description"
                  rows={3}
                  value={objectDescription}
                  onChange={(e) => setObjectDescription(e.target.value)}
                  placeholder="Describe the item: color, brand, any unique features..."
                  className="w-full px-4 py-2 text-gray-800 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                  required
                />
              </div>

              <div>
                <Label htmlFor="location-lost">Location Lost</Label>
                {/* 3. Replaced input with select dropdown */}
                <select
                  id="location-lost"
                  value={locationLost}
                  onChange={(e) => setLocationLost(e.target.value)}
                  className="w-full px-4 py-2 text-gray-800 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white"
                  required
                >
                  <option value="" disabled>Select a location</option>
                  {campusLocations.map(loc => (
                    <option key={loc} value={loc}>{loc}</option>
                  ))}
                </select>
              </div>

              <div>
                <Label htmlFor="date-lost">Date Lost</Label>
                <input
                  id="date-lost"
                  type="date"
                  value={dateLost}
                  onChange={(e) => setDateLost(e.target.value)}
                  className="w-full px-4 py-2 text-gray-800 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                  required
                />
              </div>

              <div>
                <Label htmlFor="image-upload">Upload Image (Optional)</Label>
                <label
                  htmlFor="image-upload"
                  className="flex flex-col items-center justify-center w-full h-36 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer bg-gray-50 hover:bg-gray-100 transition"
                >
                  {selectedImage ? (
                    <img src={URL.createObjectURL(selectedImage)} alt="Preview" className="h-full w-full object-cover rounded-xl"/>
                  ) : (
                    <div className="flex flex-col items-center justify-center text-gray-500">
                      <Upload className="w-8 h-8 mb-2" />
                      <p className="font-semibold">Upload an image of the item</p>
                      <p className="text-xs">This can improve matching accuracy</p>
                    </div>
                  )}
                </label>
                <input
                  id="image-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageUpload}
                />
              </div>

              {message && (
                <p className={`text-center text-sm ${message.includes('successfully') ? 'text-green-600' : 'text-red-600'}`}>
                  {message}
                </p>
              )}

              <Button type="submit" variant="primary" disabled={loading}>
                <Search className="w-5 h-5" />
                {loading ? 'Reporting...' : 'Report Lost Item'}
              </Button>
            </form>
          </div>
        </div>
      </div>

      <div className="hidden md:flex flex-col justify-center bg-gradient-to-br from-gray-50 via-blue-50 to-gray-100 p-12 lg:p-20">
        <div className="max-w-md">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <Lightbulb className="w-6 h-6 text-blue-600" />
            </div>
            <h2 className="text-3xl font-bold text-gray-800">Tips for Reporting</h2>
          </div>
          <ul className="space-y-6 text-gray-600">
            <li className="flex gap-4">
              <div className="font-bold text-blue-500">1.</div>
              <div>
                <h3 className="font-semibold text-gray-800">Be Specific</h3>
                <p>Provide detailed information about the item, including color, brand, and any unique marks.</p>
              </div>
            </li>
            <li className="flex gap-4">
              <div className="font-bold text-blue-500">2.</div>
              <div>
                <h3 className="font-semibold text-gray-800">Accurate Location & Date</h3>
                <p>Pinpoint where and when you last saw the item. This is crucial for matching.</p>
              </div>
            </li>
            <li className="flex gap-4">
              <div className="font-bold text-blue-500">3.</div>
              <div>
                <h3 className="font-semibold text-gray-800">Upload a Clear Image</h3>
                <p>A good quality image significantly increases the chances of your item being recognized.</p>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </main>
  );
};

export default FindLostItemPage;