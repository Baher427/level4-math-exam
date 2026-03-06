"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
  ChevronLeft,
  Flag,
  X,
  List
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
const NumberInput = ({ 
  value, 
  onChange,
  onKeyDown,
  inputRef
}: { 
  value: string; 
  onChange: (value: string) => void;
  onKeyDown?: (e: React.KeyboardEvent) => void;
  inputRef?: React.RefObject<HTMLInputElement | null>;
}) => {
  return (
    <Input
      ref={inputRef}
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
      className="w-16 h-9 text-base text-center font-bold border-2 border-emerald-300 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-200"
      placeholder="؟"
      autoComplete="off"
    />
  );
};

export default function ExamPage() {
  const [examStarted, setExamStarted] = useState(false);
  const [examFinished, setExamFinished] = useState(false);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [activeSection, setActiveSection] = useState(0);
  const [activeQuestion, setActiveQuestion] = useState(0);
  const [markedQuestions, setMarkedQuestions] = useState<Set<number>>(new Set());
  const [showMarkedList, setShowMarkedList] = useState(false);

  // مرجع لحقل الإدخال
  const inputRef = useRef<HTMLInputElement>(null);

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

  const getCurrentGlobalIndex = () => {
    let total = 0;
    for (let i = 0; i < activeSection; i++) {
      total += sections[i].questions;
    }
    return total + activeQuestion;
  };

  const isLastQuestion = () => getCurrentQuestionNumber() === getTotalQuestions();

  const getQuestionInfo = (globalIndex: number) => {
    let section = 0;
    let question = globalIndex;
    for (let s = 0; s < sections.length; s++) {
      if (question < sections[s].questions) {
        section = s;
        break;
      }
      question -= sections[s].questions;
    }
    return { section, question };
  };

  const hideKeyboard = () => {
    if (inputRef.current) {
      inputRef.current.blur();
    }
  };

  const navigateNext = () => {
    hideKeyboard();
    if (activeQuestion < sections[activeSection].questions - 1) {
      setActiveQuestion(activeQuestion + 1);
    } else if (activeSection < sections.length - 1) {
      setActiveSection(activeSection + 1);
      setActiveQuestion(0);
    }
  };

  const navigatePrev = () => {
    hideKeyboard();
    if (activeQuestion > 0) {
      setActiveQuestion(activeQuestion - 1);
    } else if (activeSection > 0) {
      setActiveSection(activeSection - 1);
      setActiveQuestion(sections[activeSection - 1].questions - 1);
    }
  };

  const goToNextMarked = () => {
    const currentGlobal = getCurrentGlobalIndex();
    const markedArray = Array.from(markedQuestions).sort((a, b) => a - b);
    const nextMarked = markedArray.find(i => i > currentGlobal);
    if (nextMarked !== undefined) {
      goToQuestion(nextMarked);
    } else if (markedArray.length > 0) {
      goToQuestion(markedArray[0]);
    }
  };

  const toggleMark = () => {
    const globalIndex = getCurrentGlobalIndex();
    setMarkedQuestions(prev => {
      const newSet = new Set(prev);
      if (newSet.has(globalIndex)) {
        newSet.delete(globalIndex);
      } else {
        newSet.add(globalIndex);
      }
      return newSet;
    });
  };

  const goToQuestion = (globalIndex: number) => {
    hideKeyboard();
    const { section, question } = getQuestionInfo(globalIndex);
    setActiveSection(section);
    setActiveQuestion(question);
    setShowMarkedList(false);
  };

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

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      hideKeyboard();
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
    setMarkedQuestions(new Set());
    setShowMarkedList(false);
  };

  // صفحة البداية
  if (!examStarted) {
    return (
      <div className="h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 flex items-center justify-center p-4 overflow-hidden">
        <Card className="w-full max-w-sm shadow-2xl border-0 overflow-hidden">
          <div className="bg-gradient-to-r from-emerald-600 to-teal-600 p-5 text-center text-white">
            <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3">
              <Calculator className="w-7 h-7" />
            </div>
            <h1 className="text-xl font-bold mb-1">امتحان المستوى الرابع</h1>
            <p className="text-emerald-100 text-xs">Final Exam - Level 4</p>
          </div>
          <CardContent className="p-5">
            <div className="space-y-2 mb-5">
              <div className="flex items-center gap-2 p-2 bg-emerald-50 rounded-lg text-sm">
                <Clock className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="text-gray-700">الوقت: <strong>مفتوح</strong></span>
              </div>
              <div className="flex items-center gap-2 p-2 bg-teal-50 rounded-lg text-sm">
                <Sparkles className="w-4 h-4 text-teal-600 shrink-0" />
                <span className="text-gray-700">عدد الأسئلة: <strong>40 سؤال</strong></span>
              </div>
              <div className="flex items-center gap-2 p-2 bg-amber-50 rounded-lg text-sm">
                <Flag className="w-4 h-4 text-amber-600 shrink-0" />
                <span className="text-gray-700">علّم الأسئلة للمراجعة</span>
              </div>
            </div>

            <Button
              onClick={() => setExamStarted(true)}
              className="w-full h-11 text-base bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 shadow-lg"
            >
              <Play className="w-4 h-4 mr-2" />
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
        <div className="max-w-md mx-auto">
          <Card className="shadow-2xl border-0 overflow-hidden">
            <div className={`p-5 text-center text-white ${
              score.percentage >= 80 
                ? "bg-gradient-to-r from-emerald-600 to-teal-600" 
                : score.percentage >= 60 
                  ? "bg-gradient-to-r from-amber-500 to-orange-500"
                  : "bg-gradient-to-r from-rose-500 to-red-500"
            }`}>
              <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3">
                {score.percentage >= 80 ? (
                  <Trophy className="w-7 h-7" />
                ) : score.percentage >= 60 ? (
                  <Sparkles className="w-7 h-7" />
                ) : (
                  <XCircle className="w-7 h-7" />
                )}
              </div>
              <h1 className="text-xl font-bold mb-1">انتهى الامتحان!</h1>
              <div className="flex items-center justify-center gap-1 text-white/90 text-sm mt-2">
                <Clock className="w-3 h-3" />
                <span>{formatTime(timeElapsed)}</span>
              </div>
            </div>
            <CardContent className="p-5">
              <div className="text-center mb-5">
                <div className="text-4xl font-bold text-emerald-600 mb-1">{score.percentage}%</div>
                <div className="text-sm text-gray-600">
                  {score.correct} من {score.total} إجابة صحيحة
                </div>
                <Progress value={score.percentage} className="h-1.5 mt-3" />
              </div>

              <div className="space-y-2 mb-5">
                <ResultSection title="الضرب" results={results.multiplication} correctAnswers={multiplicationProblems.map(p => p.num1 * p.num2)} userAnswers={multiplicationAnswers} />
                <ResultSection title="Abacus (1-5)" results={results.abacus1} correctAnswers={abacusColumns1.map(col => calculateCorrectAnswer(col.numbers))} userAnswers={abacusAnswers1} />
                <ResultSection title="Abacus (6-10)" results={results.abacus2} correctAnswers={abacusColumns2.map(col => calculateCorrectAnswer(col.numbers))} userAnswers={abacusAnswers2} />
                <ResultSection title="الحساب الذهني" results={results.mental} correctAnswers={mentalColumns.map(col => calculateCorrectAnswer(col.numbers))} userAnswers={mentalAnswers} />
                <ResultSection title="القسم الإضافي" results={results.additional} correctAnswers={additionalColumns.map(col => calculateCorrectAnswer(col.numbers))} userAnswers={additionalAnswers} />
              </div>

              <Button
                onClick={resetExam}
                className="w-full h-11 text-base bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700"
              >
                <RefreshCcw className="w-4 h-4 mr-2" />
                إعادة الامتحان
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // صفحة الامتحان
  return (
    <div className="h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 flex flex-col overflow-hidden">
      {/* الهيدر */}
      <header className="bg-white/90 backdrop-blur-sm shrink-0 px-3 py-1.5">
        <div className="max-w-sm mx-auto flex items-center justify-between">
          <span className="text-xs text-gray-500">{sections[activeSection].icon} {sections[activeSection].name}</span>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-600">
              <Clock className="w-3 h-3" />
              <span className="font-mono text-xs font-bold">{formatTime(timeElapsed)}</span>
            </div>
            <Button onClick={handleFinishExam} variant="ghost" className="h-6 px-2 text-xs text-gray-400">إنهاء</Button>
          </div>
        </div>
        <div className="max-w-sm mx-auto mt-1">
          <Progress value={(getCurrentQuestionNumber() / getTotalQuestions()) * 100} className="h-1" />
        </div>
      </header>

      {/* محتوى السؤال */}
      <main className="flex-1 flex items-center justify-center p-3 overflow-hidden">
        {/* قسم الضرب */}
        {activeSection === 0 && (
          <QuestionCard
            questionNumber={activeQuestion + 1}
            totalQuestions={sections[activeSection].questions}
            isMarked={markedQuestions.has(getCurrentGlobalIndex())}
            onToggleMark={toggleMark}
            onPrev={navigatePrev}
            onNext={navigateNext}
            onFinish={handleFinishExam}
            isLastQuestion={isLastQuestion()}
            hasPrev={!(activeSection === 0 && activeQuestion === 0)}
            markedCount={markedQuestions.size}
            onShowList={() => setShowMarkedList(true)}
            onGoToNextMarked={markedQuestions.size > 0 ? goToNextMarked : undefined}
          >
            <MultiplicationContent
              problem={multiplicationProblems[activeQuestion]}
              answer={multiplicationAnswers[activeQuestion]}
              onAnswer={(val) => {
                const newAnswers = [...multiplicationAnswers];
                newAnswers[activeQuestion] = val;
                setMultiplicationAnswers(newAnswers);
              }}
              onKeyDown={handleKeyDown}
              inputRef={inputRef}
            />
          </QuestionCard>
        )}

        {/* قسم Abacus 1 */}
        {activeSection === 1 && (
          <QuestionCard
            questionNumber={activeQuestion + 1}
            totalQuestions={sections[activeSection].questions}
            isMarked={markedQuestions.has(getCurrentGlobalIndex())}
            onToggleMark={toggleMark}
            onPrev={navigatePrev}
            onNext={navigateNext}
            onFinish={handleFinishExam}
            isLastQuestion={isLastQuestion()}
            hasPrev={!(activeSection === 0 && activeQuestion === 0)}
            markedCount={markedQuestions.size}
            onShowList={() => setShowMarkedList(true)}
            onGoToNextMarked={markedQuestions.size > 0 ? goToNextMarked : undefined}
          >
            <AbacusContent
              numbers={abacusColumns1[activeQuestion].numbers}
              answer={abacusAnswers1[activeQuestion]}
              onAnswer={(val) => {
                const newAnswers = [...abacusAnswers1];
                newAnswers[activeQuestion] = val;
                setAbacusAnswers1(newAnswers);
              }}
              onKeyDown={handleKeyDown}
              inputRef={inputRef}
            />
          </QuestionCard>
        )}

        {/* قسم Abacus 2 */}
        {activeSection === 2 && (
          <QuestionCard
            questionNumber={activeQuestion + 1}
            totalQuestions={sections[activeSection].questions}
            isMarked={markedQuestions.has(getCurrentGlobalIndex())}
            onToggleMark={toggleMark}
            onPrev={navigatePrev}
            onNext={navigateNext}
            onFinish={handleFinishExam}
            isLastQuestion={isLastQuestion()}
            hasPrev={!(activeSection === 0 && activeQuestion === 0)}
            markedCount={markedQuestions.size}
            onShowList={() => setShowMarkedList(true)}
            onGoToNextMarked={markedQuestions.size > 0 ? goToNextMarked : undefined}
          >
            <AbacusContent
              numbers={abacusColumns2[activeQuestion].numbers}
              answer={abacusAnswers2[activeQuestion]}
              onAnswer={(val) => {
                const newAnswers = [...abacusAnswers2];
                newAnswers[activeQuestion] = val;
                setAbacusAnswers2(newAnswers);
              }}
              onKeyDown={handleKeyDown}
              inputRef={inputRef}
            />
          </QuestionCard>
        )}

        {/* قسم Mental */}
        {activeSection === 3 && (
          <QuestionCard
            questionNumber={activeQuestion + 1}
            totalQuestions={sections[activeSection].questions}
            isMarked={markedQuestions.has(getCurrentGlobalIndex())}
            onToggleMark={toggleMark}
            onPrev={navigatePrev}
            onNext={navigateNext}
            onFinish={handleFinishExam}
            isLastQuestion={isLastQuestion()}
            hasPrev={!(activeSection === 0 && activeQuestion === 0)}
            markedCount={markedQuestions.size}
            onShowList={() => setShowMarkedList(true)}
            onGoToNextMarked={markedQuestions.size > 0 ? goToNextMarked : undefined}
          >
            <MentalContent
              numbers={mentalColumns[activeQuestion].numbers}
              answer={mentalAnswers[activeQuestion]}
              onAnswer={(val) => {
                const newAnswers = [...mentalAnswers];
                newAnswers[activeQuestion] = val;
                setMentalAnswers(newAnswers);
              }}
              onKeyDown={handleKeyDown}
              inputRef={inputRef}
            />
          </QuestionCard>
        )}

        {/* قسم إضافي */}
        {activeSection === 4 && (
          <QuestionCard
            questionNumber={activeQuestion + 1}
            totalQuestions={sections[activeSection].questions}
            isMarked={markedQuestions.has(getCurrentGlobalIndex())}
            onToggleMark={toggleMark}
            onPrev={navigatePrev}
            onNext={navigateNext}
            onFinish={handleFinishExam}
            isLastQuestion={isLastQuestion()}
            hasPrev={!(activeSection === 0 && activeQuestion === 0)}
            markedCount={markedQuestions.size}
            onShowList={() => setShowMarkedList(true)}
            onGoToNextMarked={markedQuestions.size > 0 ? goToNextMarked : undefined}
          >
            <MentalContent
              numbers={additionalColumns[activeQuestion].numbers}
              answer={additionalAnswers[activeQuestion]}
              onAnswer={(val) => {
                const newAnswers = [...additionalAnswers];
                newAnswers[activeQuestion] = val;
                setAdditionalAnswers(newAnswers);
              }}
              onKeyDown={handleKeyDown}
              inputRef={inputRef}
            />
          </QuestionCard>
        )}
      </main>

      {/* قائمة الأسئلة */}
      {showMarkedList && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowMarkedList(false)}>
          <Card className="w-full max-w-xs max-h-[70vh] overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white py-2 px-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm flex items-center gap-1">
                  <List className="w-4 h-4" />
                  الأسئلة
                </span>
                <Button variant="ghost" size="sm" onClick={() => setShowMarkedList(false)} className="h-6 w-6 p-0 text-white hover:bg-white/20">
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
            <CardContent className="p-2 max-h-60 overflow-y-auto">
              <div className="grid grid-cols-5 gap-1.5">
                {Array.from({ length: getTotalQuestions() }).map((_, i) => {
                  const currentGlobal = getCurrentGlobalIndex();
                  const isMarked = markedQuestions.has(i);
                  return (
                    <button
                      key={i}
                      onClick={() => goToQuestion(i)}
                      className={`h-8 rounded text-sm font-bold relative ${
                        i === currentGlobal 
                          ? "bg-emerald-500 text-white" 
                          : isMarked 
                            ? "bg-amber-100 text-amber-700 border border-amber-300" 
                            : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {i + 1}
                      {isMarked && i !== currentGlobal && <Flag className="w-2 h-2 text-amber-500 absolute top-0.5 right-0.5" />}
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

// مكون بطاقة السؤال مع الأزرار المدمجة
function QuestionCard({
  questionNumber,
  totalQuestions,
  isMarked,
  onToggleMark,
  onPrev,
  onNext,
  onFinish,
  isLastQuestion,
  hasPrev,
  markedCount,
  onShowList,
  onGoToNextMarked,
  children
}: {
  questionNumber: number;
  totalQuestions: number;
  isMarked: boolean;
  onToggleMark: () => void;
  onPrev: () => void;
  onNext: () => void;
  onFinish: () => void;
  isLastQuestion: boolean;
  hasPrev: boolean;
  markedCount: number;
  onShowList: () => void;
  onGoToNextMarked?: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="w-full max-w-xs bg-white rounded-xl shadow-lg overflow-hidden">
      {/* شريط الأزرار العلوي */}
      <div className="flex items-center justify-between px-2 py-1.5 bg-gray-50 border-b">
        <Button variant="ghost" size="sm" onClick={onPrev} disabled={!hasPrev} className="h-7 px-2 text-xs">
          <ChevronRight className="w-3 h-3 ml-0.5" />
          السابق
        </Button>
        
        <div className="flex items-center gap-1">
          <button onClick={onToggleMark} className={`p-1 rounded ${isMarked ? "text-amber-500" : "text-gray-300"}`}>
            <Flag className="w-4 h-4" />
          </button>
          <span className="text-xs text-gray-500 font-medium">{questionNumber}/{totalQuestions}</span>
          <button onClick={onShowList} className="p-1 rounded text-gray-400 hover:text-gray-600">
            <List className="w-4 h-4" />
          </button>
        </div>
        
        {isLastQuestion ? (
          <Button size="sm" onClick={onFinish} className="h-7 px-2 text-xs bg-emerald-600 hover:bg-emerald-700">
            <CheckCircle2 className="w-3 h-3 ml-0.5" />
            إنهاء
          </Button>
        ) : (
          <Button size="sm" onClick={onNext} className="h-7 px-2 text-xs bg-emerald-600 hover:bg-emerald-700">
            التالي
            <ChevronLeft className="w-3 h-3 mr-0.5" />
          </Button>
        )}
      </div>
      
      {/* محتوى السؤال */}
      <div className="p-3">
        {children}
      </div>
      
      {/* شريط الأسئلة المعلمة */}
      {markedCount > 0 && onGoToNextMarked && (
        <div className="px-2 pb-2">
          <Button variant="outline" size="sm" onClick={onGoToNextMarked} className="w-full h-7 text-xs bg-amber-50 border-amber-200 text-amber-600">
            <Flag className="w-3 h-3 ml-1" />
            {markedCount} سؤال للمراجعة
          </Button>
        </div>
      )}
    </div>
  );
}

// مكون محتوى الضرب
function MultiplicationContent({ problem, answer, onAnswer, onKeyDown, inputRef }: {
  problem: { num1: number; num2: number };
  answer: string;
  onAnswer: (val: string) => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
  inputRef: React.RefObject<HTMLInputElement | null>;
}) {
  return (
    <div className="text-center">
      <div className="flex items-center justify-center gap-2 text-2xl font-bold mb-3">
        <span className="text-gray-700">{problem.num1}</span>
        <span className="text-emerald-500 text-lg">×</span>
        <span className="text-gray-700">{problem.num2}</span>
      </div>
      <div className="border-t border-dashed border-gray-200 pt-3">
        <div className="flex items-center justify-center gap-2">
          <span className="text-emerald-500 font-bold">=</span>
          <NumberInput value={answer} onChange={onAnswer} onKeyDown={onKeyDown} inputRef={inputRef} />
        </div>
      </div>
    </div>
  );
}

// مكون محتوى Abacus
function AbacusContent({ numbers, answer, onAnswer, onKeyDown, inputRef }: {
  numbers: number[];
  answer: string;
  onAnswer: (val: string) => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
  inputRef: React.RefObject<HTMLInputElement | null>;
}) {
  return (
    <div className="text-center">
      <div className="bg-gray-50 rounded-lg p-2 mb-3">
        <div className="space-y-1">
          {numbers.map((num, i) => (
            <div key={i} className="flex items-center justify-center border-b border-gray-200 pb-1 last:border-0 last:pb-0">
              <span className={`inline-block w-14 py-0.5 rounded text-sm font-bold ${
                num < 0 ? "bg-red-100 text-red-600" : "bg-emerald-100 text-emerald-600"
              }`}>
                {num > 0 ? "+" : ""}{num}
              </span>
            </div>
          ))}
        </div>
      </div>
      <div className="border-t border-dashed border-gray-200 pt-3">
        <p className="text-gray-400 text-xs mb-1">الناتج</p>
        <div className="flex items-center justify-center">
          <NumberInput value={answer} onChange={onAnswer} onKeyDown={onKeyDown} inputRef={inputRef} />
        </div>
      </div>
    </div>
  );
}

// مكون محتوى Mental
function MentalContent({ numbers, answer, onAnswer, onKeyDown, inputRef }: {
  numbers: number[];
  answer: string;
  onAnswer: (val: string) => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
  inputRef: React.RefObject<HTMLInputElement | null>;
}) {
  return (
    <div className="text-center">
      <div className="bg-gray-50 rounded-lg p-2 mb-3">
        <div className="space-y-1">
          {numbers.map((num, i) => (
            <div key={i} className="flex items-center justify-center border-b border-gray-200 pb-1 last:border-0 last:pb-0">
              <span className={`inline-block w-12 py-0.5 rounded text-xs font-bold ${
                num < 0 ? "bg-red-100 text-red-600" : "bg-violet-100 text-violet-600"
              }`}>
                {num > 0 ? "+" : ""}{num}
              </span>
            </div>
          ))}
        </div>
      </div>
      <div className="border-t border-dashed border-gray-200 pt-3">
        <p className="text-gray-400 text-xs mb-1">الناتج</p>
        <div className="flex items-center justify-center">
          <NumberInput value={answer} onChange={onAnswer} onKeyDown={onKeyDown} inputRef={inputRef} />
        </div>
      </div>
    </div>
  );
}

// مكون عرض النتائج
function ResultSection({ title, results, correctAnswers, userAnswers }: {
  title: string;
  results: boolean[];
  correctAnswers: number[];
  userAnswers: string[];
}) {
  const correct = results.filter(Boolean).length;
  const total = results.length;

  return (
    <Card className="shadow">
      <div className="py-1.5 px-3 bg-gray-50 flex items-center justify-between">
        <span className="text-xs font-medium">{title}</span>
        <Badge variant={correct === total ? "default" : "secondary"} className={`text-xs ${correct === total ? "bg-emerald-600" : ""}`}>
          {correct}/{total}
        </Badge>
      </div>
      <CardContent className="p-2">
        <div className="grid grid-cols-5 gap-1">
          {results.map((isCorrect, i) => (
            <div key={i} className="text-center">
              <div className={`w-4 h-4 rounded-full flex items-center justify-center mx-auto ${
                isCorrect ? "bg-emerald-100 text-emerald-600" : "bg-red-100 text-red-600"
              }`}>
                {isCorrect ? <CheckCircle2 className="w-2.5 h-2.5" /> : <XCircle className="w-2.5 h-2.5" />}
              </div>
              <div className="text-xs text-gray-500">{userAnswers[i] || "-"}</div>
              {!isCorrect && <div className="text-xs text-emerald-600 font-semibold">{correctAnswers[i]}</div>}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
