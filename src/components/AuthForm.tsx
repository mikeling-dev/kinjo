"use client";
import { FormEvent, useState } from "react";
import { Tabs, TabsList, TabsTrigger } from "./ui/tabs";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Card } from "./ui/card";

export default function AuthForm() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setname] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const endpoint = isSignUp ? "/api/auth/signup" : "/api/auth/login";
    const body = isSignUp ? { email, password, name } : { email, password };

    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const data = await res.json();
    setMessage(data.message || data.error);
  };

  return (
    <div className="flex flex-col w-full p-10 justify-center items-center align-middle self-center">
      <Tabs defaultValue="login" className="w-full max-w-96 grid gap-3">
        <TabsList>
          <TabsTrigger
            value="login"
            onClick={() => setIsSignUp(false)}
            className="w-full"
          >
            Login
          </TabsTrigger>
          <TabsTrigger
            value="signup"
            onClick={() => setIsSignUp(true)}
            className="w-full"
          >
            Sign up
          </TabsTrigger>
        </TabsList>
        <Card className="p-8">
          <form className="flex flex-col gap-2 mb-2" onSubmit={handleSubmit}>
            {isSignUp ? (
              <div>
                <p>Name: </p>
                <Input
                  type="text"
                  placeholder="Jane Doe"
                  value={name}
                  onChange={(e) => setname(e.target.value)}
                  required
                />
              </div>
            ) : (
              ""
            )}
            <p>Email address: </p>
            <Input
              type="email"
              placeholder="example@kinjo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <p>Password: </p>
            <Input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <Button type="submit" className="my-2">
              {isSignUp ? "Sign up" : "Login"}
            </Button>
            <p className="text-muted-foreground italic text-xs">{message}</p>
          </form>
        </Card>
      </Tabs>
    </div>
  );
}
