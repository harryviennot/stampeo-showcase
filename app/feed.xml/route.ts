import { redirect } from "next/navigation";

export async function GET() {
  redirect("/feed-fr.xml");
}
