import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Upload, CheckCircle, ArrowLeft, Lightbulb } from 'lucide-react';
import Button from '../components/ui/Button';
import Label from '../components/ui/Label';
import axios from 'axios';

const PostFoundPage = () => {
  const [itemTitle, setItemTitle] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const [itemDescription, setItemDescription] = useState('');
  const [locationFound, setLocationFound] = useState('');
  const [dateFound, setDateFound] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleImageUpload = (event) => {
    if (event.target.files && event.target.files[0]) {
      setSelectedImage(event.target.files[0]);
    }
  };

  const handleFormSubmit = async (event) => {
    event.preventDefault();
    if (!itemTitle || !itemDescription || !selectedImage || !locationFound || !dateFound) {
      alert('Please fill out all fields and upload an image.');
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      alert('You must be logged in to post a found item.');
      return;
    }

    const formData = new FormData();
    formData.append('objectName', itemTitle);
    formData.append('objectDescription', itemDescription);
    formData.append('objectImage', selectedImage);
    formData.append('locationFound', locationFound);
    formData.append('dateFound', dateFound);

    try {
      const response = await axios.post('http://localhost:8000/apis/lost-and-found/object-query/report-found', formData, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      setItemTitle('');
      setItemDescription('');
      setSelectedImage(null);
      setLocationFound('');
      setDateFound('');
      setSubmitted(true);
    } catch (error) {
      console.error('Error uploading item:', error);
      alert(error.response?.data?.message || 'Failed to post the item.');
    }
  };

  return (
 <main className="min-h-screen w-full grid grid-cols-1 md:grid-cols-2">

      <div className="flex flex-col justify-center p-8">
        <div className="w-full max-w-md mx-auto">
          <Link to="/" className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 font-medium">
            <ArrowLeft size={18} />
            Back to Home
          </Link>
          <div className="bg-white w-full p-8 rounded-2xl shadow-lg border border-gray-200/80">
            <div className="text-left mb-6">
              <h1 className="text-3xl font-bold text-gray-800">Report a Found Item</h1>
              <p className="text-gray-500 mt-2">Fill out the details below to help us find the owner.</p>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div>
                <Label htmlFor="item-title">Object Type / Title</Label>
                <input
                  id="item-title"
                  type="text"
                  value={itemTitle}
                  onChange={(e) => setItemTitle(e.target.value)}
                  placeholder="e.g., iPhone 14 Pro, Blue Backpack"
                  className="w-full px-4 py-2 text-gray-800 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                  required
                />
              </div>

              <div>
                <Label htmlFor="image-upload">Upload Image</Label>
                <label
                  htmlFor="image-upload"
                  className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer bg-gray-50 hover:bg-gray-100 transition"
                >
                  {selectedImage ? (
                    <img src={URL.createObjectURL(selectedImage)} alt="Preview" className="h-full w-full object-cover rounded-xl" />
                  ) : (
                    <div className="flex flex-col items-center justify-center text-gray-500">
                      <Upload className="w-8 h-8 mb-2" />
                      <p className="font-semibold">Click to upload</p>
                      <p className="text-xs">PNG, JPG, or GIF</p>
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

              <div>
                <Label htmlFor="item-description">Item Description</Label>
                <textarea
                  id="item-description"
                  rows={3}
                  value={itemDescription}
                  onChange={(e) => setItemDescription(e.target.value)}
                  placeholder="Describe the item: color, brand, location found, any unique features..."
                  className="w-full px-4 py-2 text-gray-800 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                  required
                />
              </div>

              <div>
                <Label htmlFor="location-found">Location Found</Label>
                <input
                  id="location-found"
                  type="text"
                  value={locationFound}
                  onChange={(e) => setLocationFound(e.target.value)}
                  placeholder="e.g., Near library gate, classroom 204"
                  className="w-full px-4 py-2 text-gray-800 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                  required
                />
              </div>

              <div>
                <Label htmlFor="date-found">Date Found</Label>
                <input
                  id="date-found"
                  type="date"
                  value={dateFound}
                  onChange={(e) => setDateFound(e.target.value)}
                  className="w-full px-4 py-2 text-gray-800 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                  required
                />
              </div>

              {!submitted ? (
                <Button type="submit" variant="cta">
                  <CheckCircle className="w-5 h-5" />
                  Post Found Item
                </Button>
              ) : (
                <p className="text-green-600 font-semibold text-center mt-4">
                  ✅ Found item posted successfully!
                </p>
              )}
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
            <h2 className="text-3xl font-bold text-gray-800">Tips for a Good Post</h2>
          </div>
          <ul className="space-y-6 text-gray-600">
            <li className="flex gap-4">
              <div className="font-bold text-blue-500">1.</div>
              <div>
                <h3 className="font-semibold text-gray-800">Use a Clear Photo</h3>
                <p>Take a well-lit picture of the item against a neutral background. This helps our AI and other users identify it more easily.</p>
              </div>
            </li>
            <li className="flex gap-4">
              <div className="font-bold text-blue-500">2.</div>
              <div>
                <h3 className="font-semibold text-gray-800">Be Descriptive</h3>
                <p>Include key details like brand, color, size, and any unique marks or scratches. The more information, the better!</p>
              </div>
            </li>
            <li className="flex gap-4">
              <div className="font-bold text-blue-500">3.</div>
              <div>
                <h3 className="font-semibold text-gray-800">Mention the Location</h3>
                <p>Be specific about where you found the item (e.g., "on a bench near the library entrance" or "in room 204 of the science building").</p>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </main>
  );
};

export default PostFoundPage;
