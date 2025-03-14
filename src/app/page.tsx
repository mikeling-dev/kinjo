import AuthForm from "@/components/AuthForm";
import Navbar from "@/components/Navbar";

export default function Home() {
  return (
    <div className=" font-[family-name:var(--font-geist-sans)]">
      <Navbar />
      <AuthForm />
    </div>
  );
}
