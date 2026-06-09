import { Settings2 } from "lucide-react";
import { Section } from "./Section";
import { SessionsList } from "../SessionsList";

export function ActiveSessionsSection() {
  return (
    <Section title="Faol sessiyalar" icon={Settings2}>
      <SessionsList />
    </Section>
  );
}
