
"use client";

import React from 'react';
import { Lesson, LessonContentItem, LessonContentType } from '@/data/ftc-java-lessons';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import Link from 'next/link';
import { Youtube, ListChecks, Code2, FileText, Heading2Icon } from 'lucide-react';

interface LessonDisplayProps {
  lesson: Lesson;
}

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
      return <p key={index} className="text-foreground/90 mb-5 leading-relaxed text-base md:text-lg">{item.text}</p>;
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
          {item.items?.map((li, i) => <li key={i} className="leading-relaxed">{li}</li>)}
        </ul>
      );
    case LessonContentType.YouTubeLink:
      return (
        <div key={index} className="my-6 p-4 md:p-5 bg-muted/40 backdrop-blur-sm rounded-lg shadow-md border border-border/20 hover:shadow-accent/10 transition-shadow duration-300">
          <div className="flex items-center gap-3 mb-2">
            <Youtube size={28} className="text-red-500" />
            {item.text && <p className="text-foreground/80 font-medium text-lg mb-0">{item.text}</p>}
          </div>
          <Link href={item.url || '#'} target="_blank" rel="noopener noreferrer" className="text-accent hover:text-accent/80 font-semibold underline text-base md:text-lg">
            {item.title || 'Watch on YouTube'}
          </Link>
        </div>
      );
    case LessonContentType.Iframe:
      return (
         <div key={index} className="my-8 shadow-xl rounded-lg overflow-hidden border border-border/30">
            {item.title && <h3 className="text-lg font-semibold p-3 bg-muted/30 text-foreground/80 border-b border-border/30">{item.title}</h3>}
            <iframe
                src={item.url}
                title={item.title || 'Lesson Video'}
                className="w-full aspect-video"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
            ></iframe>
        </div>
      );
    default:
      return null;
  }
};

const LessonDisplay: React.FC<LessonDisplayProps> = ({ lesson }) => {
  const lessonContentRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    // Ensure focus is managed if needed, but avoid overly aggressive focus stealing
    // If specific focus behavior is desired, it can be re-enabled here.
    // Example: document.getElementById('lesson-main-content')?.focus();
  }, [lesson]);
  
  return (
    <article ref={lessonContentRef} tabIndex={-1} className="outline-none animate-fadeInUpHeroCustom">
      <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold font-headline text-foreground mb-6 md:mb-8 pb-4 border-b-4 border-primary flex items-center gap-3">
        <FileText size={40} className="text-primary/90" />
        {lesson.title}
      </h1>
      
      {lesson.content.map(renderContentItem)}

      {lesson.quiz && lesson.quiz.length > 0 && (
        <>
          <h2 className="flex items-center gap-2 text-2xl md:text-3xl font-semibold font-headline text-primary mt-10 mb-5 border-b-2 border-primary/30 pb-3">
            <ListChecks size={28} className="text-primary/80" />
            Knowledge Check
          </h2>
          <Accordion type="single" collapsible className="w-full space-y-3">
            {lesson.quiz.map((quizItem, index) => (
              <AccordionItem 
                key={index} 
                value={`item-${index}`} 
                className="bg-muted/50 backdrop-blur-sm rounded-lg border border-border/30 shadow-md hover:border-accent/70 transition-colors duration-200"
              >
                <AccordionTrigger className="p-4 md:p-5 text-left font-semibold text-foreground hover:no-underline text-base md:text-lg">
                  {quizItem.question}
                </AccordionTrigger>
                <AccordionContent className="p-4 md:p-5 pt-0 text-foreground/80 text-base leading-relaxed">
                  <strong className="text-accent">Answer:</strong> {quizItem.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </>
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
