"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { api } from "~/trpc/react";

export default function EditEvent({ params }: { params: { id: string; eventId: string } }) {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    location: "",
    date: "",
    arrivalTime: "",
    arrivalRules: "",
    descriptionMd: "",
    ticketLink: "",
    showAttendees: false,
  });
  
  // This would be a query to fetch event details
  const eventQuery = api.event.getById.useQuery({ id: params.eventId });
  
  // This would be a mutation to update an event
  const updateEventMutation = api.event.updateEvent.useMutation({
    onSuccess: () => {
      router.push(`/admin/association/${params.id}/events`);
    },
  });
  
  // This would be a query to fetch RSVPs for the event
  const rsvpsQuery = api.event.getEventRSVPs.useQuery({ eventId: params.eventId });

  // Check if the current user is an admin of this association
  const isAdminQuery = api.association.isUserAssociationAdmin.useQuery({ associationId: params.id });
  const isPlatformAdminQuery = api.user.isPlatformAdmin.useQuery();
  
  const hasAdminAccess = isAdminQuery.data || isPlatformAdminQuery.data;

  useEffect(() => {
    if (eventQuery.data) {
      const event = eventQuery.data;
      const dateObj = new Date(event.date);
      const timeObj = new Date(event.arrivalTime);
      
      setFormData({
        name: event.name,
        location: event.location,
        date: dateObj.toISOString().split("T")[0],
        arrivalTime: timeObj.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: false }),
        arrivalRules: event.arrivalRules,
        descriptionMd: event.descriptionMd || "",
        ticketLink: event.ticketLink || "",
        showAttendees: event.showAttendees || false,
      });
    }
  }, [eventQuery.data]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData((prev) => ({ ...prev, [name]: checked }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    updateEventMutation.mutate({
      id: params.eventId,
      name: formData.name,
      location: formData.location,
      date: new Date(formData.date),
      arrivalTime: `${formData.date}T${formData.arrivalTime}`,
      arrivalRules: formData.arrivalRules,
      descriptionMd: formData.descriptionMd,
      ticketLink: formData.ticketLink || undefined,
      showAttendees: formData.showAttendees,
    });
  };

  if (isAdminQuery.isLoading || isPlatformAdminQuery.isLoading || eventQuery.isLoading) {
    return <div className="container mx-auto py-8 text-center">Loading...</div>;
  }

  if (!hasAdminAccess) {
    return (
      <div className="container mx-auto py-8 text-center">
        <h1 className="text-2xl font-bold mb-4">Unauthorized</h1>
        <p>You do not have permission to edit events for this association.</p>
        <Link href="/association" className="text-blue-600 hover:underline">
          Return to Association Home
        </Link>
      </div>
    );
  }

  if (eventQuery.error) {
    return (
      <div className="container mx-auto py-8 text-center">
        <h1 className="text-2xl font-bold mb-4">Error</h1>
        <p>Failed to load event details: {eventQuery.error.message}</p>
        <Link href={`/admin/association/${params.id}/events`} className="text-blue-600 hover:underline">
          Return to Events List
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-6">
        <Link href={`/admin/association/${params.id}/events`} className="text-blue-600 hover:underline">
          ← Back to Events List
        </Link>
      </div>
      
      <h1 className="text-2xl font-bold mb-6">Edit Event</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label htmlFor="name" className="block mb-2">Event Name</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
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
                  value={formData.location}
                  onChange={handleChange}
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
                  value={formData.date}
                  onChange={handleChange}
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
                  value={formData.arrivalTime}
                  onChange={handleChange}
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
                value={formData.arrivalRules}
                onChange={handleChange}
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
                value={formData.descriptionMd}
                onChange={handleChange}
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
                value={formData.ticketLink}
                onChange={handleChange}
                className="w-full p-2 border rounded"
              />
            </div>
            
            <div className="mb-4">
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  name="showAttendees"
                  checked={formData.showAttendees}
                  onChange={handleCheckboxChange}
                  className="mr-2"
                />
                <span>Show attendee list to all participants</span>
              </label>
            </div>
            
            <button
              type="submit"
              disabled={updateEventMutation.isLoading}
              className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600 disabled:bg-gray-400"
            >
              {updateEventMutation.isLoading ? "Saving..." : "Save Changes"}
            </button>
          </form>
        </div>
        
        <div>
          <div className="bg-white p-6 rounded shadow-sm mb-6">
            <h2 className="text-xl font-semibold mb-4">RSVP Stats</h2>
            
            {rsvpsQuery.isLoading ? (
              <div>Loading RSVP stats...</div>
            ) : rsvpsQuery.error ? (
              <div className="text-red-500">Error loading RSVPs</div>
            ) : (
              <>
                <div className="mb-2 flex justify-between">
                  <span>Going:</span>
                  <span className="font-semibold">{rsvpsQuery.data?.filter(r => r.status === "YES").length || 0}</span>
                </div>
                <div className="mb-2 flex justify-between">
                  <span>Maybe:</span>
                  <span className="font-semibold">{rsvpsQuery.data?.filter(r => r.status === "MAYBE").length || 0}</span>
                </div>
                <div className="mb-2 flex justify-between">
                  <span>Coming Late:</span>
                  <span className="font-semibold">{rsvpsQuery.data?.filter(r => r.status === "LATE").length || 0}</span>
                </div>
                <div className="mb-2 flex justify-between">
                  <span>Not Going:</span>
                  <span className="font-semibold">{rsvpsQuery.data?.filter(r => r.status === "NO").length || 0}</span>
                </div>
                <div className="mt-4 pt-4 border-t flex justify-between">
                  <span>Total RSVPs:</span>
                  <span className="font-semibold">{rsvpsQuery.data?.length || 0}</span>
                </div>
              </>
            )}
          </div>
          
          <Link 
            href={`/admin/events/${params.eventId}/checkin`}
            className="block w-full bg-green-500 text-white py-2 rounded text-center hover:bg-green-600 mb-4"
          >
            Go to Check-in Page
          </Link>
          
          <Link 
            href={`/events/${params.eventId}`}
            className="block w-full bg-blue-500 text-white py-2 rounded text-center hover:bg-blue-600"
          >
            View Public Event Page
          </Link>
        </div>
      </div>
    </div>
  );
}