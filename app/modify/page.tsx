"use client";
import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import axios from "axios";
import {
  Input,
  Select,
  SelectItem,
  Textarea,
  Button,
  Card,
  CardBody,
  Skeleton,
} from "@nextui-org/react";
import { button as buttonStyles } from "@nextui-org/theme";
import { PressEvent } from "@react-types/shared";
import { API_URLS } from "@/utils/constants";

interface FormData {
  name: string;
  phone: string;
  service: string;
  time: string;
  date: string;
  notes: string;
}

interface Errors {
  name?: string;
  service?: string;
  time?: string;
  date?: string;
  general?: string;
}

function ModifyAppointmentComponent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [formData, setFormData] = useState<FormData>({
    name: "",
    phone: searchParams.get("phone") || "", // Get phone from URL parameter
    service: "",
    time: "",
    date: "",
    notes: "",
  });

  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState<Errors>({});
  const [isLoading, setIsLoading] = useState(true);
  const [chatNo, setChatNo] = useState(true);

  useEffect(() => {
    const token = searchParams.get("token");
    const phoneParam = searchParams.get("phone");

    const fetchAppointmentData = async (phoneToFetch: string) => {
      try {
        setIsLoading(true);

        // Fetch appointment details
        const appointmentResponse = await axios.get(
          `${API_URLS.BACKEND_URL}/appointment/${phoneToFetch}`
        );

        setFormData((prevData) => ({
          ...prevData,
          name: appointmentResponse.data.name || "",
          service: appointmentResponse.data.service || "",
          time: appointmentResponse.data.time || "",
          date: appointmentResponse.data.date || "",
          notes: appointmentResponse.data.notes || "",
        }));
      } catch (error) {
        console.error("Error fetching appointment data:", error);
        setErrors({ general: "Failed to fetch appointment details." });
      } finally {
        setIsLoading(false);
      }
    };

    const fetchDataWithToken = async (token: string) => {
      try {
        setIsLoading(true);

        // Validate token and get phone
        const tokenResponse = await axios.get(
          `${API_URLS.BACKEND_URL}/validate-token?token=${token}`
        );
        const { phone, name, chat } = tokenResponse.data;

        setChatNo(chat);

        setFormData((prevData) => ({
          ...prevData,
          phone,
          name,
        }));

        // Fetch appointment details for the phone from token
        await fetchAppointmentData(phone);
      } catch (error) {
        console.error("Error validating token:", error);
        setErrors({ general: "Invalid or expired token." });
      } finally {
        setIsLoading(false);
      }
    };

    // Prioritize token validation, fallback to phone parameter
    if (token) {
      fetchDataWithToken(token);
    } else if (phoneParam) {
      fetchAppointmentData(phoneParam);
    } else {
      setIsLoading(false);
    }
  }, [searchParams]);

  const validateField = (name: string, value: string) => {
    const newErrors: Errors = { ...errors };
    const currentDate = getTodayDate();
    const currentTime = getCurrentTime();

    if (name === "date") {
      if (!value) {
        newErrors.date = "Date is required.";
      } else if (value < currentDate) {
        newErrors.date = "Selected date cannot be in the past.";
      } else {
        delete newErrors.date;
      }
    }

    if (name === "time") {
      if (!value) {
        newErrors.time = "Time is required.";
      } else if (formData.date === currentDate && value < currentTime) {
        newErrors.time = "Selected time has already passed.";
      } else {
        delete newErrors.time;
      }
    }

    setErrors(newErrors);
  };

  const validateFields = (): boolean => {
    const newErrors: Errors = {};
    const currentDate = getTodayDate();
    const currentTime = getCurrentTime();

    if (!formData.date) {
      newErrors.date = "Date is required.";
    } else if (formData.date < currentDate) {
      newErrors.date = "Selected date cannot be in the past.";
    }

    if (!formData.time) {
      newErrors.time = "Time is required.";
    } else if (formData.date === currentDate && formData.time < currentTime) {
      newErrors.time = "Selected time has already passed.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (
    e: React.ChangeEvent<
      | HTMLInputElement
      | HTMLInputElement
      | HTMLSelectElement
      | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;

    // Update form data
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Validate the specific field
    validateField(name, value);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors = validateFields();
    if (validateFields()) {
      // console.log("Form is valid", formData);
      try {
        // Send updated data to the backend
        await axios.post(`${API_URLS.BACKEND_URL}/modify-appointment`, {
          ...formData,
        });

        // Pass all parameters to the Confirmation page
        router.push(
          `/confirmation?phone=${formData.phone}&message=Your appointment has been updated successfully!&note=${formData.notes}&service=${formData.service}&name=${formData.name}&date=${formData.date}&time=${formData.time}&chatbotNo=${chatNo}`
        );
      } catch (error) {
        console.error("Error updating appointment:", error);
        setMessage("Failed to update the appointment.");
      }
    }
  };

  const handleCancel = async (e: PressEvent) => {
    try {
      await axios.post(`${API_URLS.BACKEND_URL}/cancel-appointment`, {
        phone: formData.phone,
      });

      router.push(
        `/confirmation?message=Your appointment has been cancelled successfully!&chatbotNo=${chatNo}`
      );
    } catch (error) {
      console.error("Error canceling appointment:", error);
      setMessage("Failed to cancel the appointment.");
    }
  };

  const getTodayDate = () => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  };

  const getCurrentTime = () => {
    const now = new Date();
    return now.toTimeString().slice(0, 5);
  };

  const serviceOptions = [
    { value: "Facial Treatment", label: "Facial Treatment" },
    { value: "Massage Therapy", label: "Massage Therapy" },
    { value: "Manicure & Pedicure", label: "Manicure & Pedicure" },
    { value: "Hair Removal", label: "Hair Removal" },
    { value: "Acne Treatment", label: "Acne Treatment" },
    { value: "Body Scrub", label: "Body Scrub" },
    { value: "Hot Stone Massage", label: "Hot Stone Massage" },
    { value: "Nail Art & Design", label: "Nail Art & Design" },
  ];

  // if (isLoading) {
  //   return <div>Loading...</div>;
  // }
  if (isLoading) {
    return (
      <div className="max-w-md mx-auto p-4">
        <Card>
          <CardBody className="space-y-4">
            <Skeleton className="rounded-lg">
              <div className="h-12 rounded-lg bg-default-300"></div>
            </Skeleton>

            <div className="space-y-3">
              <Skeleton className="w-full rounded-lg">
                <div className="h-10 rounded-lg bg-default-200"></div>
              </Skeleton>
              <Skeleton className="w-full rounded-lg">
                <div className="h-10 rounded-lg bg-default-200"></div>
              </Skeleton>
              <Skeleton className="w-full rounded-lg">
                <div className="h-10 rounded-lg bg-default-200"></div>
              </Skeleton>

              <div className="flex gap-4">
                <Skeleton className="w-full rounded-lg">
                  <div className="h-10 rounded-lg bg-default-200"></div>
                </Skeleton>
                <Skeleton className="w-full rounded-lg">
                  <div className="h-10 rounded-lg bg-default-200"></div>
                </Skeleton>
              </div>

              <Skeleton className="w-full rounded-lg">
                <div className="h-20 rounded-lg bg-default-200"></div>
              </Skeleton>

              <div className="flex gap-4">
                <Skeleton className="w-full rounded-lg">
                  <div className="h-12 rounded-lg bg-default-300"></div>
                </Skeleton>
                <Skeleton className="w-full rounded-lg">
                  <div className="h-12 rounded-lg bg-default-300"></div>
                </Skeleton>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto p-4">
      <Card>
        <CardBody>
          <h1 className="text-2xl font-bold mb-4 text-center">
            Modify Your Appointment
          </h1>

          <form onSubmit={handleUpdate} className="space-y-4">
            <Input
              label="Name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              isInvalid={!!errors.name}
              errorMessage={errors.name}
              fullWidth
            />

            <Input
              label="Phone"
              name="phone"
              value={formData.phone}
              readOnly
              fullWidth
            />

            <Select
              label="Select Service"
              name="service"
              selectedKeys={formData.service ? [formData.service] : []}
              onChange={handleChange}
              isInvalid={!!errors.service}
              errorMessage={errors.service}
              fullWidth
            >
              {serviceOptions.map((service) => (
                <SelectItem key={service.value} value={service.value}>
                  {service.label}
                </SelectItem>
              ))}
            </Select>

            <div className="flex gap-4">
              <Input
                type="date"
                label="Date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                min={getTodayDate()}
                isInvalid={!!errors.date}
                color={errors.date ? "danger" : "default"}
                errorMessage={errors.date}
                fullWidth
              />
              <Input
                type="time"
                label="Time"
                name="time"
                value={formData.time}
                onChange={handleChange}
                disabled={!formData.date}
                min={
                  formData.date === getTodayDate()
                    ? getCurrentTime()
                    : undefined
                }
                isInvalid={!!errors.time}
                color={errors.time ? "danger" : "default"}
                errorMessage={errors.time}
                fullWidth
              />
            </div>

            <Textarea
              label="Additional Notes"
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              fullWidth
            />

            <div className="flex gap-4">
              <Button
                color="primary"
                type="submit"
                className={buttonStyles({
                  color: "primary",
                  radius: "full",
                  variant: "shadow",
                })}
                fullWidth
              >
                Update
              </Button>
              <Button
                color="danger"
                variant="bordered"
                onPress={handleCancel}
                className={buttonStyles({
                  color: "danger",
                  radius: "full",
                  variant: "shadow",
                })}
                fullWidth
              >
                Cancel Appointment
              </Button>
            </div>
          </form>

          {message && (
            <div className="mt-4 text-center text-red-500">{message}</div>
          )}
        </CardBody>
      </Card>
    </div>
  );
}

