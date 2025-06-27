"use client";

import { useState } from "react";
import Link from "next/link";
import { api } from "~/trpc/react";

export default function AssociationHome() {
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [transferReason, setTransferReason] = useState("");
  
  // This would be a query to fetch the user's current association
  const associationQuery = api.association.getUserAssociation.useQuery();
  
  // This would be a query to fetch recent events for the association
  const eventsQuery = api.event.getAssociationEvents.useQuery(
    { associationId: associationQuery.data?.id ?? "" },
    { enabled: !!associationQuery.data?.id }
  );
  
  // This would be a mutation to request leaving/transfer
  const requestTransferMutation = api.association.requestTransfer.useMutation({
    onSuccess: () => {
      setShowLeaveModal(false);
      setTransferReason("");
    },
  });

  const handleRequestTransfer = (e: React.FormEvent) => {
    e.preventDefault();
    if (associationQuery.data?.id) {
      requestTransferMutation.mutate({
        associationId: associationQuery.data.id,
        reason: transferReason,
      });
    }
  };

  return (
    <div className="container mx-auto py-8">
      {associationQuery.isLoading ? (
        <div className="text-center">Loading association details...</div>
      ) : associationQuery.error ? (
        <div className="text-center text-red-500">
          Error loading association: {associationQuery.error.message}
        </div>
      ) : !associationQuery.data ? (
        <div className="text-center">
          <p className="mb-4">You are not currently a member of any association.</p>
          <Link 
            href="/associations/discover"
            className="inline-block bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Discover Associations
          </Link>
        </div>
      ) : (
        <>
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">Your Association</h1>
            <button
              onClick={() => setShowLeaveModal(true)}
              className="bg-red-100 text-red-700 px-3 py-1 rounded hover:bg-red-200"
            >
              Request Transfer
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="md:col-span-2 bg-white p-6 rounded shadow-sm">
              <h2 className="text-xl font-semibold mb-4">Association Overview</h2>
              <p className="mb-2">Location: {associationQuery.data.location}</p>
              <p className="mb-2">Members: {associationQuery.data.population} / {associationQuery.data.maxPopulation}</p>
            </div>
            
            <div className="bg-white p-6 rounded shadow-sm">
              <h2 className="text-xl font-semibold mb-4">Quick Links</h2>
              <ul className="space-y-2">
                <li>
                  <Link 
                    href="/events"
                    className="text-blue-600 hover:underline"
                  >
                    View All Events
                  </Link>
                </li>
                <li>
                  <Link 
                    href="/messages"
                    className="text-blue-600 hover:underline"
                  >
                    Messages
                  </Link>
                </li>
                <li>
                  <Link 
                    href="/settings"
                    className="text-blue-600 hover:underline"
                  >
                    Account Settings
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          
          <div className="mb-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Upcoming Events</h2>
              <Link 
                href="/events"
                className="text-sm text-blue-600 hover:underline"
              >
                View All
              </Link>
            </div>
            
            {eventsQuery.isLoading ? (
              <div className="text-center py-4">Loading events...</div>
            ) : eventsQuery.error ? (
              <div className="text-center text-red-500 py-4">
                Error loading events: {eventsQuery.error.message}
              </div>
            ) : eventsQuery.data?.length === 0 ? (
              <div className="text-center py-4">No upcoming events</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {eventsQuery.data?.slice(0, 3).map((event) => (
                  <Link key={event.id} href={`/events/${event.id}`}>
                    <div className="border rounded p-4 hover:shadow-md transition-shadow">
                      <h3 className="font-semibold mb-2">{event.name}</h3>
                      <p className="text-sm text-gray-600 mb-1">
                        {new Date(event.date).toLocaleDateString()}
                      </p>
                      <p className="text-sm text-gray-600">
                        {event.location}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
          
          {/* Leave/Transfer Request Modal */}
          {showLeaveModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-lg max-w-md w-full p-6">
                <h2 className="text-xl font-semibold mb-4">Request Transfer</h2>
                <p className="mb-4">Please provide a reason for your transfer request.</p>
                
                <form onSubmit={handleRequestTransfer}>
                  <textarea
                    value={transferReason}
                    onChange={(e) => setTransferReason(e.target.value)}
                    className="w-full p-2 border rounded mb-4"
                    rows={4}
                    placeholder="Reason for transfer request..."
                    required
                  />
                  
                  <div className="flex justify-end space-x-3">
                    <button
                      type="button"
                      onClick={() => setShowLeaveModal(false)}
                      className="px-4 py-2 border rounded"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={requestTransferMutation.isLoading}
                      className="px-4 py-2 bg-red-600 text-white rounded disabled:bg-gray-400"
                    >
                      {requestTransferMutation.isLoading ? "Submitting..." : "Submit Request"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}