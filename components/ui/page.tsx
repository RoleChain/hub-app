import { ReactNode } from "react";

const Page = ({ children }: { children: ReactNode }) => {
  return <div className="flex flex-col">{children}</div>;
};

export default Page;
