
"use client";

import React from 'react';
import { Lesson, LessonContentItem, LessonContentType, QuizItem } from '@/data/ftc-java-lessons';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { ListChecks, Code2, FileText, Heading2Icon } from 'lucide-react';


const renderContentItem = (item: LessonContentItem, index: number) => {
  switch (item.type) {
    case LessonContentType.Heading:
      return (
        <h2 key={index} className="flex items-center gap-2 text-2xl md:text-3xl font-semibold font-headline text-primary mt-8 mb-4 border-b-2 border-primary/30 pb-3">
          <Heading2Icon size={28} className="text-primary/80" />
          {item.text}
        </h2>
      );
    case LessonContentType.Paragraph:
      return <p key={index} className="text-foreground/90 mb-5 leading-relaxed text-base md:text-lg" dangerouslySetInnerHTML={{ __html: item.text ?? '' }}></p>;
    case LessonContentType.Code:
      return (
        <div key={index} className="my-6 relative group">
          <div className="absolute -top-3 right-3 opacity-50 group-hover:opacity-100 transition-opacity duration-200">
            <Code2 size={20} className="text-accent" />
          </div>
          <pre className="bg-muted/60 backdrop-blur-sm text-foreground p-4 md:p-5 rounded-lg border border-border/30 overflow-x-auto text-sm shadow-inner">
            <code>{item.code}</code>
          </pre>
        </div>
      );
    case LessonContentType.List:
      return (
        <ul key={index} className="list-disc list-inside space-y-2 my-5 pl-5 text-foreground/90 text-base md:text-lg">
          {item.items?.map((li, i) => <li key={i} className="leading-relaxed" dangerouslySetInnerHTML={{ __html: li }}></li>)}
        </ul>
      );
    default:
      return null;
  }
};

interface LessonDisplayProps {
    lesson: Lesson;
}

const LessonDisplay: React.FC<LessonDisplayProps> = ({ lesson }) => {
  const lessonContentRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    // Reset scroll position when lesson changes
    if (lessonContentRef.current) {
      lessonContentRef.current.parentElement?.scrollTo(0,0);
    }
  }, [lesson]);
  
  return (
    <article ref={lessonContentRef} tabIndex={-1} className="outline-none animate-fadeInUpHeroCustom">
      <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold font-headline text-foreground mb-6 md:mb-8 pb-4 border-b-4 border-primary flex items-center gap-3">
        <FileText size={40} className="text-primary/90" />
        {lesson.title}
      </h1>
      
      {lesson.content.map(renderContentItem)}

      {lesson.quiz && lesson.quiz.length > 0 && (
        <div className="mt-12">
          <h2 className="flex items-center gap-2 text-2xl md:text-3xl font-semibold font-headline text-primary mt-12 mb-6 border-b-2 border-primary/30 pb-3">
            <ListChecks size={28} className="text-primary/80" />
            Knowledge Check
          </h2>
          <Accordion type="single" collapsible className="w-full space-y-3">
            {lesson.quiz.map((q, index) => (
              <AccordionItem key={index} value={`item-${index}`} className="bg-muted/30 border-border/50 rounded-lg">
                <AccordionTrigger className="hover:no-underline px-4 text-left font-semibold">{q.question}</AccordionTrigger>
                <AccordionContent className="px-4 pb-4 space-y-2">
                    <p className="text-foreground/90"><b>Answer:</b> {q.correctAnswer}</p>
                    <p className="text-foreground/70"><b>Explanation:</b> {q.explanation}</p>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      )}
      <style jsx>{`
        .animate-fadeInUpHeroCustom {
          animation: fadeInUpHeroCustom 0.8s ease-out forwards;
        }
        @keyframes fadeInUpHeroCustom {
          from {
              opacity: 0;
              transform: translateY(30px);
          }
          to {
              opacity: 1;
              transform: translateY(0);
          }
        }
      `}</style>
    </article>
  );
};

export default LessonDisplay;
