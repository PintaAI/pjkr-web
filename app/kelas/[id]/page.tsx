import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";

interface KelasDetailPageProps {
  params: { id: string };
}

export default function KelasDetailPage({ params }: KelasDetailPageProps) {
  const { id } = params;

  // Mock data for demonstration
  const kelasData = {
    id,
    name: `Kelas ${id}`,
    description: `Detailed description for kelas ${id}`,
    modules: [
      { id: 1, title: "Module 1", description: "Introduction" },
      { id: 2, title: "Module 2", description: "Basic Concepts" },
      { id: 3, title: "Module 3", description: "Advanced Topics" },
    ]
  };

  return (
    <div className="container mx-auto p-6">
      <Breadcrumb className="mb-6">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/">Home</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href="/kelas">Kelas</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{kelasData.name}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <h1 className="text-3xl font-bold mb-6">{kelasData.name}</h1>
      <p className="text-gray-600 mb-6">{kelasData.description}</p>
      
      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Modules</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {kelasData.modules.map((module) => (
            <div key={module.id} className="p-4 border rounded-lg hover:shadow-lg transition-shadow">
              <h3 className="text-lg font-semibold mb-2">{module.title}</h3>
              <p className="text-gray-600 mb-4">{module.description}</p>
              <a
                href={`/kelas/${id}/module/${module.id}`}
                className="inline-block bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
              >
                View Module
              </a>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}