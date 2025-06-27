"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "~/trpc/react";

export default function EventCheckin({ params }: { params: { id: string } }) {
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  
  // This would be a query to fetch event details
  const eventQuery = api.event.getById.useQuery({ id: params.id });
  
  // This would be a query to fetch the user's check-in QR code
  const checkinQuery = api.event.getCheckinQrCode.useQuery(
    { eventId: params.id },
    {
      onSuccess: (data) => {
        if (data.qrCodeUrl) {
          setQrCodeUrl(data.qrCodeUrl);
        }
      }
    }
  );

  // Check if user has RSVP'd "YES" to this event
  const rsvpQuery = api.event.getUserRSVP.useQuery({ eventId: params.id });
  const hasRsvpd = rsvpQuery.data?.status === "YES";

  return (
    <div className="container mx-auto py-8">
      <div className="mb-6">
        <Link href={`/events/${params.id}`} className="text-blue-600 hover:underline">
          ← Back to Event Details
        </Link>
      </div>
      
      <h1 className="text-2xl font-bold mb-6">Event Check-in</h1>
      
      {eventQuery.isLoading || checkinQuery.isLoading ? (
        <div className="text-center">Loading check-in details...</div>
      ) : eventQuery.error ? (
        <div className="text-center text-red-500">
          Error loading event: {eventQuery.error.message}
        </div>
      ) : checkinQuery.error ? (
        <div className="text-center text-red-500">
          Error loading check-in code: {checkinQuery.error.message}
        </div>
      ) : !hasRsvpd ? (
        <div className="text-center">
          <p className="mb-4">You need to RSVP "Going" to this event to get a check-in code.</p>
          <Link 
            href={`/events/${params.id}`}
            className="inline-block bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            RSVP to Event
          </Link>
        </div>
      ) : qrCodeUrl ? (
        <div className="max-w-md mx-auto text-center">
          <div className="bg-white p-6 rounded shadow-sm mb-6">
            <h2 className="text-xl font-semibold mb-4">{eventQuery.data?.name}</h2>
            <p className="mb-6">{new Date(eventQuery.data?.date ?? "").toLocaleDateString()}</p>
            
            <div className="mb-6">
              <img 
                src={qrCodeUrl} 
                alt="Check-in QR Code" 
                className="mx-auto"
                style={{ width: "250px", height: "250px" }}
              />
            </div>
            
            <p className="text-sm text-gray-600">
              Present this QR code to the event organizer for check-in.
            </p>
          </div>
          
          <div className="text-left bg-blue-50 p-4 rounded">
            <h3 className="font-semibold mb-2">Important Notes</h3>
            <ul className="list-disc list-inside text-sm">
              <li>Your QR code is unique to you and this event.</li>
              <li>Screenshots of QR codes will not be accepted.</li>
              <li>If you have any issues with check-in, please contact the event organizer.</li>
            </ul>
          </div>
        </div>
      ) : (
        <div className="text-center">
          <p>There was an issue generating your check-in code. Please try again later.</p>
        </div>
      )}
    </div>
  );
}