import { motion, type Variants } from "framer-motion";
import { KPICard } from "./KPICard";

// Kartalar ketma-ket (stagger) paydo bo'ladi — sahifa "jonli" ochiladi.
const container: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
};
const item: Variants = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } },
};

export function KpiCards({ kpis }: any) {
  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4"
    >
      {kpis.map((kpi: any) => (
        <motion.div key={kpi.label} variants={item}>
          <KPICard {...kpi} />
        </motion.div>
      ))}
    </motion.div>
  );
}
