
import React, { ReactNode } from "react";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  icon: ReactNode;
  children?: ReactNode;
}

export const PageHeader = ({ title, subtitle, icon, children }: PageHeaderProps) => {
  return (
    <div className="flex items-center justify-between mb-6 pt-14 md:pt-0">
      <div className="flex items-center gap-4">
        <div className="h-10 w-10 rounded-full bg-[#f5f2ee] flex items-center justify-center text-[#B88E23]">
          {icon}
        </div>
        <div>
          <h1 className="text-2xl font-semibold text-[#5C4E3D]">{title}</h1>
          {subtitle && <p className="text-[#5C4E3D]/70">{subtitle}</p>}
        </div>
      </div>
      {children}
    </div>
  );
};

export default PageHeader;
