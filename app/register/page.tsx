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
  SelectSection,
} from "@nextui-org/react";
import { button as buttonStyles } from "@nextui-org/theme";
import { SERVICE_CATEGORIES } from "@/utils/serviceConstants"; // Import the new constants
import { API_URLS, DEFAULT_VALUES } from "@/utils/constants";

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
  phone?: string;
  service?: string;
  time?: string;
  date?: string;
  submit?: string;
  token?: string;
  general?: string;
}

function RegisterComponent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const phoneParam = searchParams.get("phone");

  const [chatNo, setChatNo] = useState<boolean | undefined>();
  const [isLoading, setIsLoading] = useState(true);

  const [formData, setFormData] = useState<FormData>({
    name: "",
    phone: phoneParam || "",
    service: "",
    time: "",
    date: "",
    notes: "",
  });

  const [errors, setErrors] = useState<Errors>({});

  useEffect(() => {
    // Validate token and prefill form data
    const fetchTokenData = async () => {
      try {
        setIsLoading(true);

        if (token) {
          // Send token to backend for validation
          const response = await axios.get(
            `${API_URLS.BACKEND_URL}/validate-token?token=${token}`
          );
          const { phone, name, chat } = response.data;
          setChatNo(chat);

          // Prefill form data with phone and name
          setFormData((prevData) => ({
            ...prevData,
            phone: phone,
            name: name,
          }));
        }
      } catch (error) {
        console.error("Error validating token:", error);
        setErrors({ token: "Invalid or expired token" });
        router.push("/tokenexp");
      } finally {
        setIsLoading(false);
      }
    };

    fetchTokenData();
  }, [token]);

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

  // const handleChange = (
  //   e: React.ChangeEvent<
  //     HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
  //   >
  // ) => {
  //   const { name, value } = e.target;
  //   setFormData({ ...formData, [name]: value });
  //   validateField(name, value);
  // };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    console.log("reached");
    if (validateFields()) {
      console.log("Fields validated");
      try {
        await axios.post(`${API_URLS.BACKEND_URL}/submit-booking`, {
          ...formData,
          token, // Include the token here
        });

        router.push(
          `/confirmation?phone=${formData.phone}&message=Your appointment has been registered successfully!&note=${formData.notes}&service=${formData.service}&name=${formData.name}&date=${formData.date}&time=${formData.time}&chatbotNo=${chatNo}`
        );
      } catch (error) {
        console.error("Error during submission:", error);
        setErrors({
          submit: "Failed to register the appointment.",
          general: "An unexpected error occurred. Please try again later.",
        });
      }
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

  const renderServiceOptions = () => {
    return Object.entries(SERVICE_CATEGORIES).map(([category, services]) => (
      <SelectSection key={category} title={category}>
        {services.map((service) => (
          <SelectItem key={service.value} value={service.value}>
            {service.label}
          </SelectItem>
        ))}
      </SelectSection>
    ));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
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

              <Skeleton className="w-full rounded-lg">
                <div className="h-12 rounded-lg bg-default-300"></div>
              </Skeleton>
            </div>
          </CardBody>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardBody>
          <h1 className="text-2xl font-bold mb-4 text-center">
            Register for a Spa Appointment
          </h1>

          <form onSubmit={handleSubmit} className="space-y-4">
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
              onChange={handleChange}
              type="hidden"
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
              {renderServiceOptions()}
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
              Register
            </Button>

            {(errors.submit || errors.token || errors.general) && (
              <div className="text-red-500 text-center mt-2">
                {errors.submit || errors.token || errors.general}
              </div>
            )}
          </form>
        </CardBody>
      </Card>
    </div>
  );
}

export default function Register() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center p-4">
          <Card className="w-full max-w-md">
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

                <Skeleton className="w-full rounded-lg">
                  <div className="h-12 rounded-lg bg-default-300"></div>
                </Skeleton>
              </div>
            </CardBody>
          </Card>
        </div>
      }
    >
      <RegisterComponent />
    </Suspense>
  );
}
