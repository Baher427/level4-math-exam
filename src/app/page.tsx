"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  Calculator, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  Trophy,
  RefreshCcw,
  Play,
  Sparkles,
  ChevronRight,
  ChevronLeft
} from "lucide-react";

// بيانات الامتحان
const multiplicationProblems = [
  { num1: 49, num2: 6 },
  { num1: 56, num2: 6 },
  { num1: 44, num2: 5 },
  { num1: 13, num2: 5 },
  { num1: 99, num2: 3 },
  { num1: 60, num2: 2 },
  { num1: 84, num2: 2 },
  { num1: 67, num2: 4 },
  { num1: 95, num2: 2 },
  { num1: 86, num2: 5 },
];

const abacusColumns1 = [
  { id: 1, numbers: [46, 90, -17, 58, 23, -93, 63] },
  { id: 2, numbers: [96, 80, -42, 54, 70, -23, 67] },
  { id: 3, numbers: [35, 89, 46, 90, 27, 51, 67] },
  { id: 4, numbers: [80, -2, 14, -49, 31, 76, 5] },
  { id: 5, numbers: [5, 67, -32, 40, -9, 81, -16] },
];

const abacusColumns2 = [
  { id: 6, numbers: [629, 348, 907, -615] },
  { id: 7, numbers: [462, 705, 193, 528] },
  { id: 8, numbers: [842, 356, -709, 512] },
  { id: 9, numbers: [951, 260, -347, 176] },
  { id: 10, numbers: [954, 697, 305, 821] },
];

const mentalColumns = [
  { id: 1, numbers: [3, 9, -8, 7, 5, -6, 4] },
  { id: 2, numbers: [9, 8, 3, 6, 5, 7, 1] },
  { id: 3, numbers: [4, 3, -6, 9, 5, 2, -4] },
  { id: 4, numbers: [7, 1, 8, 3, 2, 6, 5] },
  { id: 5, numbers: [3, 2, 7, -4, 6, 9, -8] },
  { id: 6, numbers: [5, 1, 8, 9, 2, 7, -6] },
  { id: 7, numbers: [8, 8, -3, 2, 4, -5, 7] },
  { id: 8, numbers: [6, 4, 2, 5, 1, 8, 3] },
  { id: 9, numbers: [1, 2, 3, 6, 4, 7, 5] },
  { id: 10, numbers: [9, 1, -4, 6, 3, 7, -5] },
];

const additionalColumns = [
  { id: 1, numbers: [11, 21, 13] },
  { id: 2, numbers: [16, 28, 11] },
  { id: 3, numbers: [62, 29, 76] },
  { id: 4, numbers: [43, 30, 70] },
  { id: 5, numbers: [21, 40, 62] },
  { id: 6, numbers: [49, -33, 42] },
  { id: 7, numbers: [55, 23, -42] },
  { id: 8, numbers: [72, -41, 51] },
  { id: 9, numbers: [42, 14, -35] },
  { id: 10, numbers: [54, 11, -13] },
];

const calculateCorrectAnswer = (numbers: number[]): number => {
  return numbers.reduce((sum, num) => sum + num, 0);
};

// مكون حقل الإدخال الرقمي
function NumberInput({ 
  value, 
  onChange,
  onKeyDown,
  size = "normal",
  autoFocus = true
}: { 
  value: string; 
  onChange: (value: string) => void;
  onKeyDown?: (e: React.KeyboardEvent) => void;
  size?: "small" | "normal" | "large";
  autoFocus?: boolean;
}) {
  const sizeClasses = {
    small: "w-16 h-10 text-base",
    normal: "w-20 h-12 text-lg",
    large: "w-24 h-14 text-xl"
  };

  return (
    <Input
      type="text"
      inputMode="numeric"
      pattern="[0-9\-]*"
      value={value}
      onChange={(e) => {
        const val = e.target.value;
        if (/^-?\d*$/.test(val)) {
          onChange(val);
        }
      }}
      onKeyDown={onKeyDown}
      className={`${sizeClasses[size]} text-center font-bold border-2 border-emerald-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200`}
      placeholder="؟"
      autoComplete="off"
      autoFocus={autoFocus}
    />
  );
}

