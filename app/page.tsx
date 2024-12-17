"use client"
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { 
  Input, 
  Button, 
  Card, 
  CardBody 
} from "@nextui-org/react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { button as buttonStyles } from "@nextui-org/theme";

import { API_URLS, DEFAULT_VALUES } from "@/utils/constants";

export default function Home() {
  const [phone, setPhone] = useState("");
  const [error, setError] = useState(""); 
  const router = useRouter();

  const checkPhone = async () => {
    if (!phone) {
      setError("Phone number is required.");
      return;
    }
    if (!/^\d{10}$/.test(phone)) {
      setError("Please enter a valid 10-digit phone number");
      return;
    }
    setError(""); // Clear any existing error
 
    const formattedPhone = `91${phone}`; // Add +91 prefix
    try {
      const response = await axios.get(`${API_URLS.BACKEND_URL}/check-phone/${formattedPhone}`);
      if (response.data.exists) {
        // Phone number exists, navigate to Modify page and pass the formatted phone number
        toast.success("Phone number found! Redirecting to Modify page...", {
          position: "top-center",
          autoClose: 2000,
        });
        setTimeout(() => {
          router.push(`/modify?phone=${formattedPhone}`);
        }, 2000);
      } else {
        // Phone number does not exist, navigate to Register page and pass the formatted phone number
        toast.info("Phone number not found! Redirecting to Register page...", {
          position: "top-center",
          autoClose: 2000,
        });
        setTimeout(() => {
          router.push(`/register?phone=${formattedPhone}`);
        }, 2000);
      }
    } catch (error) {
      console.error("Error checking phone:", error);
      toast.error("An error occurred while checking the phone number.", {
        position: "top-center",
      });
    }
  };
 
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Allow only numeric values
    if (/^\d*$/.test(value)) {
      setPhone(value);
      setError(""); // Clear error when user starts typing
    }
  };

  return (
    <div className="h-fit flex items-center justify-center p-4">
      <Card className=" w-full max-w-md">
        <CardBody className="flex items-center justify-center space-y-6 text-center">
          {/* <Image 
            src={DEFAULT_VALUES.IMAGE_URL} 
            alt="Spa" 
            className="mx-auto mb-4  object-cover rounded-lg"
          /> */}
          
          <h1 className="text-2xl font-bold mb-4">
            Welcome to the Spa Booking System
          </h1>
          
          <Input
            type="tel"
            label="Phone Number"
            value={phone}
            onChange={handleInputChange}
            maxLength={10}
            isInvalid={!!error}
            errorMessage={error}
            fullWidth
          />
          
          <Button 
            color="primary" 
            onPress={checkPhone} 
            className={buttonStyles({
              color: "primary",
              radius: "full",
              variant: "shadow",
            })}
            fullWidth
          >
            Check
          </Button>
        </CardBody>
      </Card>

      <ToastContainer />
    </div>
  );
}