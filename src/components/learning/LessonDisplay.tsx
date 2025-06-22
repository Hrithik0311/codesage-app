
"use client";

import React, { useState } from 'react';
import { Lesson, LessonContentItem, LessonContentType, QuizItem } from '@/data/ftc-java-lessons';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { ListChecks, Code2, FileText, Heading2Icon, CheckCircle, XCircle, ArrowRight, RotateCw, Trophy } from 'lucide-react';
import { cn } from '@/lib/utils';


interface InteractiveQuizProps {
    quiz: QuizItem[];
    onComplete: (score: number, total: number) => void;
    onContinue: () => void;
}

const InteractiveQuiz: React.FC<InteractiveQuizProps> = ({ quiz, onComplete, onContinue }) => {
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
    const [showFeedback, setShowFeedback] = useState(false);
    const [score, setScore] = useState(0);
    const [quizFinished, setQuizFinished] = useState(false);

    const handleSelectAnswer = (option: string) => {
        if (showFeedback) return;

        setSelectedAnswer(option);
        setShowFeedback(true);
        if (option === quiz[currentQuestionIndex].correctAnswer) {
            setScore(prev => prev + 1);
        }
    };
    
    const handleContinue = () => {
        if (currentQuestionIndex < quiz.length - 1) {
            setCurrentQuestionIndex(prev => prev + 1);
            setShowFeedback(false);
            setSelectedAnswer(null);
        } else {
            setQuizFinished(true);
            onComplete(score, quiz.length);
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
        const isPass = percentage >= 80;
        return (
            <Card className={cn(
                "text-center p-6 md:p-8 border-2",
                isPass ? 'border-green-500/50 bg-green-500/10' : 'border-red-500/50 bg-red-500/10'
            )}>
                <CardHeader className="p-0 mb-4">
                    <Trophy className={cn("w-20 h-20 mx-auto mb-4", isPass ? "text-yellow-400" : "text-muted-foreground")} />
                    <CardTitle className="text-3xl font-headline">{isPass ? "Lesson Complete!" : "Keep Practicing!"}</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <p className="text-xl mb-2 text-foreground/90">You scored <span className="font-bold text-primary">{score}</span> out of <span className="font-bold text-primary">{quiz.length}</span></p>
                    <p className="text-4xl font-bold text-accent mb-6">{percentage}%</p>
                    <div className="flex justify-center gap-4">
                        <Button onClick={handleRestart} size="lg" variant="outline">
                            <RotateCw className="mr-2 h-4 w-4" />
                            Try Again
                        </Button>
                        <Button onClick={onContinue} size="lg" className="bg-gradient-to-r from-primary to-accent text-primary-foreground hover:opacity-90">
                            Continue <ArrowRight className="ml-2 h-5 w-5" />
                        </Button>
                    </div>
                </CardContent>
            </Card>
        );
    }
    
    if (currentQuestionIndex >= quiz.length) {
      // This is an invalid state, likely from a race condition on the continue button.
      // Instead of crashing, we gracefully end the quiz.
      if (!quizFinished) {
        // This will trigger a re-render to the finished state.
        setQuizFinished(true);
        onComplete(score, quiz.length);
      }
      // Return a temporary "calculating" view while the state updates.
      return (
        <Card className="text-center p-6 md:p-8">
            <CardContent className="p-0">
                <p className="text-lg">Calculating results...</p>
            </CardContent>
        </Card>
      );
    }

    const currentQuestion = quiz[currentQuestionIndex];
    const isCorrect = selectedAnswer === currentQuestion.correctAnswer;
    const progress = (currentQuestionIndex / quiz.length) * 100;
    
    return (
        <div className="w-full max-w-3xl mx-auto">
             <div className="flex items-center gap-4 mb-6">
                <Progress value={progress} className="h-4" indicatorClassName="bg-gradient-to-r from-green-400 to-green-600" />
                <span className="text-sm font-bold text-muted-foreground">{currentQuestionIndex + 1} / {quiz.length}</span>
            </div>
            <h3 className="font-semibold text-2xl text-center mb-8">{currentQuestion.question}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                {currentQuestion.options.map(option => {
                    const isSelected = selectedAnswer === option;
                    return (
                         <Button
                            key={option}
                            onClick={() => handleSelectAnswer(option)}
                            disabled={showFeedback}
                            variant="outline"
                            className={cn(
                                "w-full justify-center h-auto py-6 px-4 text-left text-lg font-semibold rounded-xl transition-all duration-200 transform hover:scale-[1.03] border-2 whitespace-normal",
                                "disabled:opacity-100 disabled:pointer-events-none",
                                showFeedback && option === currentQuestion.correctAnswer && "bg-green-600/20 border-green-500 text-foreground hover:bg-green-600/30",
                                showFeedback && isSelected && !isCorrect && "bg-red-600/20 border-red-500 text-foreground hover:bg-red-600/30 animate-shake",
                                showFeedback && !isSelected && "opacity-50",
                                !showFeedback && "hover:bg-accent/20 hover:border-accent"
                            )}
                        >
                            {option}
                        </Button>
                    );
                })}
            </div>

            {showFeedback && (
                <div className={cn("fixed bottom-0 left-0 right-0 p-6 z-[100] animate-slide-up-feedback",
                    isCorrect ? "bg-green-500/20" : "bg-red-500/20"
                )}>
                    <div className="container mx-auto">
                        <div className="flex justify-between items-center">
                            <div className="flex items-center gap-4">
                                {isCorrect ? <CheckCircle className="h-10 w-10 text-green-500"/> : <XCircle className="h-10 w-10 text-red-500"/>}
                                <div>
                                    <h4 className="text-xl font-bold">{isCorrect ? "Correct!" : "Not quite"}</h4>
                                    <p className="text-foreground/90">{currentQuestion.explanation}</p>
                                </div>
                            </div>
                            <Button onClick={handleContinue} className="w-48 py-7 text-lg font-semibold bg-gradient-to-r from-primary to-accent text-primary-foreground hover:opacity-90">
                                Continue <ArrowRight className="ml-2 h-5 w-5" />
                            </Button>
                        </div>
                    </div>
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
                @keyframes slide-up-feedback {
                    from { transform: translateY(100%); }
                    to { transform: translateY(0); }
                }
                .animate-slide-up-feedback {
                    animation: slide-up-feedback 0.3s ease-out forwards;
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
          {item.items?.map((li, i) => <li key={i} className="leading-relaxed">{li}</li>)}
        </ul>
      );
    default:
      return null;
  }
};

interface LessonDisplayProps {
    lesson: Lesson;
    onComplete: (score: number, total: number) => void;
    onContinue: () => void;
}

const LessonDisplay: React.FC<LessonDisplayProps> = ({ lesson, onComplete, onContinue }) => {
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
          <InteractiveQuiz quiz={lesson.quiz} onComplete={onComplete} onContinue={onContinue} />
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
