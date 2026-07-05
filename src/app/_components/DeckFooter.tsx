import Link from "next/link";

export default function DeckFooter({
  questionCount,
  dareCount,
}: {
  questionCount: number;
  dareCount: number;
}) {
  return (
    <footer>
      <p>
        {questionCount} cards · 3 levels · {dareCount} dares · built for two
      </p>
      <Link href="/profile/login" className="footer-admin-link">
        Login
      </Link>
    </footer>
  );
}
