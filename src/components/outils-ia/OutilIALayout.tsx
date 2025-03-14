
import React, { ReactNode } from "react";
import Sidebar from "@/components/layout/Sidebar";

interface OutilIALayoutProps {
  title: string;
  icon: ReactNode;
  description: string;
  children: ReactNode;
}

const OutilIALayout = ({
  title,
  icon,
  description,
  children,
}: OutilIALayoutProps) => {
  return (
    <div className="flex min-h-screen bg-gradient-to-b from-[#f5f2ee] to-white overflow-hidden">
      <Sidebar />
      <div className="flex-1 h-screen flex flex-col items-center justify-start px-3 md:px-6 py-4 md:py-6 overflow-y-auto custom-scrollbar">
        <div className="w-full max-w-4xl mx-auto">
          {/* Icon */}
          <div className="flex flex-col items-center justify-center mb-4 md:mb-6">
            <div className="h-14 w-14 md:h-16 md:w-16 rounded-full bg-[#f5f2ee] flex items-center justify-center text-[#B88E23] mb-2 md:mb-3">
              {icon}
            </div>
            <h1 className="text-xl md:text-2xl font-semibold text-[#5C4E3D] mb-2 text-center">{title}</h1>
            <p className="text-[#454240] text-center max-w-md text-sm md:text-base px-2">{description}</p>
          </div>

          {/* Content */}
          <div className="w-full bg-white rounded-xl border border-[#B88E23]/10 p-3 md:p-5 shadow-sm mb-4">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OutilIALayout;