export default function ModifyAppointment() {
  return (
    <Suspense fallback={
      <div className="max-w-md mx-auto p-4">
        <Card>
          <CardBody className="space-y-4">
            <Skeleton className="rounded-lg">
              <div className="h-12 rounded-lg bg-default-300"></div>
            </Skeleton>

            <div className="space-y-3">
              <Skeleton className="w-full rounded-lg">
                <div className="h-10 rounded-lg bg-default-200"></div>
              </Skeleton>
              <Skeleton className="w-full rounded-lg">
                <div className="h-10 rounded-lg bg-default-200"></div>
              </Skeleton>
              <Skeleton className="w-full rounded-lg">
                <div className="h-10 rounded-lg bg-default-200"></div>
              </Skeleton>

              <div className="flex gap-4">
                <Skeleton className="w-full rounded-lg">
                  <div className="h-10 rounded-lg bg-default-200"></div>
                </Skeleton>
                <Skeleton className="w-full rounded-lg">
                  <div className="h-10 rounded-lg bg-default-200"></div>
                </Skeleton>
              </div>

              <Skeleton className="w-full rounded-lg">
                <div className="h-20 rounded-lg bg-default-200"></div>
              </Skeleton>

              <div className="flex gap-4">
                <Skeleton className="w-full rounded-lg">
                  <div className="h-12 rounded-lg bg-default-300"></div>
                </Skeleton>
                <Skeleton className="w-full rounded-lg">
                  <div className="h-12 rounded-lg bg-default-300"></div>
                </Skeleton>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>
    }>
      <ModifyAppointmentComponent />
    </Suspense>
  );
}
