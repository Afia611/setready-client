import { redirect } from "next/navigation";
import { Suspense } from "react";
import { getSession } from "@/lib/auth";
import AddEquipmentForm from "./add-equipment-form";

async function OwnerForm() {
  const session = await getSession();
  if (!session) redirect("/login?next=%2Fdashboard%2Fowner%2Fequipment%2Fnew");
  if (session.user.role !== "owner") redirect("/dashboard");
  return <AddEquipmentForm />;
}

export default function AddEquipmentPage() {
  return (
    <Suspense fallback={<p className="p-6" role="status">Loading equipment form…</p>}>
      <OwnerForm />
    </Suspense>
  );
}
