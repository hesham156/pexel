import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import AdForm from "../AdForm";

export default async function EditAdPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    redirect("/");
  }

  const ad = await prisma.advertisement.findUnique({
    where: { id: params.id },
    include: {
      targetUsers: {
        select: { id: true, name: true, email: true }
      }
    }
  });

  if (!ad) {
    redirect("/admin/ads");
  }

  return <AdForm initialData={ad} />;
}
