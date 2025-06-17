import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";

export default function KelasPage() {
  // Mock data for demonstration
  const kelasList = [
    { id: 1, name: "Matematika Dasar", description: "Konsep dasar matematika" },
    { id: 2, name: "Bahasa Indonesia", description: "Pembelajaran bahasa Indonesia" },
    { id: 3, name: "IPA Terpadu", description: "Ilmu pengetahuan alam terpadu" },
    { id: 4, name: "Sejarah", description: "Sejarah Indonesia dan dunia" },
  ];

  return (
    <div className="container mx-auto p-6">
      <Breadcrumb className="mb-6">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/">Home</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Kelas</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <h1 className="text-3xl font-bold mb-6">Kelas (Classes)</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {kelasList.map((kelas) => (
          <div key={kelas.id} className="p-4 border rounded-lg hover:shadow-lg transition-shadow">
            <h2 className="text-xl font-semibold mb-2">{kelas.name}</h2>
            <p className="text-gray-600 mb-4">{kelas.description}</p>
            <a
              href={`/kelas/${kelas.id}`}
              className="inline-block bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              View Class
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}