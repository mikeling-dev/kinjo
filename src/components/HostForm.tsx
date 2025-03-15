"use client";

import { useState } from "react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Input } from "./ui/input";
import { CountryCodeSelector } from "./CountryCodeSelector";

export default function HostForm() {
  const [fullName, setFullName] = useState("");
  const [contactInfo, setContactInfo] = useState("");
  const [bankName, setBankName] = useState("");
  const [bankAccount, setBankAccount] = useState("");

  return (
    <div className="flex flex-col w-full items-center">
      <h1 className="font-semibold mb-5 sm:text-xl">
        Let's begin your hosting journey
      </h1>
      <Card className="p-10 sm:p-10 w-full sm:max-w-96 shadow-xl">
        <form className="grid grid-col w-full gap-4">
          <label>
            <p className="font-semibold mb-1">Full Name: </p>
            <Input placeholder="Elon Musk"></Input>
          </label>
          <label>
            <p className="font-semibold mb-1">Phone Number: </p>
            <div className="flex flex-row gap-2">
              <CountryCodeSelector />

              <Input placeholder="123456789"></Input>
            </div>
          </label>
          <label>
            <p className="font-semibold mb-1">Bank Name: </p>
            <Input placeholder="X Bank"></Input>
          </label>
          <label>
            <p className="font-semibold mb-1">Bank Account: </p>
            <Input placeholder="222444666888"></Input>
          </label>
          <Button>Apply!</Button>
        </form>
      </Card>
    </div>
  );
}
