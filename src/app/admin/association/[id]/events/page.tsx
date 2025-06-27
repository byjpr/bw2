"use client";

import { useState } from "react";
import Link from "next/link";
import { api } from "~/trpc/react";

export default function AssociationAdminEvents({ params }: { params: { id: string } }) {
  const [showCreateModal, setShowCreateModal] = useState(false);
  
  // This would be a query to fetch association details
  const associationQuery = api.association.getById.useQuery({ id: params.id });
  
  // This would be a query to fetch all events for the association
  const eventsQuery = api.event.getAllAssociationEvents.useQuery({ associationId: params.id });
  
  // This would be a mutation to create a new event
  const createEventMutation = api.event.createEvent.useMutation({
    onSuccess: () => {
      void eventsQuery.refetch();
      setShowCreateModal(false);
    },
  });
  
  // This would be a mutation to delete an event
  const deleteEventMutation = api.event.deleteEvent.useMutation({
    onSuccess: () => {
      void eventsQuery.refetch();
    },
  });

  const handleDeleteEvent = (eventId: string) => {
    if (window.confirm("Are you sure you want to delete this event? This action cannot be undone.")) {
      deleteEventMutation.mutate({ id: eventId });
    }
  };

  const handleCreateEvent = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    
    const name = formData.get("name") as string;
    const location = formData.get("location") as string;
    const date = formData.get("date") as string;
    const arrivalTime = formData.get("arrivalTime") as string;
    const arrivalRules = formData.get("arrivalRules") as string;
    const descriptionMd = formData.get("descriptionMd") as string;
    const ticketLink = formData.get("ticketLink") as string;
    
    createEventMutation.mutate({
      associationId: params.id,
      name,
      location,
      date: new Date(date),
      arrivalTime: `${date}T${arrivalTime}`,
      arrivalRules,
      descriptionMd,
      ticketLink: ticketLink || undefined,
    });
  };

  // Check if the current user is an admin of this association
  const isAdminQuery = api.association.isUserAssociationAdmin.useQuery({ associationId: params.id });
  const isPlatformAdminQuery = api.user.isPlatformAdmin.useQuery();
  
  const hasAdminAccess = isAdminQuery.data || isPlatformAdminQuery.data;

  if (isAdminQuery.isLoading || isPlatformAdminQuery.isLoading) {
    return <div className="container mx-auto py-8 text-center">Verifying admin access...</div>;
  }

  if (!hasAdminAccess) {
    return (
      <div className="container mx-auto py-8 text-center">
        <h1 className="text-2xl font-bold mb-4">Unauthorized</h1>
        <p>You do not have permission to manage events for this association.</p>
        <Link href="/association" className="text-blue-600 hover:underline">
          Return to Association Home
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-6">
        <Link href={`/admin/association/${params.id}`} className="text-blue-600 hover:underline">
          ← Back to Association Admin
        </Link>
      </div>
      
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Manage Association Events</h1>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
        >
          Create New Event
        </button>
      </div>
      
      {associationQuery.isLoading ? (
        <div className="text-center">Loading association details...</div>
      ) : associationQuery.error ? (
        <div className="text-center text-red-500">
          Error loading association: {associationQuery.error.message}
        </div>
      ) : associationQuery.data ? (
        <div className="bg-white p-6 rounded shadow-sm mb-6">
          <h2 className="text-xl font-semibold mb-4">Association: {associationQuery.data.name || "Unnamed Association"}</h2>
          <p className="mb-2">Location: {associationQuery.data.location}</p>
          <p>Members: {associationQuery.data.population} / {associationQuery.data.maxPopulation}</p>
        </div>
      ) : null}
      
      <div className="bg-white p-6 rounded shadow-sm">
        <h2 className="text-xl font-semibold mb-4">Events</h2>
        
        {eventsQuery.isLoading ? (
          <div className="text-center py-4">Loading events...</div>
        ) : eventsQuery.error ? (
          <div className="text-center text-red-500 py-4">
            Error loading events: {eventsQuery.error.message}
          </div>
        ) : eventsQuery.data?.length === 0 ? (
          <div className="text-center py-4">No events created yet</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border">
              <thead className="bg-gray-100">
                <tr>
                  <th className="py-2 px-4 border-b text-left">Name</th>
                  <th className="py-2 px-4 border-b text-left">Date</th>
                  <th className="py-2 px-4 border-b text-left">Location</th>
                  <th className="py-2 px-4 border-b text-left">RSVPs</th>
                  <th className="py-2 px-4 border-b text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {eventsQuery.data?.map((event) => (
                  <tr key={event.id}>
                    <td className="py-2 px-4 border-b">{event.name}</td>
                    <td className="py-2 px-4 border-b">
                      {new Date(event.date).toLocaleDateString()}
                    </td>
                    <td className="py-2 px-4 border-b">{event.location}</td>
                    <td className="py-2 px-4 border-b">
                      {event.rsvpCounts?.yes || 0} going / {event.rsvpCounts?.maybe || 0} maybe
                    </td>
                    <td className="py-2 px-4 border-b">
                      <Link 
                        href={`/admin/association/${params.id}/events/${event.id}`}
                        className="text-blue-600 hover:text-blue-800 mr-3"
                      >
                        Edit
                      </Link>
                      <Link 
                        href={`/admin/events/${event.id}/checkin`}
                        className="text-green-600 hover:text-green-800 mr-3"
                      >
                        Check-in
                      </Link>
                      <button
                        onClick={() => handleDeleteEvent(event.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      
      {/* Create Event Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full p-6 overflow-y-auto max-h-[90vh]">
            <h2 className="text-xl font-semibold mb-4">Create New Event</h2>
            
            <form onSubmit={handleCreateEvent}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label htmlFor="name" className="block mb-2">Event Name</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    className="w-full p-2 border rounded"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="location" className="block mb-2">Location</label>
                  <input
                    type="text"
                    id="location"
                    name="location"
                    className="w-full p-2 border rounded"
                    required
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label htmlFor="date" className="block mb-2">Date</label>
                  <input
                    type="date"
                    id="date"
                    name="date"
                    className="w-full p-2 border rounded"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="arrivalTime" className="block mb-2">Arrival Time</label>
                  <input
                    type="time"
                    id="arrivalTime"
                    name="arrivalTime"
                    className="w-full p-2 border rounded"
                    required
                  />
                </div>
              </div>
              
              <div className="mb-4">
                <label htmlFor="arrivalRules" className="block mb-2">Arrival Rules</label>
                <select
                  id="arrivalRules"
                  name="arrivalRules"
                  className="w-full p-2 border rounded"
                  required
                >
                  <option value="ON_TIME">On Time</option>
                  <option value="BRITISH_SOCIAL">British Social Time (15min late)</option>
                  <option value="BRITISH_BUSINESS">British Business Time (5min early)</option>
                  <option value="GERMAN">German Time (10min early)</option>
                </select>
              </div>
              
              <div className="mb-4">
                <label htmlFor="descriptionMd" className="block mb-2">Description (Markdown)</label>
                <textarea
                  id="descriptionMd"
                  name="descriptionMd"
                  rows={5}
                  className="w-full p-2 border rounded"
                />
              </div>
              
              <div className="mb-4">
                <label htmlFor="ticketLink" className="block mb-2">Ticket Link (Optional)</label>
                <input
                  type="url"
                  id="ticketLink"
                  name="ticketLink"
                  className="w-full p-2 border rounded"
                />
              </div>
              
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 border rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createEventMutation.isLoading}
                  className="px-4 py-2 bg-green-600 text-white rounded disabled:bg-gray-400"
                >
                  {createEventMutation.isLoading ? "Creating..." : "Create Event"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}