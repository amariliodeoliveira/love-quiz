import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex flex-1 items-center justify-center p-6">
      <div className="not-found">
        <p className="not-found-code">404</p>
        <h1 className="not-found-title">This card doesn&apos;t exist</h1>
        <p className="not-found-text">
          The page you&apos;re looking for wandered off.
        </p>
        <Link href="/" className="btn">
          Back to home
        </Link>
      </div>
    </div>
  );
}