export default function ExamPage() {
  const [examStarted, setExamStarted] = useState(false);
  const [examFinished, setExamFinished] = useState(false);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [activeSection, setActiveSection] = useState(0);
  const [activeQuestion, setActiveQuestion] = useState(0);

  // الإجابات
  const [multiplicationAnswers, setMultiplicationAnswers] = useState<string[]>(Array(10).fill(""));
  const [abacusAnswers1, setAbacusAnswers1] = useState<string[]>(Array(5).fill(""));
  const [abacusAnswers2, setAbacusAnswers2] = useState<string[]>(Array(5).fill(""));
  const [mentalAnswers, setMentalAnswers] = useState<string[]>(Array(10).fill(""));
  const [additionalAnswers, setAdditionalAnswers] = useState<string[]>(Array(10).fill(""));

  // النتائج
  const [results, setResults] = useState<{
    multiplication: boolean[];
    abacus1: boolean[];
    abacus2: boolean[];
    mental: boolean[];
    additional: boolean[];
  } | null>(null);

  const sections = [
    { name: "الضرب", icon: "✖️", questions: 10 },
    { name: "Abacus 1", icon: "🧮", questions: 5 },
    { name: "Abacus 2", icon: "🧮", questions: 5 },
    { name: "Mental", icon: "🧠", questions: 10 },
    { name: "إضافي", icon: "📝", questions: 10 },
  ];

  const getTotalQuestions = () => sections.reduce((sum, s) => sum + s.questions, 0);
  
  const getCurrentQuestionNumber = () => {
    let total = 0;
    for (let i = 0; i < activeSection; i++) {
      total += sections[i].questions;
    }
    return total + activeQuestion + 1;
  };

  const isLastQuestion = () => getCurrentQuestionNumber() === getTotalQuestions();

  const navigateNext = () => {
    if (activeQuestion < sections[activeSection].questions - 1) {
      setActiveQuestion(activeQuestion + 1);
    } else if (activeSection < sections.length - 1) {
      setActiveSection(activeSection + 1);
      setActiveQuestion(0);
    }
  };

  const navigatePrev = () => {
    if (activeQuestion > 0) {
      setActiveQuestion(activeQuestion - 1);
    } else if (activeSection > 0) {
      setActiveSection(activeSection - 1);
      setActiveQuestion(sections[activeSection - 1].questions - 1);
    }
  };

  // المؤقت التصاعدي
  useEffect(() => {
    if (!examStarted || examFinished) return;
    const timer = setInterval(() => {
      setTimeElapsed((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [examStarted, examFinished]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleFinishExam = useCallback(() => {
    const multiplicationResults = multiplicationProblems.map((p, i) => {
      const correct = p.num1 * p.num2;
      return parseInt(multiplicationAnswers[i]) === correct;
    });

    const abacusResults1 = abacusColumns1.map((col, i) => {
      const correct = calculateCorrectAnswer(col.numbers);
      return parseInt(abacusAnswers1[i]) === correct;
    });

    const abacusResults2 = abacusColumns2.map((col, i) => {
      const correct = calculateCorrectAnswer(col.numbers);
      return parseInt(abacusAnswers2[i]) === correct;
    });

    const mentalResults = mentalColumns.map((col, i) => {
      const correct = calculateCorrectAnswer(col.numbers);
      return parseInt(mentalAnswers[i]) === correct;
    });

    const additionalResults = additionalColumns.map((col, i) => {
      const correct = calculateCorrectAnswer(col.numbers);
      return parseInt(additionalAnswers[i]) === correct;
    });

    setResults({
      multiplication: multiplicationResults,
      abacus1: abacusResults1,
      abacus2: abacusResults2,
      mental: mentalResults,
      additional: additionalResults,
    });

    setExamFinished(true);
  }, [multiplicationAnswers, abacusAnswers1, abacusAnswers2, mentalAnswers, additionalAnswers]);

  // معالجة ضغط Enter
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (isLastQuestion()) {
        handleFinishExam();
      } else {
        navigateNext();
      }
    }
  };

  const calculateScore = () => {
    if (!results) return { correct: 0, total: 0, percentage: 0 };
    const allResults = [
      ...results.multiplication,
      ...results.abacus1,
      ...results.abacus2,
      ...results.mental,
      ...results.additional,
    ];
    const correct = allResults.filter(Boolean).length;
    const total = allResults.length;
    const percentage = Math.round((correct / total) * 100);
    return { correct, total, percentage };
  };

  const resetExam = () => {
    setExamStarted(false);
    setExamFinished(false);
    setTimeElapsed(0);
    setMultiplicationAnswers(Array(10).fill(""));
    setAbacusAnswers1(Array(5).fill(""));
    setAbacusAnswers2(Array(5).fill(""));
    setMentalAnswers(Array(10).fill(""));
    setAdditionalAnswers(Array(10).fill(""));
    setResults(null);
    setActiveSection(0);
    setActiveQuestion(0);
  };

  // صفحة البداية
  if (!examStarted) {
    return (
      <div className="h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 flex items-center justify-center p-4 overflow-hidden">
        <Card className="w-full max-w-md shadow-2xl border-0 overflow-hidden">
          <div className="bg-gradient-to-r from-emerald-600 to-teal-600 p-6 text-center text-white">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Calculator className="w-8 h-8" />
            </div>
            <h1 className="text-2xl font-bold mb-2">امتحان المستوى الرابع</h1>
            <p className="text-emerald-100 text-sm">Final Exam - Level 4</p>
          </div>
          <CardContent className="p-6">
            <div className="space-y-3 mb-6">
              <div className="flex items-center gap-3 p-3 bg-emerald-50 rounded-lg">
                <Clock className="w-5 h-5 text-emerald-600 shrink-0" />
                <span className="text-gray-700 text-sm">الوقت: <strong>مفتوح</strong></span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-teal-50 rounded-lg">
                <Sparkles className="w-5 h-5 text-teal-600 shrink-0" />
                <span className="text-gray-700 text-sm">عدد الأسئلة: <strong>40 سؤال</strong></span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-cyan-50 rounded-lg">
                <Trophy className="w-5 h-5 text-cyan-600 shrink-0" />
                <span className="text-gray-700 text-sm">الأقسام: <strong>5 أقسام</strong></span>
              </div>
            </div>

            <div className="space-y-2 mb-6">
              <h3 className="font-semibold text-gray-700 mb-2 text-sm">أقسام الامتحان:</h3>
              {sections.map((section, i) => (
                <div key={i} className="flex items-center gap-2 text-gray-600 text-sm">
                  <span>{section.icon}</span>
                  <span>{section.name}</span>
                  <Badge variant="outline" className="text-xs">{section.questions} أسئلة</Badge>
                </div>
              ))}
            </div>

            <Button
              onClick={() => setExamStarted(true)}
              className="w-full h-12 text-base bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 shadow-lg"
            >
              <Play className="w-5 h-5 mr-2" />
              ابدأ الامتحان
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // صفحة النتائج
  if (examFinished && results) {
    const score = calculateScore();

    return (
      <div className="h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 p-4 overflow-auto">
        <div className="max-w-4xl mx-auto">
          <Card className="shadow-2xl border-0 overflow-hidden">
            <div className={`p-6 text-center text-white ${
              score.percentage >= 80 
                ? "bg-gradient-to-r from-emerald-600 to-teal-600" 
                : score.percentage >= 60 
                  ? "bg-gradient-to-r from-amber-500 to-orange-500"
                  : "bg-gradient-to-r from-rose-500 to-red-500"
            }`}>
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                {score.percentage >= 80 ? (
                  <Trophy className="w-8 h-8" />
                ) : score.percentage >= 60 ? (
                  <Sparkles className="w-8 h-8" />
                ) : (
                  <XCircle className="w-8 h-8" />
                )}
              </div>
              <h1 className="text-2xl font-bold mb-2">انتهى الامتحان!</h1>
              <p className="text-white/80 text-sm">نتيجتك النهائية</p>
              <div className="mt-3 flex items-center justify-center gap-2 text-white/90">
                <Clock className="w-4 h-4" />
                <span className="text-sm">الوقت المستغرق: {formatTime(timeElapsed)}</span>
              </div>
            </div>
            <CardContent className="p-6">
              <div className="text-center mb-6">
                <div className="text-5xl font-bold text-emerald-600 mb-2">{score.percentage}%</div>
                <div className="text-lg text-gray-600">
                  {score.correct} من {score.total} إجابة صحيحة
                </div>
                <Progress value={score.percentage} className="h-2 mt-4" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
                <ResultSection 
                  title="قسم الضرب" 
                  results={results.multiplication} 
                  correctAnswers={multiplicationProblems.map(p => p.num1 * p.num2)}
                  userAnswers={multiplicationAnswers}
                />
                <ResultSection 
                  title="Abacus (1-5)" 
                  results={results.abacus1} 
                  correctAnswers={abacusColumns1.map(col => calculateCorrectAnswer(col.numbers))}
                  userAnswers={abacusAnswers1}
                />
                <ResultSection 
                  title="Abacus (6-10)" 
                  results={results.abacus2} 
                  correctAnswers={abacusColumns2.map(col => calculateCorrectAnswer(col.numbers))}
                  userAnswers={abacusAnswers2}
                />
                <ResultSection 
                  title="الحساب الذهني" 
                  results={results.mental} 
                  correctAnswers={mentalColumns.map(col => calculateCorrectAnswer(col.numbers))}
                  userAnswers={mentalAnswers}
                />
                <ResultSection 
                  title="القسم الإضافي" 
                  results={results.additional} 
                  correctAnswers={additionalColumns.map(col => calculateCorrectAnswer(col.numbers))}
                  userAnswers={additionalAnswers}
                  className="sm:col-span-2"
                />
              </div>

              <Button
                onClick={resetExam}
                className="w-full h-12 text-base bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700"
              >
                <RefreshCcw className="w-5 h-5 mr-2" />
                إعادة الامتحان
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // صفحة الامتحان - سؤال واحد في كل مرة
  return (
    <div className="h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 flex flex-col overflow-hidden">
      {/* الهيدر */}
      <header className="bg-white/90 backdrop-blur-sm shadow-sm shrink-0 px-4 py-2">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Calculator className="w-5 h-5 text-emerald-600" />
              <div>
                <h1 className="font-bold text-gray-800 text-sm">{sections[activeSection].icon} {sections[activeSection].name}</h1>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-emerald-100 text-emerald-600">
                <Clock className="w-3 h-3" />
                <span className="font-mono font-bold text-xs">{formatTime(timeElapsed)}</span>
              </div>
              <Button 
                onClick={handleFinishExam}
                variant="ghost"
                className="text-gray-500 hover:text-gray-700 h-7 px-2 text-xs"
              >
                إنهاء
              </Button>
            </div>
          </div>
          
          {/* شريط التقدم */}
          <div className="mt-2">
            <Progress 
              value={(getCurrentQuestionNumber() / getTotalQuestions()) * 100} 
              className="h-1.5"
            />
            <p className="text-xs text-gray-400 mt-1 text-center">
              {getCurrentQuestionNumber()} / {getTotalQuestions()}
            </p>
          </div>
        </div>
      </header>

      {/* محتوى السؤال - يملأ الشاشة */}
      <main className="flex-1 flex items-center justify-center p-4 overflow-hidden">
        <Card className="w-full max-w-md shadow-xl border-0">
          <CardHeader className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-t-lg py-3">
            <CardTitle className="flex items-center justify-center gap-2 text-base">
              <Badge className="bg-white/20 text-white text-sm px-3 py-0.5">
                سؤال {activeQuestion + 1}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            {/* قسم الضرب */}
            {activeSection === 0 && (
              <MultiplicationQuestion
                problem={multiplicationProblems[activeQuestion]}
                answer={multiplicationAnswers[activeQuestion]}
                onAnswer={(val) => {
                  const newAnswers = [...multiplicationAnswers];
                  newAnswers[activeQuestion] = val;
                  setMultiplicationAnswers(newAnswers);
                }}
                onKeyDown={handleKeyDown}
              />
            )}

            {/* قسم Abacus 1 */}
            {activeSection === 1 && (
              <AbacusQuestion
                column={abacusColumns1[activeQuestion]}
                answer={abacusAnswers1[activeQuestion]}
                onAnswer={(val) => {
                  const newAnswers = [...abacusAnswers1];
                  newAnswers[activeQuestion] = val;
                  setAbacusAnswers1(newAnswers);
                }}
                onKeyDown={handleKeyDown}
              />
            )}

            {/* قسم Abacus 2 */}
            {activeSection === 2 && (
              <AbacusQuestion
                column={abacusColumns2[activeQuestion]}
                answer={abacusAnswers2[activeQuestion]}
                onAnswer={(val) => {
                  const newAnswers = [...abacusAnswers2];
                  newAnswers[activeQuestion] = val;
                  setAbacusAnswers2(newAnswers);
                }}
                onKeyDown={handleKeyDown}
              />
            )}

            {/* قسم Mental */}
            {activeSection === 3 && (
              <MentalQuestion
                column={mentalColumns[activeQuestion]}
                answer={mentalAnswers[activeQuestion]}
                onAnswer={(val) => {
                  const newAnswers = [...mentalAnswers];
                  newAnswers[activeQuestion] = val;
                  setMentalAnswers(newAnswers);
                }}
                onKeyDown={handleKeyDown}
              />
            )}

            {/* قسم إضافي */}
            {activeSection === 4 && (
              <MentalQuestion
                column={additionalColumns[activeQuestion]}
                answer={additionalAnswers[activeQuestion]}
                onAnswer={(val) => {
                  const newAnswers = [...additionalAnswers];
                  newAnswers[activeQuestion] = val;
                  setAdditionalAnswers(newAnswers);
                }}
                onKeyDown={handleKeyDown}
              />
            )}
          </CardContent>
        </Card>
      </main>

      {/* شريط التنقل السفلي */}
      <footer className="bg-white/90 backdrop-blur-sm border-t shrink-0 px-4 py-2">
        <div className="max-w-md mx-auto">
          <div className="flex justify-between items-center gap-3">
            <Button
              variant="outline"
              onClick={navigatePrev}
              disabled={activeSection === 0 && activeQuestion === 0}
              className="h-11 px-4 text-sm flex-1"
            >
              <ChevronRight className="w-4 h-4 ml-1" />
              السابق
            </Button>
            
            {isLastQuestion() ? (
              <Button
                onClick={handleFinishExam}
                className="bg-emerald-600 hover:bg-emerald-700 h-11 px-4 text-sm flex-1"
              >
                <CheckCircle2 className="w-4 h-4 mr-1" />
                إنهاء الامتحان
              </Button>
            ) : (
              <Button
                onClick={navigateNext}
                className="bg-emerald-600 hover:bg-emerald-700 h-11 px-4 text-sm flex-1"
              >
                التالي
                <ChevronLeft className="w-4 h-4 mr-1" />
              </Button>
            )}
          </div>
          
          {/* نقاط التنقل */}
          <div className="flex justify-center gap-1 mt-2 flex-wrap">
            {Array.from({ length: getTotalQuestions() }).map((_, i) => {
              const currentGlobal = getCurrentQuestionNumber() - 1;
              return (
                <button
                  key={i}
                  onClick={() => {
                    let section = 0;
                    let question = i;
                    for (let s = 0; s < sections.length; s++) {
                      if (question < sections[s].questions) {
                        section = s;
                        break;
                      }
                      question -= sections[s].questions;
                    }
                    setActiveSection(section);
                    setActiveQuestion(question);
                  }}
                  className={`w-1.5 h-1.5 rounded-full transition-all ${
                    i === currentGlobal
                      ? "bg-emerald-600 w-3"
                      : i < currentGlobal
                        ? "bg-emerald-300"
                        : "bg-gray-300"
                  }`}
                />
              );
            })}
          </div>
        </div>
      </footer>
    </div>
  );
}

// مكون سؤال الضرب
function MultiplicationQuestion({ 
  problem, 
  answer, 
  onAnswer,
  onKeyDown
}: { 
  problem: { num1: number; num2: number };
  answer: string;
  onAnswer: (val: string) => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
}) {
  return (
    <div className="text-center">
      <div className="flex items-center justify-center gap-3 text-2xl font-bold mb-4">
        <span className="text-gray-700">{problem.num1}</span>
        <span className="text-emerald-600 text-xl">✕</span>
        <span className="text-gray-700">{problem.num2}</span>
      </div>
      
      <div className="border-t-2 border-emerald-200 pt-4">
        <div className="flex items-center justify-center gap-2 text-xl font-bold">
          <span className="text-emerald-600">=</span>
          <NumberInput
            value={answer}
            onChange={onAnswer}
            onKeyDown={onKeyDown}
            size="large"
          />
        </div>
      </div>
    </div>
  );
}

// مكون سؤال Abacus
function AbacusQuestion({ 
  column, 
  answer, 
  onAnswer,
  onKeyDown
}: { 
  column: { id: number; numbers: number[] };
  answer: string;
  onAnswer: (val: string) => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
}) {
  return (
    <div className="text-center">
      <div className="bg-gray-50 rounded-lg p-3 mb-4">
        <div className="space-y-1.5">
          {column.numbers.map((num, i) => (
            <div key={i} className="flex items-center justify-center border-b border-gray-200 pb-1.5 last:border-0 last:pb-0">
              <span className={`inline-block w-16 py-1 rounded text-base font-bold ${
                num < 0 
                  ? "bg-red-100 text-red-600" 
                  : "bg-emerald-100 text-emerald-600"
              }`}>
                {num > 0 ? "+" : ""}{num}
              </span>
            </div>
          ))}
        </div>
      </div>
      
      <div className="border-t-2 border-emerald-200 pt-4">
        <p className="text-gray-500 text-sm mb-2">الناتج:</p>
        <div className="flex items-center justify-center">
          <NumberInput
            value={answer}
            onChange={onAnswer}
            onKeyDown={onKeyDown}
            size="large"
          />
        </div>
      </div>
    </div>
  );
}

// مكون سؤال Mental
function MentalQuestion({ 
  column, 
  answer, 
  onAnswer,
  onKeyDown
}: { 
  column: { id: number; numbers: number[] };
  answer: string;
  onAnswer: (val: string) => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
}) {
  return (
    <div className="text-center">
      <div className="bg-gray-50 rounded-lg p-3 mb-4">
        <div className="space-y-1.5">
          {column.numbers.map((num, i) => (
            <div key={i} className="flex items-center justify-center border-b border-gray-200 pb-1.5 last:border-0 last:pb-0">
              <span className={`inline-block w-14 py-1 rounded text-sm font-bold ${
                num < 0 
                  ? "bg-red-100 text-red-600" 
                  : "bg-violet-100 text-violet-600"
              }`}>
                {num > 0 ? "+" : ""}{num}
              </span>
            </div>
          ))}
        </div>
      </div>
      
      <div className="border-t-2 border-violet-200 pt-4">
        <p className="text-gray-500 text-sm mb-2">الناتج:</p>
        <div className="flex items-center justify-center">
          <NumberInput
            value={answer}
            onChange={onAnswer}
            onKeyDown={onKeyDown}
            size="large"
          />
        </div>
      </div>
    </div>
  );
}

// مكون عرض النتائج
function ResultSection({ 
  title, 
  results, 
  correctAnswers, 
  userAnswers,
  className = ""
}: { 
  title: string;
  results: boolean[];
  correctAnswers: number[];
  userAnswers: string[];
  className?: string;
}) {
  const correct = results.filter(Boolean).length;
  const total = results.length;

  return (
    <Card className={`shadow ${className}`}>
      <CardHeader className="py-2 px-3 bg-gray-50">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xs">{title}</CardTitle>
          <Badge variant={correct === total ? "default" : "secondary"} className={`text-xs ${correct === total ? "bg-emerald-600" : ""}`}>
            {correct}/{total}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-2">
        <div className="grid grid-cols-5 gap-1">
          {results.map((isCorrect, i) => (
            <div key={i} className="text-center">
              <div className={`w-5 h-5 rounded-full flex items-center justify-center mx-auto ${
                isCorrect 
                  ? "bg-emerald-100 text-emerald-600" 
                  : "bg-red-100 text-red-600"
              }`}>
                {isCorrect ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
              </div>
              <div className="text-xs text-gray-500 truncate">
                {userAnswers[i] || "-"}
              </div>
              {!isCorrect && (
                <div className="text-xs text-emerald-600 font-semibold">
                  {correctAnswers[i]}
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
