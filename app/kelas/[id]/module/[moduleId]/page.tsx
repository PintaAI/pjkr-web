import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";

interface ModuleDetailPageProps {
  params: { id: string; moduleId: string };
}

export default function ModuleDetailPage({ params }: ModuleDetailPageProps) {
  const { id, moduleId } = params;

  // Mock data for demonstration
  const moduleData = {
    id: moduleId,
    title: `Module ${moduleId}`,
    kelasId: id,
    kelasName: `Kelas ${id}`,
    content: `This is the detailed content for Module ${moduleId} in Kelas ${id}`,
    lessons: [
      { id: 1, title: "Lesson 1", duration: "30 min" },
      { id: 2, title: "Lesson 2", duration: "45 min" },
      { id: 3, title: "Lesson 3", duration: "60 min" },
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
            <BreadcrumbLink href={`/kelas/${id}`}>{moduleData.kelasName}</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{moduleData.title}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      
      <h1 className="text-3xl font-bold mb-6">{moduleData.title}</h1>
      <p className="text-gray-600 mb-6">{moduleData.content}</p>
      
      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Lessons</h2>
        <div className="space-y-3">
          {moduleData.lessons.map((lesson) => (
            <div key={lesson.id} className="p-4 border rounded-lg flex justify-between items-center">
              <div>
                <h3 className="text-lg font-semibold">{lesson.title}</h3>
                <p className="text-gray-600">Duration: {lesson.duration}</p>
              </div>
              <button className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
                Start Lesson
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}