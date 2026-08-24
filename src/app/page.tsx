export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: "#f0f2f5" }}>
      <div className="bg-white rounded-2xl shadow-md p-8 max-w-sm text-center">
        <h1 className="text-xl font-bold text-gray-800 mb-2">Catálogo Flystock</h1>
        <p className="text-gray-500 text-sm">Accede a un catálogo usando su URL: <code className="bg-gray-100 px-1 rounded">/cat/[shortId]</code></p>
      </div>
    </div>
  );
}
