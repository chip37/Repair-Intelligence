"use client";

import { useRouter } from "next/navigation";

export default function DeleteRepairButton({ id }: { id: string }) {
  const router = useRouter();

  async function handleDelete() {
    const confirmed = confirm("Delete this repair record?");
    if (!confirmed) return;

    const res = await fetch(`/api/repairs/${id}`, {
      method: "DELETE",
    });

    if (!res.ok) {
      alert("Failed to delete repair.");
      return;
    }

    router.push("/repairs");
  }

  return (
    <button
      onClick={handleDelete}
      className="mt-6 rounded bg-red-600 px-4 py-2 text-white"
    >
      Delete Repair
    </button>
  );
}