"use client";

import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Input } from "./ui/input";

export default function HostForm() {
  return (
    <div className="flex flex-col w-full items-center">
      <h1 className="font-semibold mb-5 sm:text-xl">
        Let's begin your hosting journey
      </h1>
      <Card className="p-10 sm:p-10 w-full sm:max-w-96">
        <form className="grid grid-col w-full gap-4">
          <label>
            <p className="font-semibold mb-1">Full Name: </p>
            <Input placeholder="Elon Musk"></Input>
          </label>
          <label>
            <p className="font-semibold mb-1">Phone Number: </p>
            <Input placeholder="+60123456789"></Input>
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
