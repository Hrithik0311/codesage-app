
"use client";

import React, { useState, useEffect } from 'react';
import type { Lesson, QuizItem } from '@/data/ftc-java-lessons';
import { LessonContentType } from '@/data/ftc-java-lessons';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { ListChecks, Code2, FileText, Heading2 as Heading2Icon, CheckCircle, XCircle, Award } from 'lucide-react';


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

const InteractiveQuiz = ({ lesson, quiz, onComplete }: { lesson: Lesson; quiz: QuizItem[], onComplete: (rawScore: number, totalQuestions: number) => void }) => {
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
    const [isAnswered, setIsAnswered] = useState(false);
    const [score, setScore] = useState(0);
    const [quizCompleted, setQuizCompleted] = useState(false);

    useEffect(() => {
        // Reset quiz state when a new lesson's quiz is loaded
        setCurrentQuestionIndex(0);
        setSelectedAnswer(null);
        setIsAnswered(false);
        setScore(0);
        setQuizCompleted(false);
    }, [quiz]);

    const handleQuizFinish = () => {
        onComplete(score, quiz.length);
    };

    const handleTryAgain = () => {
        setQuizCompleted(false);
        setCurrentQuestionIndex(0);
        setScore(0);
        setSelectedAnswer(null);
        setIsAnswered(false);
    };

    if (quizCompleted) {
        const finalScore = score;
        const totalQuestions = quiz.length;
        const PASS_THRESHOLD = 2 / 3;

        let isPassed;
        let passMessage;
        if (lesson.type === 'test' && lesson.passingScore) {
            isPassed = finalScore >= lesson.passingScore;
            passMessage = `You need to score at least ${lesson.passingScore} to pass. Please try again.`
        } else {
            isPassed = (totalQuestions > 0 ? (finalScore / totalQuestions) >= PASS_THRESHOLD : true);
            passMessage = "You need to score at least 67% to pass. Please try again.";
        }

        return (
            <div className="text-center p-8 bg-muted/30 rounded-lg border border-border/50">
                <Award className={cn("mx-auto w-16 h-16 mb-4", isPassed ? "text-yellow-400" : "text-muted-foreground")} />
                <h3 className="text-2xl font-bold font-headline">Quiz Complete!</h3>
                <p className="text-lg mt-2">You scored {finalScore} out of {totalQuestions}.</p>
                {isPassed ? (
                    <p className="text-green-400 font-semibold mt-1">You passed!</p>
                ) : (
                    <p className="text-red-400 font-semibold mt-1">{passMessage}</p>
                )}

                <div className="mt-6 flex flex-col sm:flex-row justify-center gap-4">
                    <Button onClick={handleTryAgain} variant="outline">
                        Try Again
                    </Button>
                    <Button onClick={handleQuizFinish} disabled={lesson.isFinalTestForCourse && !isPassed} className="bg-gradient-to-r from-primary to-accent text-primary-foreground hover:opacity-90">
                        Continue
                    </Button>
                </div>
            </div>
        );
    }
    
    const currentQuestion = quiz[currentQuestionIndex];
    if (!currentQuestion) {
        if (!quizCompleted) setQuizCompleted(true);
        return null;
    }

    const progress = ((currentQuestionIndex) / quiz.length) * 100;
    const isCorrect = selectedAnswer === currentQuestion.correctAnswer;

    const handleSelectAnswer = (option: string) => {
        if (isAnswered) return;
        setSelectedAnswer(option);
        setIsAnswered(true);
        if (option === currentQuestion.correctAnswer) {
            setScore(prev => prev + 1);
        }
    };

    const handleContinue = () => {
        if (currentQuestionIndex < quiz.length - 1) {
            setCurrentQuestionIndex(prev => prev + 1);
            setSelectedAnswer(null);
            setIsAnswered(false);
        } else {
            setQuizCompleted(true);
        }
    };
    
    const getButtonClass = (option: string) => {
        if (!isAnswered) {
            return "bg-muted/50 border-border/50 hover:bg-muted";
        }
        if (option === currentQuestion.correctAnswer) {
            return "bg-green-500/20 border-green-500 text-green-300 ring-2 ring-green-500";
        }
        if (option === selectedAnswer) {
            return "bg-red-500/20 border-red-500 text-red-300";
        }
        return "bg-muted/30 border-transparent opacity-60";
    };

    return (
        <div className="mt-12">
          <h2 className="flex items-center gap-2 text-2xl md:text-3xl font-semibold font-headline text-primary mt-12 mb-6 border-b-2 border-primary/30 pb-3">
            <ListChecks size={28} className="text-primary/80" />
            Knowledge Check
          </h2>
          <div className="space-y-6 bg-card/50 p-6 rounded-lg border border-border/40">
            <Progress value={progress} indicatorClassName="bg-primary" />
            <p className="text-xl font-semibold text-foreground/90 text-center">
              {currentQuestion.question}
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {currentQuestion.options.map((option, index) => (
                <Button
                  key={index}
                  onClick={() => handleSelectAnswer(option)}
                  disabled={isAnswered}
                  variant="outline"
                  className={cn("h-auto min-h-[4rem] py-3 px-4 justify-start text-left whitespace-normal font-medium text-base transition-all duration-200 ease-in-out border-2", getButtonClass(option))}
                >
                  <div className="flex-grow">{option}</div>
                </Button>
              ))}
            </div>
            {isAnswered && (
              <div className={cn("p-4 rounded-lg text-white transition-all duration-300 animate-fade-in-up-hero", isCorrect ? 'bg-green-600/80' : 'bg-red-600/80')}>
                <div className="flex items-start gap-3">
                    {isCorrect ? <CheckCircle className="h-6 w-6 mt-1 flex-shrink-0" /> : <XCircle className="h-6 w-6 mt-1 flex-shrink-0" />}
                    <div>
                        <h4 className="font-bold text-lg">{isCorrect ? 'Correct!' : 'Incorrect'}</h4>
                        <p className="mt-1 text-white/90">{currentQuestion.explanation}</p>
                    </div>
                </div>
              </div>
            )}
            {isAnswered && (
                <div className="flex justify-end">
                    <Button onClick={handleContinue} className="w-full md:w-auto bg-gradient-to-r from-primary to-accent text-primary-foreground hover:opacity-90">
                        {currentQuestionIndex < quiz.length - 1 ? 'Next Question' : 'Finish Quiz'}
                    </Button>
                </div>
            )}
          </div>
        </div>
    );
};


interface LessonDisplayProps {
    lesson: Lesson;
    onLessonComplete: (lessonId: string, rawScore: number, totalQuestions: number) => void;
    isPassed: boolean;
}

const LessonDisplay: React.FC<LessonDisplayProps> = ({ lesson, onLessonComplete, isPassed }) => {
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

      {lesson.quiz && lesson.quiz.length > 0 ? (
        <InteractiveQuiz lesson={lesson} quiz={lesson.quiz} onComplete={(rawScore, total) => onLessonComplete(lesson.id, rawScore, total)} />
      ) : !isPassed ? (
         <div className="mt-12 text-center">
            <Button onClick={() => onLessonComplete(lesson.id, 1, 1)} size="lg" className="bg-gradient-to-r from-primary to-accent text-primary-foreground hover:opacity-90">
                <CheckCircle className="mr-2 h-5 w-5" />
                Mark as Complete
            </Button>
        </div>
      ) : null}

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
