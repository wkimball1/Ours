import { redirect } from "next/navigation";

export default function WouldYouRatherPage() {
  redirect("/app/games/this-or-that");
}
