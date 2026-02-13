"use client";

import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { Question } from "@/types";
import Link from "next/link";
import { Bookmark, ChevronRight, AlertCircle, Tag } from "lucide-react";
import { useState, Suspense } from "react";
import dynamic from "next/dynamic";
import { Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const ReportIssueDialog = dynamic(() => import("./report-issue-dialog").then(mod => mod.ReportIssueDialog), {
  suspense: true,
});

interface QuestionCardProps {
  question: Question;
  onBookmarkToggle?: (questionId: string) => Promise<void> | void;
}

export function QuestionCard({ question, onBookmarkToggle }: QuestionCardProps) {
  const [isReportDialogOpen, setIsReportDialogOpen] = useState(false);

  const handleBookmarkClick = async () => {
    if (onBookmarkToggle) {
      await onBookmarkToggle(question.id);
    }
  };

  // Extraemos el texto de forma segura para usarlo en varios sitios
  const questionTextEn = question?.translations?.en?.questionText || "Question content not available";

  return (
    <>
      <Card className="overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col h-full">
        <CardHeader className="pb-3">
          <div className="flex flex-col gap-2">
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline" className="flex items-center gap-1">
                <Tag className="h-3 w-3" />
                {question.topic}
              </Badge>
              {question.subtopic && (
                <Badge variant="secondary">
                  {question.subtopic}
                </Badge>
              )}
            </div>
            <div className="flex justify-between items-start">
              <CardTitle className="text-lg leading-tight flex-grow mr-2">
                Question Details
              </CardTitle>
              <div className="text-right text-xs whitespace-nowrap shrink-0">
                <span className="block capitalize text-primary font-semibold">
                  Difficulty: {question.difficulty}
                </span>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pb-4 flex-grow relative">
          <p className="text-sm text-muted-foreground line-clamp-4 mb-8">
            {questionTextEn}
          </p>
          <div className="absolute bottom-3 right-3 flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              aria-label="Report issue"
              onClick={() => setIsReportDialogOpen(true)}
            >
              <AlertCircle className="h-5 w-5 text-muted-foreground hover:text-destructive" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8" 
              onClick={handleBookmarkClick}
            >
              <Bookmark className={`h-5 w-5 ${question.correctAnswerId ? "text-primary" : "text-muted-foreground"}`} />
            </Button>
          </div>
        </CardContent>
        <CardFooter className="bg-muted/50 p-3 mt-auto">
          <Button asChild variant="outline" size="sm" className="w-full">
            <Link href={`/questions/${question.id}`}>
              View Full Question <ChevronRight className="ml-1 h-4 w-4" />
            </Link>
          </Button>
        </CardFooter>
      </Card>
      
      {isReportDialogOpen && (
        <Suspense fallback={
          <div className="fixed inset-0 bg-background/50 flex items-center justify-center z-50">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        }>
          <ReportIssueDialog
            questionId={question.id}
            questionStem={questionTextEn}
            isOpen={isReportDialogOpen}
            onOpenChange={setIsReportDialogOpen}
          />
        </Suspense>
      )}
    </>
  );
}