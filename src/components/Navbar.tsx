import Link from "next/link";
import { Button } from "./ui/button";
import { Drawer, DrawerContent, DrawerTrigger } from "./ui/drawer";
import AuthForm from "./AuthForm";

export default function Navbar() {
  return (
    <div className="flex flex-row w-full h-fit p-4 py-6 justify-between items-center border-b">
      <Link href={"/"}>
        <h1 className="font-bold text-xl">Kinjo</h1>
      </Link>
      <Button
        variant={"outline"}
        className="rounded-3xl w-1/2 py-6 text-muted-foreground shadow-lg"
      >
        <svg
          fill="currentColor"
          viewBox="0 0 20 20"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <path
            clipRule="evenodd"
            fillRule="evenodd"
            d="M9 3.5a5.5 5.5 0 1 0 0 11 5.5 5.5 0 0 0 0-11ZM2 9a7 7 0 1 1 12.452 4.391l3.328 3.329a.75.75 0 1 1-1.06 1.06l-3.329-3.328A7 7 0 0 1 2 9Z"
          />
        </svg>
        Start searching
      </Button>
      <Drawer>
        <DrawerTrigger asChild>
          <Button>Login</Button>
        </DrawerTrigger>
        <DrawerContent className="pb-20">
          <AuthForm />
        </DrawerContent>
      </Drawer>
    </div>
  );
}
