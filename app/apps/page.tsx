import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";

export default function GamePage() {
  return (
    <div className="container mx-auto p-6">
      <Breadcrumb className="mb-6">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/">Home</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Game</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <h1 className="text-3xl font-bold mb-6">Game</h1>
      <div className="bg-gray-100 p-8 rounded-lg text-center">
        <h2 className="text-xl font-semibold mb-4">Game Module</h2>
        <p className="text-gray-600 mb-4">Game features will be implemented here</p>
        <div className="space-y-2">
          <div className="p-3 bg-white rounded border">Game Feature 1</div>
          <div className="p-3 bg-white rounded border">Game Feature 2</div>
          <div className="p-3 bg-white rounded border">Game Feature 3</div>
        </div>
      </div>
    </div>
  );
}