"use client";
import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Button, Card, CardBody, Spinner } from "@nextui-org/react";
import { CheckCircleIcon } from "lucide-react";

import {
  PhoneOutlined as PhoneIcon,
  CalendarOutlined as CalendarIcon,
  ClockCircleOutlined as ClockIcon,
  TagOutlined as TagIcon,
  UserOutlined as ProfileIcon,
} from "@ant-design/icons";

import { button as buttonStyles } from "@nextui-org/theme";

interface AppointmentDetails {
  name?: string;
  service?: string;
  date?: string;
  time?: string;
  notes?: string;
}

function ConfirmationComponent() {
  const searchParams = useSearchParams();
  const [appointmentDetails, setAppointmentDetails] =
    useState<AppointmentDetails | null>(null);
  const [isCanceled, setIsCanceled] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Extract parameters from the URL
  const message = searchParams.get("message") || undefined;
  const phone = searchParams.get("phone") || undefined;
  const note = searchParams.get("note") || undefined;
  const name = searchParams.get("name") || undefined;
  const service = searchParams.get("service") || undefined;
  const date = searchParams.get("date") || undefined;
  const time = searchParams.get("time") || undefined;
  const chatNo = searchParams.get("chatbotNo") || undefined;

  useEffect(() => {
    setIsLoading(true);
    // Check if the appointment is canceled
    const canceled = !name && !service && !date && !time; // No detailed info indicates cancellation
    setIsCanceled(canceled);

    if (!canceled) {
      setAppointmentDetails({
        name,
        service,
        date,
        time,
        notes: note,
      });
    }

    setIsLoading(false);
  }, [name, service, date, time, note]);

  const convertTo12HourFormat = (time: string) => {
    const [hours, minutes] = time.split(":");
    const period = +hours >= 12 ? "PM" : "AM";
    const adjustedHours = +hours % 12 || 12; // Convert 0 to 12 for midnight
    return `${adjustedHours}:${minutes} ${period}`;
  };

  // New function to handle closing and redirecting to WhatsApp
  const handleCloseApp = () => {
    if (chatNo) {
      window.location.href = `https://wa.me/${chatNo}`; // This will open WhatsApp
    }
  };

  return (
    <Card className="m-4 max-w-md bg-default-50 shadow-sm">
      <CardBody>
        <div className="space-y-4">
          {/* Confirmation Header */}
          <div className="flex items-center space-x-3 flex-col ">
            <CheckCircleIcon className="text-success-500 mb-2" size={32} />
            <h2 className="text-lg font-semibold text-default-700 text-center">
              {message}
            </h2>
          </div>

          {/* Content Based on Update or Cancellation */}
          {isLoading ? (
            <div className="flex justify-center py-4">
              <Spinner size="sm" color="primary" />
            </div>
          ) : isCanceled ? (
            <div>
              <div className="text-center text-default-600">
                {note && <p>{note}</p>}
              </div>
              <Button
                onClick={handleCloseApp}
                className={`${buttonStyles({
                  color: "success",
                  radius: "full",
                  variant: "shadow",
                })} text-white`}
                fullWidth
              >
                Close
              </Button>
            </div>
          ) : error ? (
            <div className="text-danger text-center py-2">{error}</div>
          ) : (
            appointmentDetails && (
              <div className="space-y-2">
                {/* Contact and Booking Details */}
                {/* <div>
                  <PhoneIcon
                    size={16}
                    className="text-default-500 pr-2 inline-block"
                  />
                  <span className="text-default-600">{phone}</span>
                </div> */}
                <div className="">
                  <ProfileIcon
                    size={16}
                    className="text-default-500 pr-2 "
                  />
                  <span className="text-default-600">
                    {appointmentDetails.name}
                  </span>
                </div>

                <div className="grid grid-rows-2 gap-2 bg-default-100 rounded-lg p-3">
                  {/* Row 1: Date and Time */}
                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex flex-col items-center">
                      <CalendarIcon size={20} className="text-primary mb-1" />
                      <span className="text-small text-default-600">
                        {appointmentDetails.date}
                      </span>
                    </div>
                    <div className="flex flex-col items-center">
                      <ClockIcon size={20} className="text-primary mb-1" />
                      <span className="text-small text-default-600">
                        {appointmentDetails.time
                          ? convertTo12HourFormat(appointmentDetails.time)
                          : "N/A"}
                      </span>
                    </div>
                  </div>

                  {/* Row 2: Service */}
                  <div className="flex flex-col items-center">
                    <TagIcon size={20} className="text-primary mb-1" />
                    <span className="text-small text-default-600 text-center">
                      {appointmentDetails.service}
                    </span>
                  </div>
                </div>

                {/* Additional Notes */}
                {appointmentDetails.notes && (
                  <div className="bg-default-100 rounded-lg p-2">
                    <p className="text-small text-default-500">
                      <span className="font-medium">Notes:</span>{" "}
                      {appointmentDetails.notes}
                    </p>
                  </div>
                )}
                <Button
                  onClick={handleCloseApp}
                  className={`${buttonStyles({
                    color: "success",
                    radius: "full",
                    variant: "shadow",
                  })} text-white`}
                  fullWidth
                >
                  Close
                </Button>
              </div>
            )
          )}
        </div>
      </CardBody>
    </Card>
  );
}

export default function Confirmation() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center items-center h-screen">
          <Spinner size="lg" color="primary" />
        </div>
      }
    >
      <ConfirmationComponent />
    </Suspense>
  );
}
