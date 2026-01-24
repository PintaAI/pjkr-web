import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";

interface SoalDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function SoalDetailPage(props: SoalDetailPageProps) {
  const params = await props.params;
  const { id } = params;

  // Mock data for demonstration
  const soalData = {
    id,
    title: `Soal Set ${id}`,
    description: `Practice questions set ${id}`,
    totalQuestions: 20,
    timeLimit: 60,
    questions: [
      {
        id: 1,
        question: "What is 2 + 2?",
        options: ["3", "4", "5", "6"],
        type: "multiple-choice"
      },
      {
        id: 2,
        question: "What is the capital of Indonesia?",
        options: ["Jakarta", "Bandung", "Surabaya", "Medan"],
        type: "multiple-choice"
      },
      {
        id: 3,
        question: "Explain the concept of photosynthesis.",
        type: "essay"
      }
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
            <BreadcrumbLink href="/soal">Soal</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{soalData.title}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <h1 className="text-3xl font-bold mb-6">{soalData.title}</h1>
      <p className="text-gray-600 mb-6">{soalData.description}</p>
      
      <div className="bg-blue-50 p-4 rounded-lg mb-6">
        <h2 className="text-lg font-semibold mb-2">Test Information</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <span className="font-medium">Total Questions:</span> {soalData.totalQuestions}
          </div>
          <div>
            <span className="font-medium">Time Limit:</span> {soalData.timeLimit} minutes
          </div>
        </div>
      </div>

      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Sample Questions</h2>
        <div className="space-y-6">
          {soalData.questions.map((question, index) => (
            <div key={question.id} className="p-4 border rounded-lg">
              <h3 className="text-lg font-semibold mb-3">
                Question {index + 1}: {question.question}
              </h3>
              {question.type === "multiple-choice" && question.options && (
                <div className="space-y-2">
                  {question.options.map((option, optionIndex) => (
                    <div key={optionIndex} className="flex items-center">
                      <input
                        type="radio"
                        name={`question-${question.id}`}
                        className="mr-2"
                        disabled
                      />
                      <label className="text-gray-700">{option}</label>
                    </div>
                  ))}
                </div>
              )}
              {question.type === "essay" && (
                <textarea
                  className="w-full p-2 border rounded"
                  rows={4}
                  placeholder="Your answer here..."
                  disabled
                />
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="flex gap-4 mb-6">
        <button className="bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600">
          Start Test
        </button>
        <button className="bg-gray-500 text-white px-6 py-3 rounded-lg hover:bg-gray-600">
          Practice Mode
        </button>
      </div>
    </div>
  );
}
