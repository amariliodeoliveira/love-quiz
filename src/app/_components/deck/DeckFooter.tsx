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
    </footer>
  );
}
