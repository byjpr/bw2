"use client";

import { useState } from "react";
import { api } from "~/trpc/react";

type FeedbackType = "suggestion" | "issue" | "praise" | "other";

export default function Feedback() {
  const [feedbackType, setFeedbackType] = useState<FeedbackType>("suggestion");
  const [feedbackText, setFeedbackText] = useState("");
  const [submitted, setSubmitted] = useState(false);
  
  // This would be a mutation to submit feedback
  const submitFeedbackMutation = {
    mutate: (data: { type: FeedbackType; content: string }) => {
      console.log("Submitting feedback:", data);
      setSubmitted(true);
    },
    isLoading: false,
    isError: false,
    error: null,
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (feedbackText.trim()) {
      submitFeedbackMutation.mutate({
        type: feedbackType,
        content: feedbackText,
      });
    }
  };

  const handleReset = () => {
    setFeedbackType("suggestion");
    setFeedbackText("");
    setSubmitted(false);
  };

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Feedback & Support</h1>
      
      {submitted ? (
        <div className="bg-white p-6 rounded shadow-sm text-center">
          <h2 className="text-xl font-semibold mb-4 text-green-600">Thank You!</h2>
          <p className="mb-6">
            Your feedback has been submitted. We appreciate you taking the time to help us improve.
          </p>
          <button
            onClick={handleReset}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Submit Another
          </button>
        </div>
      ) : (
        <div className="bg-white p-6 rounded shadow-sm">
          <p className="mb-6">
            We value your feedback! Please let us know about your experience, report any issues,
            or suggest improvements to help us make the platform better.
          </p>
          
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label htmlFor="feedbackType" className="block mb-2">Feedback Type</label>
              <select
                id="feedbackType"
                value={feedbackType}
                onChange={(e) => setFeedbackType(e.target.value as FeedbackType)}
                className="w-full p-2 border rounded"
              >
                <option value="suggestion">Suggestion</option>
                <option value="issue">Issue Report</option>
                <option value="praise">Praise</option>
                <option value="other">Other</option>
              </select>
            </div>
            
            <div className="mb-4">
              <label htmlFor="feedbackText" className="block mb-2">Your Feedback</label>
              <textarea
                id="feedbackText"
                value={feedbackText}
                onChange={(e) => setFeedbackText(e.target.value)}
                className="w-full p-2 border rounded"
                rows={6}
                placeholder="Please provide as much detail as possible..."
                required
              />
            </div>
            
            <button
              type="submit"
              disabled={submitFeedbackMutation.isLoading || !feedbackText.trim()}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-gray-400"
            >
              {submitFeedbackMutation.isLoading ? "Submitting..." : "Submit Feedback"}
            </button>
            
            {submitFeedbackMutation.isError && (
              <p className="text-red-600 mt-2">
                Error submitting feedback: {submitFeedbackMutation.error?.toString()}
              </p>
            )}
          </form>
          
          <div className="mt-8 border-t pt-6">
            <h3 className="font-semibold mb-2">Report Abuse or Urgent Issues</h3>
            <p className="text-sm text-gray-600">
              For urgent issues or to report inappropriate behavior, please contact your
              association admin directly or email support@example.com.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}