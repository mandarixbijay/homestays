import React from "react";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Shield, Flame, Ambulance, BadgeCheck } from "lucide-react";
import Navbar from "@/components/navbar/navbar";
import Footer from "@/components/footer/footer";

const emergencyContacts = [
  {
    icon: <Shield className="w-6 h-6 text-muted-foreground" />,
    label: "Police",
    number: "100",
  },
  {
    icon: <Flame className="w-6 h-6 text-muted-foreground" />,
    label: "Fire Department",
    number: "101",
  },
  {
    icon: <Ambulance className="w-6 h-6 text-muted-foreground" />,
    label: "Ambulance",
    number: "102",
  },
  {
    icon: <BadgeCheck className="w-6 h-6 text-muted-foreground" />,
    label: "Tourist Police",
    number: "103",
  },
];

const safetyTips = [
  "Stay aware of your surroundings at all times.",
  "Avoid walking alone at night in unfamiliar areas.",
  "Keep your valuables secure and out of sight.",
  "Be cautious of accepting drinks or food from strangers.",
  "Trust your instincts; if a situation feels unsafe, remove yourself from it.",
];

const SafetyOption = () => {
  return (
    <><div className="max-w-3xl mx-auto py-10 px-4">
      <Navbar />
      <h1 className="text-3xl font-bold mb-6 mt-20">Safety Information</h1>

      <h2 className="text-xl font-bold mb-2">Emergency Contacts</h2>
      <p className="mb-4">
        In case of an emergency, here are some important contacts:
      </p>
      <div className="space-y-3 mb-8">
        {emergencyContacts.map((contact, idx) => (
          <Card key={idx} className="flex items-center gap-4 p-4">
            {contact.icon}
            <div>
              <div className="font-semibold">{contact.label}</div>
              <div className="text-muted-foreground text-sm">{contact.number}</div>
            </div>
          </Card>
        ))}
      </div>

      <h2 className="text-xl font-bold mb-2">Health and Medical Advice</h2>
      <p className="mb-8">
        Before your trip, consult your doctor for necessary vaccinations and health advice. Ensure you have adequate travel insurance that covers medical emergencies. Carry a basic first-aid kit with essential medications.
      </p>

      <h2 className="text-xl font-bold mb-2">General Safety Tips</h2>
      <div className="space-y-4 mb-8">
        {safetyTips.map((tip, idx) => (
          <div key={idx} className="flex items-start gap-3">
            <Checkbox id={`tip-${idx}`} disabled />
            <label htmlFor={`tip-${idx}`} className="text-base">
              {tip}
            </label>
          </div>
        ))}
      </div>

      <h2 className="text-xl font-bold mb-2">Additional Resources</h2>
      <p className="mb-2">
        For more information on safety in Nepal, you can visit the official tourism website or consult your country&apos;s travel advisory.
      </p>
      <p className="text-xs text-muted-foreground mt-4">
        <span className="font-semibold">Disclaimer:</span> This safety information is for general guidance only and should not be considered a substitute for professional advice. Always follow local laws and regulations and exercise caution during your travels.
      </p>
    </div>

      <Footer />


    </>
  );
};

export default SafetyOption;
