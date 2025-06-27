"use client";

import { useState } from "react";
import Link from "next/link";
import { api } from "~/trpc/react";

export default function EventDetails({ params }: { params: { id: string } }) {
  const [rsvpStatus, setRsvpStatus] = useState<string | null>(null);
  const [comment, setComment] = useState("");
  const [guestsCount, setGuestsCount] = useState(0);
  
  // This would be a query to fetch event details
  const eventQuery = api.event.getById.useQuery({ id: params.id });
  
  // This would be a query to fetch the user's RSVP status
  const rsvpQuery = api.event.getUserRSVP.useQuery(
    { eventId: params.id },
    { 
      onSuccess: (data) => {
        if (data) {
          setRsvpStatus(data.status);
          setComment(data.comment ?? "");
          setGuestsCount(data.guestsCount);
        }
      }
    }
  );
  
  // This would be a query to fetch attendees if the event has public attendees
  const attendeesQuery = api.event.getAttendees.useQuery(
    { eventId: params.id },
    { enabled: eventQuery.data?.showAttendees ?? false }
  );
  
  // This would be a mutation to update RSVP
  const updateRsvpMutation = api.event.updateRSVP.useMutation({
    onSuccess: () => {
      void rsvpQuery.refetch();
    },
  });

  const handleUpdateRSVP = (status: string) => {
    setRsvpStatus(status);
    updateRsvpMutation.mutate({
      eventId: params.id,
      status,
      comment,
      guestsCount,
    });
  };

  const handleSubmitComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (rsvpStatus) {
      updateRsvpMutation.mutate({
        eventId: params.id,
        status: rsvpStatus,
        comment,
        guestsCount,
      });
    }
  };

  const formatDate = (date: string | Date) => {
    const options: Intl.DateTimeFormatOptions = { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    };
    return new Date(date).toLocaleDateString(undefined, options);
  };

  const formatTime = (time: string | Date) => {
    return new Date(time).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <div className="container mx-auto py-8">
      {eventQuery.isLoading ? (
        <div className="text-center">Loading event details...</div>
      ) : eventQuery.error ? (
        <div className="text-center text-red-500">
          Error loading event: {eventQuery.error.message}
        </div>
      ) : eventQuery.data ? (
        <>
          <div className="mb-6">
            <Link href="/events" className="text-blue-600 hover:underline">
              ← Back to Events
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2">
              <h1 className="text-2xl font-bold mb-4">{eventQuery.data.name}</h1>
              
              <div className="bg-white p-6 rounded shadow-sm mb-6">
                <div className="mb-4">
                  <div className="text-gray-600 mb-1">
                    <span className="font-semibold">Date:</span> {formatDate(eventQuery.data.date)}
                  </div>
                  <div className="text-gray-600 mb-1">
                    <span className="font-semibold">Time:</span> {formatTime(eventQuery.data.arrivalTime)}
                  </div>
                  <div className="text-gray-600">
                    <span className="font-semibold">Location:</span> {eventQuery.data.location}
                  </div>
                </div>
                
                <div className="mb-4">
                  <h3 className="font-semibold mb-2">Arrival Rules</h3>
                  <p className="text-gray-600">
                    {eventQuery.data.arrivalRules === "ON_TIME" ? "Please arrive on time." :
                     eventQuery.data.arrivalRules === "BRITISH_SOCIAL" ? "British Social Time (arriving up to 15 minutes late is acceptable)." :
                     eventQuery.data.arrivalRules === "BRITISH_BUSINESS" ? "British Business Time (arriving 5 minutes early is expected)." :
                     eventQuery.data.arrivalRules === "GERMAN" ? "German Time (arriving 10 minutes early is expected)." :
                     "Please arrive on time."}
                  </p>
                </div>
                
                {eventQuery.data.descriptionMd && (
                  <div className="mb-4">
                    <h3 className="font-semibold mb-2">Details</h3>
                    <div className="prose max-w-none">
                      {/* Would use a markdown renderer in a real implementation */}
                      <p className="whitespace-pre-wrap">{eventQuery.data.descriptionMd}</p>
                    </div>
                  </div>
                )}
                
                {eventQuery.data.ticketLink && (
                  <div className="mb-4">
                    <h3 className="font-semibold mb-2">Tickets</h3>
                    <a 
                      href={eventQuery.data.ticketLink} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      Get tickets here
                    </a>
                  </div>
                )}
              </div>
              
              {eventQuery.data.showAttendees && (
                <div className="bg-white p-6 rounded shadow-sm">
                  <h2 className="text-xl font-semibold mb-4">Attendees</h2>
                  
                  {attendeesQuery.isLoading ? (
                    <div>Loading attendees...</div>
                  ) : attendeesQuery.error ? (
                    <div className="text-red-500">Error loading attendees</div>
                  ) : attendeesQuery.data?.length === 0 ? (
                    <div>No one has RSVP'd yet</div>
                  ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {attendeesQuery.data?.map((attendee) => (
                        <div key={attendee.id} className="flex items-center">
                          {attendee.image ? (
                            <img 
                              src={attendee.image} 
                              alt={attendee.name ?? "Attendee"} 
                              className="w-8 h-8 rounded-full mr-2"
                            />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-gray-200 mr-2" />
                          )}
                          <span>{attendee.name}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
            
            <div>
              <div className="bg-white p-6 rounded shadow-sm mb-6">
                <h2 className="text-xl font-semibold mb-4">Your RSVP</h2>
                
                <div className="flex flex-col space-y-2 mb-4">
                  <button
                    onClick={() => handleUpdateRSVP("YES")}
                    className={`px-4 py-2 rounded ${
                      rsvpStatus === "YES" ? "bg-green-500 text-white" : "bg-gray-100 hover:bg-gray-200"
                    }`}
                  >
                    Going
                  </button>
                  <button
                    onClick={() => handleUpdateRSVP("MAYBE")}
                    className={`px-4 py-2 rounded ${
                      rsvpStatus === "MAYBE" ? "bg-yellow-500 text-white" : "bg-gray-100 hover:bg-gray-200"
                    }`}
                  >
                    Maybe
                  </button>
                  <button
                    onClick={() => handleUpdateRSVP("LATE")}
                    className={`px-4 py-2 rounded ${
                      rsvpStatus === "LATE" ? "bg-purple-500 text-white" : "bg-gray-100 hover:bg-gray-200"
                    }`}
                  >
                    Coming Late
                  </button>
                  <button
                    onClick={() => handleUpdateRSVP("NO")}
                    className={`px-4 py-2 rounded ${
                      rsvpStatus === "NO" ? "bg-red-500 text-white" : "bg-gray-100 hover:bg-gray-200"
                    }`}
                  >
                    Not Going
                  </button>
                </div>
                
                {rsvpStatus && rsvpStatus !== "NO" && (
                  <form onSubmit={handleSubmitComment}>
                    <div className="mb-4">
                      <label htmlFor="guestsCount" className="block mb-2">
                        Bringing guests?
                      </label>
                      <select
                        id="guestsCount"
                        value={guestsCount}
                        onChange={(e) => setGuestsCount(Number(e.target.value))}
                        className="w-full p-2 border rounded"
                      >
                        {[0, 1, 2, 3, 4, 5].map((num) => (
                          <option key={num} value={num}>
                            {num} {num === 1 ? "guest" : "guests"}
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    <div className="mb-4">
                      <label htmlFor="comment" className="block mb-2">
                        Add a comment (optional)
                      </label>
                      <textarea
                        id="comment"
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        className="w-full p-2 border rounded"
                        rows={3}
                      />
                    </div>
                    
                    <button
                      type="submit"
                      disabled={updateRsvpMutation.isLoading}
                      className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600 disabled:bg-gray-400"
                    >
                      {updateRsvpMutation.isLoading ? "Updating..." : "Update Details"}
                    </button>
                  </form>
                )}
              </div>
              
              {rsvpStatus === "YES" && (
                <div className="bg-white p-6 rounded shadow-sm">
                  <h2 className="text-xl font-semibold mb-4">Check-in</h2>
                  <p className="mb-4">Use this QR code to check in at the event.</p>
                  
                  <Link 
                    href={`/events/${params.id}/checkin`}
                    className="block w-full bg-blue-500 text-white py-2 rounded text-center hover:bg-blue-600"
                  >
                    View Check-in QR
                  </Link>
                </div>
              )}
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}