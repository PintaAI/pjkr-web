import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";

export default function SoalPage() {
  // Mock data for demonstration
  const soalList = [
    {
      id: 1,
      title: "Matematika Dasar",
      description: "Soal-soal matematika tingkat dasar",
      questionCount: 20,
      difficulty: "Easy"
    },
    {
      id: 2,
      title: "Bahasa Indonesia",
      description: "Latihan soal bahasa Indonesia",
      questionCount: 15,
      difficulty: "Medium"
    },
    {
      id: 3,
      title: "IPA Terpadu",
      description: "Kumpulan soal IPA untuk latihan",
      questionCount: 25,
      difficulty: "Hard"
    },
    {
      id: 4,
      title: "Sejarah Indonesia",
      description: "Soal sejarah Indonesia dan dunia",
      questionCount: 18,
      difficulty: "Medium"
    },
  ];

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return 'bg-green-100 text-green-800';
      case 'Medium': return 'bg-yellow-100 text-yellow-800';
      case 'Hard': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
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
            <BreadcrumbPage>Soal</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <h1 className="text-3xl font-bold mb-6">Soal (Questions)</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {soalList.map((soal) => (
          <div key={soal.id} className="p-4 border rounded-lg hover:shadow-lg transition-shadow">
            <div className="flex justify-between items-start mb-2">
              <h2 className="text-xl font-semibold">{soal.title}</h2>
              <span className={`px-2 py-1 text-xs rounded-full ${getDifficultyColor(soal.difficulty)}`}>
                {soal.difficulty}
              </span>
            </div>
            <p className="text-gray-600 mb-3">{soal.description}</p>
            <p className="text-sm text-gray-500 mb-4">{soal.questionCount} questions</p>
            <a
              href={`/soal/${soal.id}`}
              className="inline-block bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Start Practice
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}