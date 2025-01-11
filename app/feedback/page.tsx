"use client";
import React, { useState } from 'react';
import { Card, CardBody, Button, Textarea } from "@nextui-org/react";
import { Star, Send, SmilePlus } from "lucide-react";
import { button as buttonStyles } from "@nextui-org/theme";
import { useSearchParams } from "next/navigation";
import { API_URLS, CHATBOT_NUMBER } from "@/utils/constants";


const FeedbackPage = () => {
  const searchParams = useSearchParams();
  const [rating, setRating] = useState<number | null>(null);
  const [feedback, setFeedback] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

//   const chatNo = searchParams.get("chatbotNo") || undefined;
const appointmentId = searchParams.get("appointmentId") || undefined;

  const submitFeedback = async () => {
    if (!rating || !appointmentId) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch(`${API_URLS.BACKEND_URL}/feedback`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          rating,
          feedback,
          appointmentId
        }),
      });

      if (response.ok) {
        setIsSubmitted(true);
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to submit feedback.');
      }
    } catch (error) {
      console.error("Error submitting feedback:", error);
      setError('An error occurred while submitting feedback.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCloseApp = () => {
    if (CHATBOT_NUMBER) {
      window.location.href = `https://wa.me/${CHATBOT_NUMBER}`;
    }
  };

  if (!appointmentId) {
    return (
      <Card className="m-4 max-w-md bg-default-50 shadow-sm mx-auto">
        <CardBody>
          <div className="text-center text-danger">
            Invalid appointment. Please try again with a valid appointment.
          </div>
        </CardBody>
      </Card>
    );
  }

  if (isSubmitted) {
    return (
      <Card className="m-4 max-w-md bg-default-50 shadow-sm ">
        <CardBody>
          <div className="flex flex-col items-center space-y-4 py-8">
            <SmilePlus className="text-success-500" size={48} />
            <h2 className="text-xl font-semibold text-default-700">Thank You!</h2>
            <p className="text-center text-default-600">
              We appreciate your valuable feedback. It helps us improve our services.
            </p>
            <Button
              onPress={handleCloseApp}
              className={`${buttonStyles({
                color: "success",
                radius: "full",
                variant: "shadow",
              })} text-white mt-4`}
              fullWidth
            >
              Close
            </Button>
          </div>
        </CardBody>
      </Card>
    );
  }

  return (
    <Card className="m-4 max-w-md bg-default-50 shadow-sm">
      <CardBody>
        <div className="space-y-6">
          {/* Header */}
          <div className="text-center space-y-2">
            <h2 className="text-xl font-semibold text-default-700">Share Your Experience</h2>
            <p className="text-default-500">We'd love to hear your thoughts!</p>
          </div>

          {/* Star Rating */}
          <div className="flex justify-center space-x-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <Button
                key={star}
                onPress={() => setRating(star)}
                className="focus:outline-none transition-transform hover:scale-110 min-w-0 p-0 bg-transparent"
              >
                <Star
                  size={32}
                  className={`${
                    rating && star <= rating
                      ? "fill-warning-400 text-warning-400"
                      : "text-default-300"
                  } transition-colors`}
                />
              </Button>
            ))}
          </div>

          {/* Feedback Box */}
          <Textarea
            label="Additional Feedback"
            placeholder="Tell us more about your experience..."
            value={feedback}
            onValueChange={setFeedback}
            minRows={3}
            classNames={{
              label: "text-default-700 font-medium"
            }}
          />

          {/* Error Message */}
          {error && (
            <p className="text-danger text-center text-sm">{error}</p>
          )}

          {/* Submit Button */}
          <Button
            onPress={submitFeedback}
            className={`${buttonStyles({
              color: "primary",
              radius: "full",
              variant: "shadow",
            })} text-white`}
            fullWidth
            startContent={<Send size={18} />}
            isDisabled={!rating || isSubmitting}
            isLoading={isSubmitting}
          >
            Submit Feedback
          </Button>
        </div>
      </CardBody>
    </Card>
  );
};

export default FeedbackPage;