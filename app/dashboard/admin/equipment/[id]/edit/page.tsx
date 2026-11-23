import { Suspense } from "react";
import EditEquipmentForm from "@/app/dashboard/owner/equipment/[id]/edit/edit-equipment-form";

export default function AdminEditEquipmentPage() {
  return (
    <Suspense fallback={<p role="status" className="p-6">Loading equipment…</p>}>
      <EditEquipmentForm scope="admin" />
    </Suspense>
  );
}
