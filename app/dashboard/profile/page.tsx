import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { getSession } from "@/lib/auth";
import ProfileForm from "./profile-form";

async function ProfileContent() {
  const session = await getSession();
  if (!session) redirect("/login?next=%2Fdashboard%2Fprofile");
  return <ProfileForm user={session.user} />;
}

export default function ProfilePage() {
  return (
    <main className="min-h-screen w-full bg-stone-50 text-zinc-950">
      <div className="mx-auto w-full max-w-3xl px-5 py-10 sm:px-8">
        <Link href="/dashboard" className="font-medium text-blue-700 hover:underline">
          Back to dashboard
        </Link>
        <h1 className="mt-4 text-3xl font-bold">My Profile</h1>
        <Suspense fallback={<p role="status" className="mt-4">Loading profile…</p>}>
          <ProfileContent />
        </Suspense>
      </div>
    </main>
  );
}
