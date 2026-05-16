import React, { type ReactNode } from "react";

interface PageHeaderProps {
  title: ReactNode;
  subtitle?: ReactNode;
}

export default function PageHeader({ title, subtitle }: PageHeaderProps) {
  return (
    <section className="my-10">
      <h2 className="text-3xl font-bold text-slate-800 tracking-tight">{title}</h2>
      {subtitle && <p className="text-slate-500 mt-2 text-lg">{subtitle}</p>}
    </section>
  );
}
