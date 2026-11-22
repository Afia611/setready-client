import { Suspense } from "react";
import EditEquipmentForm from "./edit-equipment-form";

export default function EditEquipmentPage() {
  return (
    <Suspense fallback={<p role="status" className="p-6">Loading equipment…</p>}>
      <EditEquipmentForm />
    </Suspense>
  );
}
