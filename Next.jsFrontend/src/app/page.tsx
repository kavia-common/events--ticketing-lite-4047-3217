import Link from "next/link";

export default function Home() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Event Ticketing (Frontend)</h1>
      <p className="text-gray-700">
        Create events, define ticket types, generate tickets, and validate check-ins.
      </p>
      <Link
        href="/events"
        className="inline-flex px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-600"
      >
        Go to Events
      </Link>
    </div>
  );
}
