/**
 * Placeholder protected page. Will eventually fetch /api/auth/me or similar to show profile info.
 */
export default function Me() {
  return (
    <main className="mx-auto max-w-xl p-6">
      <h1 className="text-2xl font-semibold mb-4">My Account</h1>
      <p className="text-sm opacity-80 mb-4">Protected content placeholder. Implement auth guard + data fetch in Week 3.</p>
      {/* TODO: Display user profile details after implementing auth store & /me endpoint call */}
    </main>
  );
}
