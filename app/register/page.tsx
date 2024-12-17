"use client";
import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import axios from "axios";
import {
  Input,
  Select,
  SelectItem,
  Textarea,
  Button,
  Image,
  Card,
  CardBody,
} from "@nextui-org/react";
import { button as buttonStyles } from "@nextui-org/theme";

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
}

export default function Register() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const phoneParam = searchParams.get("phone");

  const [chatNo, setChatNo] = useState<boolean | undefined>();

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
    if (token) {
      const fetchTokenData = async () => {
        try {
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
        } catch (error) {
          console.error("Error validating token:", error);
          setErrors({ token: "Invalid or expired token" });
        }
      };

      fetchTokenData();
    }
  }, [token]);

  const validateFields = (): Errors => {
    const newErrors: Errors = {};
    if (!formData.name) newErrors.name = "Name is required.";
    if (!formData.phone) newErrors.phone = "Phone number is required.";
    if (!formData.service) newErrors.service = "Please select a service.";
    if (!formData.time) newErrors.time = "Time is required.";
    if (!formData.date) newErrors.date = "Date is required.";
    return newErrors;
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setErrors({ ...errors, [name]: "" });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors = validateFields();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      await axios.post(`${API_URLS.BACKEND_URL}/submit-booking`, formData);

      router.push(
        `/confirmation?phone=${formData.phone}&message=Your appointment has been updated successfully!&note=${formData.notes}&service=${formData.service}&name=${formData.name}&date=${formData.date}&time=${formData.time}&chatbotNo=${chatNo}`
      );
    } catch (error) {
      console.error("Error during submission:", error);
      setErrors({ submit: "Failed to register the appointment." });
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

  return (
    <div className=" flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardBody>
          {/* <Image
            src={DEFAULT_VALUES.IMAGE_URL}
            alt="Spa"
            className="mb-4 w-full object-cover rounded-lg"
          /> */}

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

            {errors.submit && (
              <div className="text-red-500 text-center mt-2">
                {errors.submit}
              </div>
            )}
            {errors.token && (
              <div className="text-red-500 text-center mt-2">
                {errors.token}
              </div>
            )}
          </form>
        </CardBody>
      </Card>
    </div>
  );
}
