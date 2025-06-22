
"use client";

import React, { useState } from 'react';
import { Lesson, LessonContentItem, LessonContentType, QuizItem } from '@/data/ftc-java-lessons';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ListChecks, Code2, FileText, Heading2Icon, CheckCircle, XCircle, ArrowRight, RotateCw, Trophy } from 'lucide-react';
import { cn } from '@/lib/utils';


const InteractiveQuiz: React.FC<{ quiz: QuizItem[] }> = ({ quiz }) => {
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
    const [showFeedback, setShowFeedback] = useState(false);
    const [score, setScore] = useState(0);
    const [quizFinished, setQuizFinished] = useState(false);

    const currentQuestion = quiz[currentQuestionIndex];
    const isCorrect = selectedAnswer === currentQuestion.correctAnswer;

    const handleSelectAnswer = (option: string) => {
        if (showFeedback) return;

        setSelectedAnswer(option);
        setShowFeedback(true);
        if (option === currentQuestion.correctAnswer) {
            setScore(prev => prev + 1);
        }
    };
    
    const handleContinue = () => {
        setShowFeedback(false);
        setSelectedAnswer(null);

        if (currentQuestionIndex < quiz.length - 1) {
            setCurrentQuestionIndex(prev => prev + 1);
        } else {
            setQuizFinished(true);
        }
    };

    const handleRestart = () => {
        setCurrentQuestionIndex(0);
        setSelectedAnswer(null);
        setShowFeedback(false);
        setScore(0);
        setQuizFinished(false);
    };

    if (quizFinished) {
        const percentage = Math.round((score / quiz.length) * 100);
        return (
            <Card className="bg-muted/50 text-center p-6">
                <CardHeader className="p-0 mb-4">
                    <Trophy className="text-yellow-400 w-16 h-16 mx-auto mb-4" />
                    <CardTitle className="text-3xl font-headline">Quiz Complete!</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <p className="text-xl mb-2 text-foreground/90">You scored <span className="font-bold text-primary">{score}</span> out of <span className="font-bold text-primary">{quiz.length}</span></p>
                    <p className="text-3xl font-bold text-accent mb-6">{percentage}%</p>
                    <Button onClick={handleRestart} size="lg">
                        <RotateCw className="mr-2 h-4 w-4" />
                        Try Again
                    </Button>
                </CardContent>
            </Card>
        );
    }
    
    return (
        <div className="w-full max-w-2xl mx-auto">
            <p className="text-sm text-muted-foreground mb-2 text-center">Question {currentQuestionIndex + 1} of {quiz.length}</p>
            <h3 className="font-semibold text-xl text-center mb-6">{currentQuestion.question}</h3>
            <div className="space-y-3 mb-6">
                {currentQuestion.options.map(option => {
                    const isSelected = selectedAnswer === option;
                    return (
                         <Button
                            key={option}
                            onClick={() => handleSelectAnswer(option)}
                            disabled={showFeedback}
                            variant="outline"
                            className={cn(
                                "w-full justify-start h-auto py-3 px-4 text-left text-base font-medium rounded-lg transition-all duration-200 transform hover:scale-[1.02]",
                                "disabled:opacity-100 disabled:pointer-events-none",
                                showFeedback && option === currentQuestion.correctAnswer && "bg-green-600/20 border-green-500 text-foreground hover:bg-green-600/30",
                                showFeedback && isSelected && !isCorrect && "bg-red-600/20 border-red-500 text-foreground hover:bg-red-600/30 animate-shake",
                                showFeedback && !isSelected && "opacity-60",
                                !showFeedback && "hover:bg-accent/20 hover:border-accent"
                            )}
                        >
                             {showFeedback && option === currentQuestion.correctAnswer && <CheckCircle className="mr-3 h-5 w-5 text-green-500" />}
                             {showFeedback && isSelected && !isCorrect && <XCircle className="mr-3 h-5 w-5 text-red-500" />}
                            {option}
                        </Button>
                    );
                })}
            </div>

            {showFeedback && (
                <div className="animate-fade-in-up-hero">
                    <Card className={cn("p-4 mt-6", isCorrect ? "bg-green-500/10 border-green-500/30" : "bg-red-500/10 border-red-500/30")}>
                        <CardHeader className="p-0 pb-2 flex-row items-center gap-2">
                            {isCorrect ? <CheckCircle className="h-6 w-6 text-green-500"/> : <XCircle className="h-6 w-6 text-red-500"/>}
                            <CardTitle className="text-xl">{isCorrect ? "Correct!" : "Not quite"}</CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                           <p className="text-foreground/90 text-base">{currentQuestion.explanation}</p>
                        </CardContent>
                    </Card>
                    <Button onClick={handleContinue} className="w-full mt-4 py-6 text-lg font-semibold bg-gradient-to-r from-primary to-accent text-primary-foreground hover:opacity-90">
                       Continue <ArrowRight className="ml-2 h-5 w-5" />
                   </Button>
                </div>
            )}
            <style jsx>{`
                @keyframes shake {
                    0%, 100% { transform: translateX(0); }
                    25% { transform: translateX(-5px); }
                    75% { transform: translateX(5px); }
                }
                .animate-shake {
                    animation: shake 0.3s ease-in-out;
                }
            `}</style>
        </div>
    );
};


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
    default:
      return null;
  }
};

const LessonDisplay: React.FC<{ lesson: Lesson }> = ({ lesson }) => {
  const lessonContentRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
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
          <h2 className="flex items-center gap-2 text-2xl md:text-3xl font-semibold font-headline text-primary mt-12 mb-6 border-b-2 border-primary/30 pb-3">
            <ListChecks size={28} className="text-primary/80" />
            Knowledge Check
          </h2>
          <InteractiveQuiz quiz={lesson.quiz} />
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
