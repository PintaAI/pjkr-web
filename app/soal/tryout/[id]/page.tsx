import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";

interface TryoutDetailPageProps {
  params: { id: string };
}

export default function TryoutDetailPage({ params }: TryoutDetailPageProps) {
  const { id } = params;

  // Mock data for demonstration
  const tryoutData = {
    id,
    title: `Tryout ${id}`,
    description: `Full mock exam simulation ${id}`,
    duration: 180,
    totalQuestions: 100,
    category: "UTBK",
    sections: [
      {
        id: 1,
        name: "Tes Potensi Skolastik",
        questionCount: 30,
        timeLimit: 60,
        description: "Penalaran Umum, Pengetahuan Kuantitatif, dll"
      },
      {
        id: 2,
        name: "Literasi Bahasa Indonesia",
        questionCount: 30,
        timeLimit: 45,
        description: "Pemahaman bacaan dan menulis"
      },
      {
        id: 3,
        name: "Literasi Bahasa Inggris",
        questionCount: 20,
        timeLimit: 30,
        description: "Reading comprehension and grammar"
      },
      {
        id: 4,
        name: "Penalaran Matematika",
        questionCount: 20,
        timeLimit: 45,
        description: "Matematika dasar dan penalaran"
      }
    ],
    instructions: [
      "Pastikan koneksi internet stabil selama mengerjakan",
      "Tryout tidak dapat dijeda setelah dimulai",
      "Jawaban akan tersimpan otomatis",
      "Hasil akan langsung muncul setelah selesai"
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
            <BreadcrumbLink href="/tryout">Tryout</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{tryoutData.title}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <h1 className="text-3xl font-bold mb-6">{tryoutData.title}</h1>
      <p className="text-gray-600 mb-6">{tryoutData.description}</p>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2">
          <div className="bg-blue-50 p-6 rounded-lg mb-6">
            <h2 className="text-xl font-semibold mb-4">Exam Overview</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="font-medium">Total Duration:</span> {tryoutData.duration} minutes
              </div>
              <div>
                <span className="font-medium">Total Questions:</span> {tryoutData.totalQuestions}
              </div>
              <div>
                <span className="font-medium">Category:</span> {tryoutData.category}
              </div>
              <div>
                <span className="font-medium">Sections:</span> {tryoutData.sections.length}
              </div>
            </div>
          </div>

          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-4">Exam Sections</h2>
            <div className="space-y-4">
              {tryoutData.sections.map((section) => (
                <div key={section.id} className="p-4 border rounded-lg">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg font-semibold">{section.name}</h3>
                    <span className="text-sm text-gray-500">{section.timeLimit} min</span>
                  </div>
                  <p className="text-gray-600 mb-2">{section.description}</p>
                  <p className="text-sm text-gray-500">{section.questionCount} questions</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div>
          <div className="bg-yellow-50 p-6 rounded-lg mb-6">
            <h2 className="text-xl font-semibold mb-4">Instructions</h2>
            <ul className="space-y-2">
              {tryoutData.instructions.map((instruction, index) => (
                <li key={index} className="flex items-start">
                  <span className="text-yellow-600 mr-2">•</span>
                  <span className="text-sm">{instruction}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-3">
            <button className="w-full bg-green-500 text-white py-3 px-6 rounded-lg hover:bg-green-600 font-semibold">
              Start Tryout
            </button>
            <button className="w-full bg-gray-500 text-white py-3 px-6 rounded-lg hover:bg-gray-600">
              View Previous Results
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}