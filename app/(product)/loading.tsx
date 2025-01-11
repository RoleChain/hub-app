import { Spinner } from "@/components/icons";

export default function Loading() {
  return (
    <div className="relative flex h-full w-full flex-col items-center">
      <Spinner />
    </div>
  );
}
