"use client";

import { useState } from "react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Input } from "./ui/input";
import { CountryCodeSelector } from "./CountryCodeSelector";
import { useAuth } from "@/lib/AuthContext";

export default function HostForm() {
  const [fullName, setFullName] = useState("");
  const [contactInfo, setContactInfo] = useState("");
  const [bankName, setBankName] = useState("");
  const [bankAccount, setBankAccount] = useState("");
  const [countryCode, setCountryCode] = useState<string>("");
  const [phoneNumber, setPhoneNumber] = useState<string>("");
  const [message, setMessage] = useState<string>("");
  const { user } = useAuth();

  const handleContactChange = (newCode: string, newNumber: string) => {
    setCountryCode(newCode);
    setPhoneNumber(newNumber);
    setContactInfo(`${newCode}${newNumber}`);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      const res = await fetch("/api/host/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullName, contactInfo, bankName, bankAccount }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage("Application submitted!");
        setFullName("");
        setContactInfo("");
        setBankName("");
        setBankAccount("");
        setPhoneNumber("");
        setCountryCode("");
      } else {
        setMessage(data.error || "Something went wrong...");
      }
    } catch (error) {
      console.error("Submission error: ", error);
      setMessage("An error occurred while submitting your application");
    }
  };

  return (
    <div className="flex flex-col w-full items-center py-10">
      <h1 className="font-semibold mb-5 text-xl">
        Let's begin your hosting journey
      </h1>
      <Card className="p-10 sm:p-10 w-full sm:max-w-96 shadow-xl">
        <form className="grid grid-col w-full gap-4" onSubmit={handleSubmit}>
          <label>
            <p className="font-semibold mb-1">Full Name: </p>
            <Input
              placeholder="Elon Musk"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            ></Input>
          </label>
          <label>
            <p className="font-semibold mb-1">Phone Number: </p>
            <div className="flex flex-row gap-2">
              <CountryCodeSelector
                value={countryCode}
                onChange={(newCode) =>
                  handleContactChange(newCode, phoneNumber)
                }
              />

              <Input
                placeholder="123456789"
                type="number"
                value={phoneNumber}
                onChange={(e) =>
                  handleContactChange(countryCode, e.target.value.toString())
                }
                required
              ></Input>
            </div>
          </label>
          <label>
            <p className="font-semibold mb-1">Bank Name: </p>
            <Input
              placeholder="X Bank"
              value={bankName}
              onChange={(e) => setBankName(e.target.value)}
              required
            ></Input>
          </label>
          <label>
            <p className="font-semibold mb-1">Bank Account: </p>
            <Input
              placeholder="222444666888"
              value={bankAccount}
              onChange={(e) => setBankAccount(e.target.value)}
              required
            ></Input>
          </label>
          <Button type="submit">Apply!</Button>
        </form>
        {message && <p>{message}</p>}
      </Card>
    </div>
  );
}
