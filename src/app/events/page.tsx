"use client";

import { useState } from "react";
import Link from "next/link";
import { api } from "~/trpc/react";

type FilterType = "upcoming" | "past" | "all";

export default function Events() {
  const [filter, setFilter] = useState<FilterType>("upcoming");
  
  // This would be a query to fetch the user's current association
  const associationQuery = api.association.getUserAssociation.useQuery();
  
  // This would be a query to fetch events for the association with filtering
  const eventsQuery = api.event.getAssociationEvents.useQuery(
    { 
      associationId: associationQuery.data?.id ?? "",
      filter 
    },
    { 
      enabled: !!associationQuery.data?.id 
    }
  );

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Events</h1>
      
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
          <div className="mb-6">
            <div className="flex border-b">
              <button
                onClick={() => setFilter("upcoming")}
                className={`px-4 py-2 ${filter === "upcoming" ? "border-b-2 border-blue-500 font-semibold" : ""}`}
              >
                Upcoming
              </button>
              <button
                onClick={() => setFilter("past")}
                className={`px-4 py-2 ${filter === "past" ? "border-b-2 border-blue-500 font-semibold" : ""}`}
              >
                Past
              </button>
              <button
                onClick={() => setFilter("all")}
                className={`px-4 py-2 ${filter === "all" ? "border-b-2 border-blue-500 font-semibold" : ""}`}
              >
                All
              </button>
            </div>
          </div>
          
          {eventsQuery.isLoading ? (
            <div className="text-center py-4">Loading events...</div>
          ) : eventsQuery.error ? (
            <div className="text-center text-red-500 py-4">
              Error loading events: {eventsQuery.error.message}
            </div>
          ) : eventsQuery.data?.length === 0 ? (
            <div className="text-center py-4">
              {filter === "upcoming" ? "No upcoming events" : 
               filter === "past" ? "No past events" : "No events found"}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {eventsQuery.data?.map((event) => {
                // Get RSVP status if available (would be included in the API response)
                const rsvpStatus = event.rsvp?.status || null;
                
                return (
                  <Link key={event.id} href={`/events/${event.id}`}>
                    <div className="border rounded p-4 hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold text-lg mb-1">{event.name}</h3>
                          <p className="text-gray-600 mb-1">
                            {new Date(event.date).toLocaleDateString()} at {
                              // Format time from event.arrivalTime
                              new Date(event.arrivalTime).toLocaleTimeString([], { 
                                hour: '2-digit', 
                                minute: '2-digit' 
                              })
                            }
                          </p>
                          <p className="text-gray-600 mb-2">{event.location}</p>
                          
                          {/* Show arrival rules */}
                          <div className="text-sm text-gray-500">
                            Arrival: {
                              event.arrivalRules === "ON_TIME" ? "Please arrive on time" :
                              event.arrivalRules === "BRITISH_SOCIAL" ? "British Social Time (15min late)" :
                              event.arrivalRules === "BRITISH_BUSINESS" ? "British Business Time (5min early)" :
                              event.arrivalRules === "GERMAN" ? "German Time (10min early)" :
                              "Please arrive on time"
                            }
                          </div>
                        </div>
                        
                        {/* RSVP Status Badge */}
                        {rsvpStatus && (
                          <div className={`px-3 py-1 rounded-full text-sm ${
                            rsvpStatus === "YES" ? "bg-green-100 text-green-800" :
                            rsvpStatus === "NO" ? "bg-red-100 text-red-800" :
                            rsvpStatus === "MAYBE" ? "bg-yellow-100 text-yellow-800" :
                            rsvpStatus === "LATE" ? "bg-purple-100 text-purple-800" :
                            "bg-gray-100 text-gray-800"
                          }`}>
                            {rsvpStatus}
                          </div>
                        )}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
}