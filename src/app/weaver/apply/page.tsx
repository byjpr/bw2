"use client";

import { useState } from "react";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { api } from "~/trpc/react";

// Form validation schema
const weaverApplicationSchema = z.object({
  location: z.string().min(1, "Location is required"),
  twitterHandle: z.string().optional(),
  discordUsername: z.string().optional(),
  answers: z.record(z.string()).optional(),
});

type WeaverApplicationForm = z.infer<typeof weaverApplicationSchema>;

export default function WeaverApplication() {
  const router = useRouter();
  const [formData, setFormData] = useState<WeaverApplicationForm>({
    location: "",
    twitterHandle: "",
    discordUsername: "",
    answers: {},
  });
  
  // This would be a query to fetch personality questions
  const questionsQuery = api.weaver.getApplicationQuestions.useQuery();
  
  // This would be a mutation to submit the application
  const applyMutation = api.weaver.applyToBeWeaver.useMutation({
    onSuccess: () => {
      // Redirect to status page after successful application
      router.push("/weaver/status");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    applyMutation.mutate(formData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    if (name.startsWith("question_")) {
      // Handle question answers
      const questionId = name.replace("question_", "");
      setFormData((prev) => ({
        ...prev,
        answers: { ...(prev.answers ?? {}), [questionId]: value },
      }));
    } else {
      // Handle regular form fields
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleGetLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setFormData((prev) => ({ ...prev, location: `${latitude},${longitude}` }));
        },
        (error) => {
          console.error("Error getting location:", error);
        }
      );
    }
  };

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Apply to become a Weaver</h1>
      
      <form onSubmit={handleSubmit} className="max-w-md mx-auto">
        <div className="mb-4">
          <label htmlFor="location" className="block mb-2">Location</label>
          <div className="flex gap-2">
            <input
              type="text"
              id="location"
              name="location"
              value={formData.location}
              onChange={handleChange}
              required
              className="flex-1 p-2 border rounded"
              placeholder="Enter postcode or use geolocation"
            />
            <button
              type="button"
              onClick={handleGetLocation}
              className="bg-gray-200 px-3 py-2 rounded"
            >
              📍
            </button>
          </div>
        </div>
        
        <div className="mb-4">
          <label htmlFor="twitterHandle" className="block mb-2">Twitter Handle (Optional)</label>
          <input
            type="text"
            id="twitterHandle"
            name="twitterHandle"
            value={formData.twitterHandle}
            onChange={handleChange}
            className="w-full p-2 border rounded"
          />
        </div>
        
        <div className="mb-4">
          <label htmlFor="discordUsername" className="block mb-2">Discord Username (Optional)</label>
          <input
            type="text"
            id="discordUsername"
            name="discordUsername"
            value={formData.discordUsername}
            onChange={handleChange}
            className="w-full p-2 border rounded"
          />
        </div>
        
        {questionsQuery.data?.map((question) => (
          <div key={question.id} className="mb-4">
            <label htmlFor={`question_${question.id}`} className="block mb-2">{question.text}</label>
            <textarea
              id={`question_${question.id}`}
              name={`question_${question.id}`}
              value={formData.answers?.[question.id] ?? ""}
              onChange={handleChange}
              className="w-full p-2 border rounded"
              rows={3}
            />
          </div>
        ))}
        
        <button
          type="submit"
          disabled={applyMutation.isLoading}
          className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600 disabled:bg-gray-400"
        >
          {applyMutation.isLoading ? "Submitting..." : "Submit Application"}
        </button>
      </form>
    </div>
  );
}