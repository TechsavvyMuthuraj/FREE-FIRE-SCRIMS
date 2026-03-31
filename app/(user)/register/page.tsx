import RegistrationForm from "@/components/RegistrationForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Register Squad - Free Fire Scrims",
  description: "Register your squad for upcoming Clash Squad and Battle Royale tournaments.",
};

export default function RegisterPage() {
  return (
    <main className="min-h-screen">
      <RegistrationForm />
    </main>
  );
}
