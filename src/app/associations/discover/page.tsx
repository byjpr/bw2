"use client";

import { useState } from "react";
import Link from "next/link";
import { api } from "~/trpc/react";

export default function DiscoverAssociations() {
  const [location, setLocation] = useState("");
  
  // This would be a query to fetch nearby associations based on location
  const associationsQuery = api.association.findNearby.useQuery(
    { location },
    { enabled: location !== "" }
  );

  const handleGetLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setLocation(`${latitude},${longitude}`);
        },
        (error) => {
          console.error("Error getting location:", error);
        }
      );
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // The query will automatically refetch when location changes
  };

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Discover Associations Near You</h1>
      
      <form onSubmit={handleSubmit} className="max-w-md mx-auto mb-8">
        <div className="flex gap-2">
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Enter your postcode"
            className="flex-1 p-2 border rounded"
          />
          <button
            type="button"
            onClick={handleGetLocation}
            className="bg-gray-200 px-3 py-2 rounded"
          >
            📍 Use My Location
          </button>
        </div>
      </form>
      
      {associationsQuery.isLoading ? (
        <div className="text-center">Searching for associations near you...</div>
      ) : associationsQuery.error ? (
        <div className="text-center text-red-500">
          Error finding associations: {associationsQuery.error.message}
        </div>
      ) : associationsQuery.data?.length === 0 ? (
        <div className="text-center">
          No associations found in your area. Please try a different location.
        </div>
      ) : associationsQuery.data ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {associationsQuery.data.map((association) => (
            <div key={association.id} className="border rounded p-4 shadow-sm">
              <h2 className="text-xl font-semibold mb-2">Association {/* Blurred name */}</h2>
              <p className="mb-2">Location: {association.location}</p>
              <p className="mb-4">Members: {association.population} / {association.maxPopulation}</p>
              <Link 
                href={`/associations/apply/${association.id}`}
                className="block text-center bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
              >
                Apply to Join
              </Link>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center">
          Please enter your location or use geolocation to find associations near you.
        </div>
      )}
      
      <div className="mt-8 text-center text-sm text-gray-600">
        <p>Only showing the 3 closest associations to your location.</p>
        <p>Apply to join an association to see more details about it.</p>
      </div>
    </div>
  );
}