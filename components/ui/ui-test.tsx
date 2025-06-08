import { Avatar, AvatarFallback } from "./avatar"
import { 
  Breadcrumb, 
  BreadcrumbItem, 
  BreadcrumbLink, 
  BreadcrumbList, 
  BreadcrumbPage, 
  BreadcrumbSeparator 
} from "./breadcrumb"
import { Button } from "./button"
import { Calendar } from "./calendar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./card"
import { Checkbox } from "./checkbox"
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "./dialog"
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "./dropdown-menu"
import { Input } from "./input"
import { Label } from "./label"
import { Progress } from "./progress"
import { ScrollArea } from "./scroll-area"
import { Skeleton } from "./skeleton"
import { Switch } from "./switch"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./tabs"
import { ModeToggle } from "@/components/mode-toggle"
import { 
  Heart, 
  Star, 
  Home, 
  Settings, 
  User, 
  Mail, 
  Phone, 
  Camera, 
  Download, 
  Upload, 
  Search, 
  Filter, 
  Calendar as CalendarIcon, 
  Globe,
  Plus,
  Minus,
  X,
  Check,
  AlertTriangle,
  Info,
  CheckCircle,
  XCircle
} from "lucide-react"

export function UITest() {
  return (
    <div className="p-8 bg-background text-foreground min-h-screen">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-start mb-8">
          <div className="flex-1">
            <h1 className="text-4xl font-bold mb-2 text-center">UI Components & Color Test</h1>
            <h2 className="text-2xl font-semibold text-center text-muted-foreground">UI 컴포넌트 및 색상 테스트</h2>
          </div>
          <div className="flex-shrink-0">
            <ModeToggle />
          </div>
        </div>
        
        {/* Icons */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-6">Icons</h2>
          <h3 className="text-lg font-medium mb-4">Lucide 아이콘</h3>
          <Card>
            <CardContent className="p-6">
              <div className="space-y-6">
                <div>
                  <h4 className="font-semibold mb-3">Basic Icons</h4>
                  <div className="grid grid-cols-4 md:grid-cols-8 gap-4">
                    <div className="flex flex-col items-center gap-2">
                      <Heart className="w-6 h-6 text-foreground" />
                      <span className="text-xs text-muted-foreground">Heart</span>
                    </div>
                    <div className="flex flex-col items-center gap-2">
                      <Star className="w-6 h-6 text-foreground" />
                      <span className="text-xs text-muted-foreground">Star</span>
                    </div>
                    <div className="flex flex-col items-center gap-2">
                      <Home className="w-6 h-6 text-foreground" />
                      <span className="text-xs text-muted-foreground">Home</span>
                    </div>
                    <div className="flex flex-col items-center gap-2">
                      <Settings className="w-6 h-6 text-foreground" />
                      <span className="text-xs text-muted-foreground">Settings</span>
                    </div>
                    <div className="flex flex-col items-center gap-2">
                      <User className="w-6 h-6 text-foreground" />
                      <span className="text-xs text-muted-foreground">User</span>
                    </div>
                    <div className="flex flex-col items-center gap-2">
                      <Mail className="w-6 h-6 text-foreground" />
                      <span className="text-xs text-muted-foreground">Mail</span>
                    </div>
                    <div className="flex flex-col items-center gap-2">
                      <Phone className="w-6 h-6 text-foreground" />
                      <span className="text-xs text-muted-foreground">Phone</span>
                    </div>
                    <div className="flex flex-col items-center gap-2">
                      <Camera className="w-6 h-6 text-foreground" />
                      <span className="text-xs text-muted-foreground">Camera</span>
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold mb-3">Action Icons</h4>
                  <div className="grid grid-cols-4 md:grid-cols-8 gap-4">
                    <div className="flex flex-col items-center gap-2">
                      <Download className="w-6 h-6 text-foreground" />
                      <span className="text-xs text-muted-foreground">Download</span>
                    </div>
                    <div className="flex flex-col items-center gap-2">
                      <Upload className="w-6 h-6 text-foreground" />
                      <span className="text-xs text-muted-foreground">Upload</span>
                    </div>
                    <div className="flex flex-col items-center gap-2">
                      <Search className="w-6 h-6 text-foreground" />
                      <span className="text-xs text-muted-foreground">Search</span>
                    </div>
                    <div className="flex flex-col items-center gap-2">
                      <Filter className="w-6 h-6 text-foreground" />
                      <span className="text-xs text-muted-foreground">Filter</span>
                    </div>
                    <div className="flex flex-col items-center gap-2">
                      <Plus className="w-6 h-6 text-foreground" />
                      <span className="text-xs text-muted-foreground">Plus</span>
                    </div>
                    <div className="flex flex-col items-center gap-2">
                      <Minus className="w-6 h-6 text-foreground" />
                      <span className="text-xs text-muted-foreground">Minus</span>
                    </div>
                    <div className="flex flex-col items-center gap-2">
                      <X className="w-6 h-6 text-foreground" />
                      <span className="text-xs text-muted-foreground">Close</span>
                    </div>
                    <div className="flex flex-col items-center gap-2">
                      <Check className="w-6 h-6 text-foreground" />
                      <span className="text-xs text-muted-foreground">Check</span>
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold mb-3">Colored Icons</h4>
                  <div className="grid grid-cols-4 md:grid-cols-8 gap-4">
                    <div className="flex flex-col items-center gap-2">
                      <CheckCircle className="w-6 h-6 text-success" />
                      <span className="text-xs text-muted-foreground">Success</span>
                    </div>
                    <div className="flex flex-col items-center gap-2">
                      <XCircle className="w-6 h-6 text-fail" />
                      <span className="text-xs text-muted-foreground">Error</span>
                    </div>
                    <div className="flex flex-col items-center gap-2">
                      <AlertTriangle className="w-6 h-6 text-destructive" />
                      <span className="text-xs text-muted-foreground">Warning</span>
                    </div>
                    <div className="flex flex-col items-center gap-2">
                      <Info className="w-6 h-6 text-primary" />
                      <span className="text-xs text-muted-foreground">Info</span>
                    </div>
                    <div className="flex flex-col items-center gap-2">
                      <Heart className="w-6 h-6 text-accent fill-current" />
                      <span className="text-xs text-muted-foreground">Filled</span>
                    </div>
                    <div className="flex flex-col items-center gap-2">
                      <Star className="w-6 h-6 text-secondary fill-current" />
                      <span className="text-xs text-muted-foreground">Secondary</span>
                    </div>
                    <div className="flex flex-col items-center gap-2">
                      <CalendarIcon className="w-6 h-6 text-chart-1" />
                      <span className="text-xs text-muted-foreground">Chart</span>
                    </div>
                    <div className="flex flex-col items-center gap-2">
                      <Globe className="w-6 h-6 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">Muted</span>
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold mb-3">Icons in Buttons</h4>
                  <div className="flex flex-wrap gap-3">
                    <Button>
                      <Download className="w-4 h-4" />
                      다운로드
                    </Button>
                    <Button variant="secondary">
                      <Upload className="w-4 h-4" />
                      업로드
                    </Button>
                    <Button variant="outline">
                      <Search className="w-4 h-4" />
                      검색
                    </Button>
                    <Button variant="destructive">
                      <X className="w-4 h-4" />
                      삭제
                    </Button>
                    <Button size="icon">
                      <Heart className="w-4 h-4" />
                    </Button>
                    <Button size="icon" variant="outline">
                      <Star className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Typography & Font Test */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-6">Typography & Font Test</h2>
          <h3 className="text-lg font-medium mb-4">한글 (Hangeul) Typography</h3>
          <Card>
            <CardContent className="p-6 space-y-4">
              <div>
                <h4 className="text-xl font-bold mb-2">한국어 제목 (Korean Title)</h4>
                <p className="text-base mb-4">
                  안녕하세요! 이것은 한글 타이포그래피 테스트입니다. 
                  현재 폰트가 한글을 어떻게 렌더링하는지 확인할 수 있습니다.
                </p>
                <p className="text-sm text-muted-foreground mb-4">
                  작은 텍스트로도 한글이 잘 보이는지 확인해보겠습니다. 
                  가나다라마바사아자차카타파하
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h5 className="font-semibold mb-2">English Text</h5>
                    <p className="text-sm">The quick brown fox jumps over the lazy dog.</p>
                    <p className="text-xs text-muted-foreground">Mixed content with multiple languages</p>
                  </div>
                  <div>
                    <h5 className="font-semibold mb-2">한글 텍스트</h5>
                    <p className="text-sm">다람쥐 헌 쳇바퀴에 타고파</p>
                    <p className="text-xs text-muted-foreground">여러 언어가 혼합된 콘텐츠</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Color Palette */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-6">Color Palette</h2>
          <h3 className="text-lg font-medium mb-4">색상 팔레트</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="bg-primary text-primary-foreground">
              <CardContent className="p-4 text-center">
                <div className="w-full h-12 mb-2"></div>
                <p className="text-sm font-medium">Primary</p>
              </CardContent>
            </Card>
            <Card className="bg-secondary text-secondary-foreground">
              <CardContent className="p-4 text-center">
                <div className="w-full h-12 mb-2"></div>
                <p className="text-sm font-medium">Secondary</p>
              </CardContent>
            </Card>
            <Card className="bg-accent text-accent-foreground">
              <CardContent className="p-4 text-center">
                <div className="w-full h-12 mb-2"></div>
                <p className="text-sm font-medium">Accent</p>
              </CardContent>
            </Card>
            <Card className="bg-destructive text-destructive-foreground">
              <CardContent className="p-4 text-center">
                <div className="w-full h-12 mb-2"></div>
                <p className="text-sm font-medium">Destructive</p>
              </CardContent>
            </Card>
            <Card className="bg-success text-success-foreground">
              <CardContent className="p-4 text-center">
                <div className="w-full h-12 mb-2"></div>
                <p className="text-sm font-medium">Success</p>
              </CardContent>
            </Card>
            <Card className="bg-fail text-fail-foreground">
              <CardContent className="p-4 text-center">
                <div className="w-full h-12 mb-2"></div>
                <p className="text-sm font-medium">Fail</p>
              </CardContent>
            </Card>
            <Card className="bg-muted text-muted-foreground">
              <CardContent className="p-4 text-center">
                <div className="w-full h-12 mb-2"></div>
                <p className="text-sm font-medium">Muted</p>
              </CardContent>
            </Card>
            <Card className="bg-chart-1 text-white">
              <CardContent className="p-4 text-center">
                <div className="w-full h-12 mb-2"></div>
                <p className="text-sm font-medium">Chart 1</p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Buttons */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-6">Buttons</h2>
          <h3 className="text-lg font-medium mb-4">버튼</h3>
          <div className="flex flex-wrap gap-4">
            <Button>기본값</Button>
            <Button variant="secondary">보조</Button>
            <Button variant="accent">강조</Button>
            <Button variant="destructive">위험</Button>
            <Button variant="outline">외곽선</Button>
            <Button variant="ghost">투명</Button>
            <Button variant="link">링크</Button>
            <Button size="sm">작게</Button>
            <Button size="lg">크게</Button>
            <Button size="icon">💖</Button>
          </div>
        </section>

        {/* Cards */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-6">Cards</h2>
          <h3 className="text-lg font-medium mb-4">카드</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>카드 제목</CardTitle>
                <CardDescription>흐릿한 텍스트로 된 카드 설명입니다.</CardDescription>
              </CardHeader>
              <CardContent>
                <p>카드 콘텐츠가 여기에 들어갑니다. 카드 배경과 텍스트 색상을 보여줍니다.</p>
              </CardContent>
            </Card>
            <Card className="bg-popover text-popover-foreground">
              <CardHeader>
                <CardTitle>팝오버 카드</CardTitle>
                <CardDescription>이 카드는 팝오버 색상을 사용합니다.</CardDescription>
              </CardHeader>
              <CardContent>
                <p>적절한 전경 텍스트가 있는 팝오버 배경입니다.</p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Form Elements */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-6">Form Elements</h2>
          <h3 className="text-lg font-medium mb-4">폼 요소</h3>
          <Card>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="test-input">입력 필드</Label>
                    <Input id="test-input" placeholder="텍스트를 입력하세요..." />
                  </div>
                  <div className="flex items-center gap-2">
                    <Checkbox id="test-checkbox" />
                    <Label htmlFor="test-checkbox">체크박스</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch id="test-switch" />
                    <Label htmlFor="test-switch">스위치</Label>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <Label>진행률</Label>
                    <Progress value={60} className="mt-2" />
                  </div>
                  <div>
                    <Label>아바타</Label>
                    <div className="flex gap-2 mt-2">
                      <Avatar>
                        <AvatarFallback>김</AvatarFallback>
                      </Avatar>
                      <Avatar>
                        <AvatarFallback>박</AvatarFallback>
                      </Avatar>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Navigation */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-6">Navigation</h2>
          <Card>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div>
                  <Label>Breadcrumb</Label>
                  <Breadcrumb className="mt-2">
                    <BreadcrumbList>
                      <BreadcrumbItem>
                        <BreadcrumbLink href="#">Home</BreadcrumbLink>
                      </BreadcrumbItem>
                      <BreadcrumbSeparator />
                      <BreadcrumbItem>
                        <BreadcrumbLink href="#">Components</BreadcrumbLink>
                      </BreadcrumbItem>
                      <BreadcrumbSeparator />
                      <BreadcrumbItem>
                        <BreadcrumbPage>UI Test</BreadcrumbPage>
                      </BreadcrumbItem>
                    </BreadcrumbList>
                  </Breadcrumb>
                </div>
                <div>
                  <Label>Tabs</Label>
                  <Tabs defaultValue="tab1" className="mt-2">
                    <TabsList>
                      <TabsTrigger value="tab1">Tab 1</TabsTrigger>
                      <TabsTrigger value="tab2">Tab 2</TabsTrigger>
                      <TabsTrigger value="tab3">Tab 3</TabsTrigger>
                    </TabsList>
                    <TabsContent value="tab1" className="mt-4">
                      <p>Content for tab 1</p>
                    </TabsContent>
                    <TabsContent value="tab2" className="mt-4">
                      <p>Content for tab 2</p>
                    </TabsContent>
                    <TabsContent value="tab3" className="mt-4">
                      <p>Content for tab 3</p>
                    </TabsContent>
                  </Tabs>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Table */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-6">Table</h2>
          <Card>
            <CardContent className="p-6">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Role</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell>John Doe</TableCell>
                    <TableCell>Active</TableCell>
                    <TableCell>Admin</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Jane Smith</TableCell>
                    <TableCell>Inactive</TableCell>
                    <TableCell>User</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </section>

        {/* Interactive Components */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-6">Interactive Components</h2>
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-wrap gap-4">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button>Open Dialog</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Dialog Title</DialogTitle>
                      <DialogDescription>
                        This is a dialog description showing how popover colors work.
                      </DialogDescription>
                    </DialogHeader>
                  </DialogContent>
                </Dialog>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline">Dropdown</Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuLabel>Menu Label</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>Item 1</DropdownMenuItem>
                    <DropdownMenuItem>Item 2</DropdownMenuItem>
                    <DropdownMenuItem variant="destructive">Delete</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                <ModeToggle />
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Skeleton & ScrollArea */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-6">Loading & Layout</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Skeleton</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Scroll Area</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-32 w-full rounded border p-4">
                  <div className="space-y-2">
                    {Array.from({ length: 20 }, (_, i) => (
                      <p key={i} className="text-sm">Scrollable item {i + 1}</p>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Calendar */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-6">Calendar</h2>
          <Card className="w-fit">
            <CardContent className="p-6">
              <Calendar mode="single" className="rounded-md border" />
            </CardContent>
          </Card>
        </section>

        {/* Chart Colors */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-6">Chart Colors</h2>
          <div className="grid grid-cols-5 gap-4">
            <Card className="bg-chart-1 text-white">
              <CardContent className="p-4 text-center">
                <div className="w-full h-12 mb-2"></div>
                <p className="text-sm font-medium">Chart 1</p>
              </CardContent>
            </Card>
            <Card className="bg-chart-2 text-white">
              <CardContent className="p-4 text-center">
                <div className="w-full h-12 mb-2"></div>
                <p className="text-sm font-medium">Chart 2</p>
              </CardContent>
            </Card>
            <Card className="bg-chart-3 text-white">
              <CardContent className="p-4 text-center">
                <div className="w-full h-12 mb-2"></div>
                <p className="text-sm font-medium">Chart 3</p>
              </CardContent>
            </Card>
            <Card className="bg-chart-4 text-white">
              <CardContent className="p-4 text-center">
                <div className="w-full h-12 mb-2"></div>
                <p className="text-sm font-medium">Chart 4</p>
              </CardContent>
            </Card>
            <Card className="bg-chart-5 text-black">
              <CardContent className="p-4 text-center">
                <div className="w-full h-12 mb-2"></div>
                <p className="text-sm font-medium">Chart 5</p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Sidebar Colors */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-6">Sidebar Colors</h2>
          <Card className="bg-sidebar text-sidebar-foreground border-sidebar-border">
            <CardHeader>
              <CardTitle>Sidebar Container</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="bg-sidebar-primary text-sidebar-primary-foreground p-3 rounded">
                Primary Sidebar Item
              </div>
              <div className="bg-sidebar-accent text-sidebar-accent-foreground p-3 rounded">
                Accent Sidebar Item
              </div>
              <div className="p-3 rounded border border-sidebar-border hover:bg-sidebar-accent/10">
                Regular Sidebar Item
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  )
}
