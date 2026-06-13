import { Monitor } from "lucide-react";
import { Section } from "./Section";
import { SessionsList } from "../SessionsList";

export function ActiveSessionsSection() {
  return (
    <Section title="Faol seanslar" icon={Monitor}>
      <SessionsList />
    </Section>
  );
}
