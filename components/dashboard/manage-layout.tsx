"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus } from "lucide-react";
import { SearchFilters, FilterOption } from "@/components/ui/search-filters";

interface CreateNewCardConfig {
  onClick: () => void;
  title: string;
  subtitle: string;
}

interface ManageLayoutProps {
  title: string;
  description: string;
  placeholder: string;
  searchValue: string;
  onSearchChange: (value: string) => void;
  filters: FilterOption[];
  loading: boolean;
  error: string | null;
  items: any[];
  renderItem: (item: any) => React.ReactNode;
  createNewCard?: CreateNewCardConfig;
  emptyTitle: string;
  emptyMessage: string;
  children?: React.ReactNode;
  singleFilter?: boolean;
}

export function ManageLayout({
  title,
  description,
  placeholder,
  searchValue,
  onSearchChange,
  filters,
  loading,
  error,
  items,
  renderItem,
  createNewCard,
  emptyTitle,
  emptyMessage,
  children,
  singleFilter = false,
}: ManageLayoutProps) {
  return (
    <>
      <div className="container mx-auto max-w-6xl">
        <Card className="bg-gradient-to-br from-card to-muted/20 mt-4">
          <CardHeader className="flex flex-row items-start justify-between gap-4">
            <div>
              <CardTitle className="text-xl">{title}</CardTitle>
              <CardDescription className="mt-1">{description}</CardDescription>
            </div>
            <SearchFilters
              placeholder={placeholder}
              searchValue={searchValue}
              onSearchChange={onSearchChange}
              filters={filters}
              className="flex-shrink-0 min-w-[300px] sm:min-w-[580px]"
              singleFilter={singleFilter}
            />
          </CardHeader>
          <CardContent>
            {loading && (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {[...Array(6)].map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <CardHeader>
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    </CardHeader>
                    <CardContent>
                      <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {error && (
              <Card className="mt-4">
                <CardContent className="pt-6">
                  <p className="text-red-500">{error}</p>
                </CardContent>
              </Card>
            )}

            {!loading && !error && (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {createNewCard && (
                  <Card
                    className="group overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all cursor-pointer border-dashed border-2"
                    onClick={createNewCard.onClick}
                  >
                    <CardContent className="flex flex-col items-center justify-center h-48">
                      <Plus className="h-12 w-12 text-muted-foreground mb-4" />
                      <h3 className="text-sm sm:text-base font-semibold leading-snug text-center">
                        {createNewCard.title}
                      </h3>
                      <p className="mt-1 text-xs sm:text-sm text-muted-foreground text-center">
                        {createNewCard.subtitle}
                      </p>
                    </CardContent>
                  </Card>
                )}
                {items.length === 0 ? (
                  <Card className="col-span-full">
                    <CardHeader>
                      <CardTitle>{emptyTitle}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground">{emptyMessage}</p>
                    </CardContent>
                  </Card>
                ) : (
                  items.map(renderItem)
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      {children}
    </>
  );
}
