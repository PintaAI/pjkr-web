import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";

export default function TryoutPage() {
  // Mock data for demonstration
  const tryoutList = [
    {
      id: 1,
      title: "UTBK 2024 - Simulasi 1",
      description: "Simulasi UTBK lengkap dengan format terbaru",
      duration: 180,
      totalQuestions: 100,
      category: "UTBK",
      status: "available"
    },
    {
      id: 2,
      title: "UN SMA IPA",
      description: "Tryout ujian nasional SMA jurusan IPA",
      duration: 120,
      totalQuestions: 60,
      category: "UN",
      status: "available"
    },
    {
      id: 3,
      title: "SBMPTN Saintek",
      description: "Tryout SBMPTN untuk jurusan saintek",
      duration: 150,
      totalQuestions: 75,
      category: "SBMPTN",
      status: "coming-soon"
    },
    {
      id: 4,
      title: "UTBK 2024 - Simulasi 2",
      description: "Simulasi UTBK tahap kedua dengan soal berbeda",
      duration: 180,
      totalQuestions: 100,
      category: "UTBK",
      status: "available"
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'bg-green-100 text-green-800';
      case 'coming-soon': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'UTBK': return 'bg-blue-100 text-blue-800';
      case 'UN': return 'bg-purple-100 text-purple-800';
      case 'SBMPTN': return 'bg-red-100 text-red-800';
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
            <BreadcrumbPage>Tryout</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <h1 className="text-3xl font-bold mb-6">Tryout</h1>
      <p className="text-gray-600 mb-6">Practice with full-length mock exams</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {tryoutList.map((tryout) => (
          <div key={tryout.id} className="p-6 border rounded-lg hover:shadow-lg transition-shadow">
            <div className="flex justify-between items-start mb-3">
              <div className="flex gap-2">
                <span className={`px-2 py-1 text-xs rounded-full ${getCategoryColor(tryout.category)}`}>
                  {tryout.category}
                </span>
                <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(tryout.status)}`}>
                  {tryout.status.replace('-', ' ')}
                </span>
              </div>
            </div>
            
            <h2 className="text-xl font-semibold mb-2">{tryout.title}</h2>
            <p className="text-gray-600 mb-4">{tryout.description}</p>
            
            <div className="grid grid-cols-2 gap-4 mb-4 text-sm text-gray-600">
              <div>
                <span className="font-medium">Duration:</span> {tryout.duration} min
              </div>
              <div>
                <span className="font-medium">Questions:</span> {tryout.totalQuestions}
              </div>
            </div>
            
            {tryout.status === 'available' ? (
              <a
                href={`/tryout/${tryout.id}`}
                className="inline-block bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600"
              >
                Start Tryout
              </a>
            ) : (
              <button
                className="bg-gray-400 text-white px-6 py-2 rounded cursor-not-allowed"
                disabled
              >
                Coming Soon
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}