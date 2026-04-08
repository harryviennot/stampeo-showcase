import { Header } from "@/components/sections/Header";
import { Footer } from "@/components/sections/Footer";
import { ContactPageClient } from "@/components/contact/ContactFormClient";

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-[var(--background)]">
      <Header />
      <ContactPageClient />
      <Footer />
    </div>
  );
}
