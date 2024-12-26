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
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@nextui-org/react";
import { button as buttonStyles } from "@nextui-org/theme";
import { SERVICE_CATEGORIES } from "@/utils/serviceConstants";
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

type Slot = {
  _id: string;
  time: string;
};

function ModifyAppointmentComponent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [formData, setFormData] = useState<FormData>({
    name: "",
    phone: searchParams.get("phone") || "",
    service: "",
    time: "",
    date: "",
    notes: "",
  });

  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState<Errors>({});
  const [isLoading, setIsLoading] = useState(true);
  const [chatNo, setChatNo] = useState(true);
  const [availableSlots, setAvailableSlots] = useState<Slot[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);

  useEffect(() => {
    const token = searchParams.get("token");
    const phoneParam = searchParams.get("phone");

    const fetchAppointmentData = async (phoneToFetch: string) => {
      try {
        setIsLoading(true);

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
        fetchAvailableSlots(appointmentResponse.data.date);
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

        await fetchAppointmentData(phone);
      } catch (error) {
        console.error("Error validating token:", error);
        setErrors({ general: "Invalid or expired token." });
        router.push("/tokenexp");
      } finally {
        setIsLoading(false);
      }
    };

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

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return false;
    }

    return true;
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateFields()) {
      return;
    }

    try {
      await axios.post(`${API_URLS.BACKEND_URL}/modify-appointment`, {
        ...formData,
        token: searchParams.get("token"),
      });
      router.push(
        `/confirmation?phone=${formData.phone}&message=Your appointment has been updated successfully!&note=${formData.notes}&service=${formData.service}&name=${formData.name}&date=${formData.date}&time=${formData.time}&chatbotNo=${chatNo}`
      );
    } catch (error) {
      console.error("Error updating appointment:", error);
      setMessage("Failed to update the appointment.");
    }
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    validateField(name, value);
    if (name === "date") {
      fetchAvailableSlots(value);
    }
  };

  const handleCancelClick = () => {
    setIsModalVisible(true);
  };

  const handleConfirmCancel = async () => {
    setIsModalVisible(false);
    try {
      await axios.post(`${API_URLS.BACKEND_URL}/cancel-appointment`, {
        phone: formData.phone,
        token: searchParams.get("token"),
      });

      router.push(
        `/confirmation?message=Your appointment has been cancelled successfully!&chatbotNo=${chatNo}`
      );
    } catch (error) {
      console.error("Error canceling appointment:", error);
      setMessage("Failed to cancel the appointment.");
    }
  };

  const handleCloseModal = () => {
    setIsModalVisible(false);
  };

  const getTodayDate = () => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  };

  const getCurrentTime = () => {
    const now = new Date();
    return now.toTimeString().slice(0, 5);
  };

  const fetchAvailableSlots = async (selectedDate: string) => {
    try {
      const response = await fetch(
        `${API_URLS.BACKEND_URL}/available-times/${selectedDate}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      if (response.ok) {
        const data: Slot[] = await response.json();
        setAvailableSlots(data);
      } else {
        console.error("Failed to fetch available slots.");
      }
    } catch (error) {
      console.error("Error fetching slots:", error);
    }
  };

  const convertTo12HourFormat = (time: string) => {
    const [hours, minutes] = time.split(":");
    const period = +hours >= 12 ? "PM" : "AM";
    const adjustedHours = +hours % 12 || 12;
    return `${adjustedHours}:${minutes} ${period}`;
  };

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
              type="hidden"
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
              {Object.entries(SERVICE_CATEGORIES).map(
                ([category, services]) => (
                  <SelectSection key={category} title={category}>
                    {services.map((service) => (
                      <SelectItem key={service.value} value={service.value}>
                        {service.label}
                      </SelectItem>
                    ))}
                  </SelectSection>
                )
              )}
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
              <Select
                label="Time"
                name="time"
                selectedKeys={formData.time ? [formData.time] : []}
                onChange={handleChange}
                isDisabled={!formData.date || availableSlots.length === 0}
                isInvalid={!!errors.time}
                errorMessage={errors.time}
                fullWidth
              >
                {availableSlots.map((slot) => (
                  <SelectItem key={slot.time} value={slot.time}>
                    {convertTo12HourFormat(slot.time)}
                  </SelectItem>
                ))}
              </Select>
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
                onPress={handleCancelClick}
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

      <Modal isOpen={isModalVisible} onClose={handleCloseModal} backdrop="blur">
        <ModalHeader>Confirm Cancellation</ModalHeader>
        <ModalBody>
          <p>Are you sure you want to cancel the appointment?</p>
        </ModalBody>
        <ModalFooter>
          <Button color="danger" onPress={handleConfirmCancel}>
            Yes, Cancel
          </Button>
          <Button onPress={handleCloseModal}>No, Go Back</Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}

export default function ModifyAppointment() {
  return (
    <Suspense
      fallback={
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
      }
    >
      <ModifyAppointmentComponent />
    </Suspense>
  );
}
