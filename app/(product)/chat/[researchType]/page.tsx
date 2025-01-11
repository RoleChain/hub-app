"use client";
import Report from "../_components/reports";
import { useParams } from "next/navigation";

export const runtime = "edge";

export default function Page() {
  // const [researchType, setResearchType] = useState<"report" | "embed">("embed");
  const { researchType } = useParams();
  console.log(researchType);
  return (
    <section className="relative flex flex-col gap-4">
      <Report />
    </section>
  );
}
