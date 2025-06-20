
"use client";

import React from 'react';
import { Lesson, LessonContentItem, LessonContentType, QuizItem } from '@/data/ftc-java-lessons';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import Link from 'next/link';

interface LessonDisplayProps {
  lesson: Lesson;
}

const renderContentItem = (item: LessonContentItem, index: number) => {
  switch (item.type) {
    case LessonContentType.Heading:
      return <h2 key={index} className="text-2xl font-semibold font-headline text-primary mt-6 mb-3 border-b-2 border-primary/50 pb-2">{item.text}</h2>;
    case LessonContentType.Paragraph:
      return <p key={index} className="text-foreground/90 mb-4 leading-relaxed">{item.text}</p>;
    case LessonContentType.Code:
      return (
        <pre key={index} className="bg-muted/50 text-foreground p-4 rounded-md overflow-x-auto my-4 text-sm shadow">
          <code>{item.code}</code>
        </pre>
      );
    case LessonContentType.List:
      return (
        <ul key={index} className="list-disc list-inside space-y-1 my-4 pl-4 text-foreground/90">
          {item.items?.map((li, i) => <li key={i}>{li}</li>)}
        </ul>
      );
    case LessonContentType.YouTubeLink:
      return (
        <div key={index} className="my-4 p-4 bg-muted/30 rounded-lg shadow">
          {item.text && <p className="text-foreground/80 mb-2">{item.text}</p>}
          <Link href={item.url || '#'} target="_blank" rel="noopener noreferrer" className="text-accent hover:text-accent/80 font-semibold underline">
            {item.title || 'Watch on YouTube'}
          </Link>
        </div>
      );
    case LessonContentType.Iframe:
      return (
         <div key={index} className="my-6 shadow-xl rounded-lg overflow-hidden">
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
    if (lessonContentRef.current) {
      lessonContentRef.current.focus();
    }
  }, [lesson]);
  
  return (
    <article ref={lessonContentRef} tabIndex={-1} className="outline-none">
      <h1 className="text-3xl md:text-4xl font-bold font-headline text-foreground mb-6 pb-3 border-b-4 border-primary">
        {lesson.title}
      </h1>
      
      {lesson.content.map(renderContentItem)}

      {lesson.quiz && lesson.quiz.length > 0 && (
        <>
          <h2 className="text-2xl font-semibold font-headline text-primary mt-8 mb-4 border-b-2 border-primary/50 pb-2">Quiz</h2>
          <Accordion type="single" collapsible className="w-full space-y-2">
            {lesson.quiz.map((quizItem, index) => (
              <AccordionItem key={index} value={`item-${index}`} className="bg-muted/30 rounded-md border-border/30 shadow-sm">
                <AccordionTrigger className="p-4 text-left font-medium text-foreground hover:no-underline">
                  {quizItem.question}
                </AccordionTrigger>
                <AccordionContent className="p-4 pt-0 text-foreground/80">
                  {quizItem.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </>
      )}
    </article>
  );
};

export default LessonDisplay;
