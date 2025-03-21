"use client";
import Link from "next/link";
import { Button } from "./ui/button";
import { Drawer, DrawerContent, DrawerTrigger } from "./ui/drawer";
import AuthForm from "./AuthForm";
import { useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Avatar } from "./ui/avatar";
import { useAuth } from "@/lib/AuthContext";
import SearchForm from "./SearchForm";

export default function Navbar() {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  return (
    <div className="flex flex-row w-full h-fit p-4 py-6 justify-between items-center border-b">
      <Link href={"/"}>
        <h1 className="font-bold text-xl">Kinjo</h1>
      </Link>
      <Drawer open={searchOpen} onOpenChange={setSearchOpen}>
        <DrawerTrigger asChild>
          <Button
            variant="outline"
            className="rounded-3xl w-1/2 py-6 text-muted-foreground shadow-lg flex items-center justify-center gap-2"
          >
            <svg
              fill="currentColor"
              viewBox="0 0 20 20"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
              className="w-5 h-5"
            >
              <path
                clipRule="evenodd"
                fillRule="evenodd"
                d="M9 3.5a5.5 5.5 0 1 0 0 11 5.5 5.5 0 0 0 0-11ZM2 9a7 7 0 1 1 12.452 4.391l3.328 3.329a.75.75 0 1 1-1.06 1.06l-3.329-3.328A7 7 0 0 1 2 9Z"
              />
            </svg>
            Start searching
          </Button>
        </DrawerTrigger>
        <DrawerContent className="p-6">
          <SearchForm onSearch={() => setSearchOpen(false)} />
        </DrawerContent>
      </Drawer>
      {user ? (
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger>
            <Avatar className="h-10 w-10 border p-1">
              <svg
                fill="currentColor"
                viewBox="0 0 20 20"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
              >
                <path d="M10 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM3.465 14.493a1.23 1.23 0 0 0 .41 1.412A9.957 9.957 0 0 0 10 18c2.31 0 4.438-.784 6.131-2.1.43-.333.604-.903.408-1.41a7.002 7.002 0 0 0-13.074.003Z" />
              </svg>
            </Avatar>
          </PopoverTrigger>
          <PopoverContent className="flex flex-col mr-4 mt-4">
            <Link
              href="/profile"
              onClick={() => setOpen(false)}
              className="flex w-full border-b p-3 hover:bg-muted hover:text-muted-foreground rounded-md justify-center"
            >
              Profile
            </Link>
            <Link
              href="/host"
              onClick={() => setOpen(false)}
              className="flex w-full border-b p-3 mb-4 hover:bg-muted hover:text-muted-foreground rounded-md justify-center"
            >
              {user.isHost ? "Host Dashboard" : "Host now"}
            </Link>
            <Button onClick={logout}>Logout</Button>
          </PopoverContent>
        </Popover>
      ) : (
        <Drawer>
          <DrawerTrigger asChild>
            <Button>Login</Button>
          </DrawerTrigger>
          <DrawerContent className="pb-20">
            <AuthForm />
          </DrawerContent>
        </Drawer>
      )}
    </div>
  );
}
