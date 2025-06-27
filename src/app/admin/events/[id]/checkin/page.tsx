"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "~/trpc/react";

export default function EventCheckin({ params }: { params: { id: string } }) {
  const [scanMode, setScanMode] = useState(true);
  const [manualEmail, setManualEmail] = useState("");
  const [scanResult, setScanResult] = useState<string | null>(null);
  
  // This would be a query to fetch event details
  const eventQuery = api.event.getById.useQuery({ id: params.id });
  
  // This would be a query to fetch the association for this event
  const associationQuery = api.event.getEventAssociation.useQuery(
    { eventId: params.id },
    { enabled: !!eventQuery.data }
  );
  
  // This would be a query to fetch attendees/check-ins for this event
  const checkinsQuery = api.event.getEventCheckins.useQuery(
    { eventId: params.id },
    { refetchInterval: 5000 } // Refresh every 5 seconds
  );
  
  // This would be a mutation to check in a user
  const checkinMutation = api.event.checkInUser.useMutation({
    onSuccess: () => {
      void checkinsQuery.refetch();
      setScanResult(null);
      setManualEmail("");
    },
  });

  // Add a useEffect for QR code scanning - in a real implementation, 
  // this would use a QR code scanning library
  useEffect(() => {
    if (scanMode) {
      // Mock scanning - in real implementation, this would use a library like jsQR
      const mockScanTimer = setTimeout(() => {
        // Simulate a scan being detected
        // setScanResult("user_id_123");
      }, 30000);
      
      return () => clearTimeout(mockScanTimer);
    }
  }, [scanMode]);

  const handleScanResult = (result: string) => {
    setScanResult(result);
    // In a real implementation, the scan result would contain a user ID or a token
    // that can be used to identify the user
    checkinMutation.mutate({
      eventId: params.id,
      userId: result,
      notes: "",
    });
  };

  const handleManualCheckin = (e: React.FormEvent) => {
    e.preventDefault();
    
    // In a real implementation, you would look up the user by email first
    checkinMutation.mutate({
      eventId: params.id,
      email: manualEmail,
      notes: "",
    });
  };

  // Check if the current user is an admin of this association
  const isAdminQuery = api.association.isUserAssociationAdmin.useQuery(
    { associationId: associationQuery.data?.id ?? "" },
    { enabled: !!associationQuery.data?.id }
  );
  const isPlatformAdminQuery = api.user.isPlatformAdmin.useQuery();
  
  const hasAdminAccess = isAdminQuery.data || isPlatformAdminQuery.data;

  if (isAdminQuery.isLoading || isPlatformAdminQuery.isLoading || eventQuery.isLoading || associationQuery.isLoading) {
    return <div className="container mx-auto py-8 text-center">Loading...</div>;
  }

  if (eventQuery.error || associationQuery.error) {
    return (
      <div className="container mx-auto py-8 text-center">
        <h1 className="text-2xl font-bold mb-4">Error</h1>
        <p>Failed to load event details: {eventQuery.error?.message || associationQuery.error?.message}</p>
        <Link href="/admin" className="text-blue-600 hover:underline">
          Return to Admin Dashboard
        </Link>
      </div>
    );
  }

  if (!hasAdminAccess) {
    return (
      <div className="container mx-auto py-8 text-center">
        <h1 className="text-2xl font-bold mb-4">Unauthorized</h1>
        <p>You do not have permission to manage check-ins for this event.</p>
        <Link href="/association" className="text-blue-600 hover:underline">
          Return to Association Home
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-6">
        <Link 
          href={`/admin/association/${associationQuery.data?.id}/events`} 
          className="text-blue-600 hover:underline"
        >
          ← Back to Events List
        </Link>
      </div>
      
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Event Check-in</h1>
        <div className="text-sm text-gray-600">
          {new Date(eventQuery.data?.date ?? "").toLocaleDateString()}
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-white p-6 rounded shadow-sm mb-6">
            <h2 className="text-xl font-semibold mb-4">{eventQuery.data?.name}</h2>
            <p className="mb-2">Location: {eventQuery.data?.location}</p>
            <p className="mb-2">
              Time: {new Date(eventQuery.data?.arrivalTime ?? "").toLocaleTimeString([], { 
                hour: '2-digit', 
                minute: '2-digit' 
              })}
            </p>
          </div>
          
          <div className="bg-white p-6 rounded shadow-sm">
            <div className="flex mb-6">
              <button
                onClick={() => setScanMode(true)}
                className={`px-4 py-2 ${scanMode ? "bg-blue-500 text-white" : "bg-gray-200"} rounded-l`}
              >
                Scan QR Code
              </button>
              <button
                onClick={() => setScanMode(false)}
                className={`px-4 py-2 ${!scanMode ? "bg-blue-500 text-white" : "bg-gray-200"} rounded-r`}
              >
                Manual Check-in
              </button>
            </div>
            
            {scanMode ? (
              <div className="text-center">
                <div className="bg-gray-100 p-4 rounded mb-4 aspect-square max-w-md mx-auto flex items-center justify-center">
                  <p>QR Scanner would be here</p>
                  {/* In a real implementation, this would be a QR code scanner component */}
                </div>
                
                <p className="text-sm text-gray-600 mb-4">
                  Point your camera at the attendee's QR code to check them in.
                </p>
                
                {scanResult && (
                  <div className="bg-green-100 text-green-800 p-4 rounded mb-4">
                    Scan detected! Processing...
                  </div>
                )}
                
                {checkinMutation.isLoading && (
                  <div className="bg-blue-100 text-blue-800 p-4 rounded mb-4">
                    Checking in user...
                  </div>
                )}
                
                {checkinMutation.isError && (
                  <div className="bg-red-100 text-red-800 p-4 rounded mb-4">
                    Error: {checkinMutation.error.message}
                  </div>
                )}
                
                {checkinMutation.isSuccess && (
                  <div className="bg-green-100 text-green-800 p-4 rounded mb-4">
                    Check-in successful!
                  </div>
                )}
              </div>
            ) : (
              <div>
                <form onSubmit={handleManualCheckin}>
                  <div className="mb-4">
                    <label htmlFor="email" className="block mb-2">Enter Email Address</label>
                    <input
                      type="email"
                      id="email"
                      value={manualEmail}
                      onChange={(e) => setManualEmail(e.target.value)}
                      className="w-full p-2 border rounded"
                      required
                    />
                  </div>
                  
                  <button
                    type="submit"
                    disabled={checkinMutation.isLoading || !manualEmail}
                    className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600 disabled:bg-gray-400"
                  >
                    {checkinMutation.isLoading ? "Checking in..." : "Check In"}
                  </button>
                  
                  {checkinMutation.isError && (
                    <div className="mt-4 bg-red-100 text-red-800 p-4 rounded">
                      Error: {checkinMutation.error.message}
                    </div>
                  )}
                  
                  {checkinMutation.isSuccess && (
                    <div className="mt-4 bg-green-100 text-green-800 p-4 rounded">
                      Check-in successful!
                    </div>
                  )}
                </form>
              </div>
            )}
          </div>
        </div>
        
        <div>
          <div className="bg-white p-6 rounded shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Attendees</h2>
              <div className="text-sm font-semibold">
                {checkinsQuery.data?.length || 0} / {eventQuery.data?.expectedAttendees || "?"}
              </div>
            </div>
            
            {checkinsQuery.isLoading ? (
              <div className="text-center py-4">Loading attendees...</div>
            ) : checkinsQuery.error ? (
              <div className="text-center text-red-500 py-4">
                Error loading attendees: {checkinsQuery.error.message}
              </div>
            ) : checkinsQuery.data?.length === 0 ? (
              <div className="text-center py-4">No check-ins yet</div>
            ) : (
              <div className="max-h-96 overflow-y-auto">
                <table className="min-w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="py-2 px-4 text-left">Name</th>
                      <th className="py-2 px-4 text-left">Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {checkinsQuery.data?.map((checkin) => (
                      <tr key={checkin.id} className="border-b">
                        <td className="py-2 px-4">{checkin.user.name}</td>
                        <td className="py-2 px-4">
                          {new Date(checkin.checkedInAt).toLocaleTimeString([], { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}