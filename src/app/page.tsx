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

// حساب الإجابة الصحيحة
const calculateCorrectAnswer = (numbers: number[]): number => {
  return numbers.reduce((sum, num) => sum + num, 0);
};

// مكون حقل الإدخال الرقمي
function NumberInput({ 
  value, 
  onChange, 
  className = "",
  size = "normal"
}: { 
  value: string; 
  onChange: (value: string) => void;
  className?: string;
  size?: "small" | "normal" | "large";
}) {
  const sizeClasses = {
    small: "w-10 h-8 text-sm",
    normal: "w-16 h-10 text-base",
    large: "w-20 h-12 text-lg"
  };

  return (
    <Input
      type="text"
      inputMode="numeric"
      pattern="[0-9\-]*"
      value={value}
      onChange={(e) => {
        const val = e.target.value;
        // السماح بالأرقام والإشارة السالبة فقط
        if (/^-?\d*$/.test(val)) {
          onChange(val);
        }
      }}
      className={`${sizeClasses[size]} text-center font-semibold border-2 focus:border-emerald-500 focus:ring-emerald-500 ${className}`}
      placeholder="؟"
      autoComplete="off"
    />
  );
}

export default function ExamPage() {
  const [examStarted, setExamStarted] = useState(false);
  const [examFinished, setExamFinished] = useState(false);
  const [timeElapsed, setTimeElapsed] = useState(0); // الوقت التصاعدي
  const [activeSection, setActiveSection] = useState(0);

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
    // حساب النتائج
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
  };

  const sections = [
    { name: "الضرب", icon: "✖️", shortName: "ضرب" },
    { name: "Abacus 1", icon: "🧮", shortName: "Ab1" },
    { name: "Abacus 2", icon: "🧮", shortName: "Ab2" },
    { name: "Mental", icon: "🧠", shortName: "ذهني" },
    { name: "إضافي", icon: "📝", shortName: "إضافي" },
  ];

  // صفحة البداية
  if (!examStarted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-2xl border-0 overflow-hidden">
          <div className="bg-gradient-to-r from-emerald-600 to-teal-600 p-6 sm:p-8 text-center text-white">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Calculator className="w-8 h-8 sm:w-10 sm:h-10" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold mb-2">امتحان المستوى الرابع</h1>
            <p className="text-emerald-100 text-sm sm:text-base">Final Exam - Level 4</p>
          </div>
          <CardContent className="p-6 sm:p-8">
            <div className="space-y-3 mb-6">
              <div className="flex items-center gap-3 p-3 bg-emerald-50 rounded-lg">
                <Clock className="w-5 h-5 text-emerald-600 shrink-0" />
                <span className="text-gray-700 text-sm sm:text-base">الوقت: <strong>مفتوح</strong></span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-teal-50 rounded-lg">
                <Sparkles className="w-5 h-5 text-teal-600 shrink-0" />
                <span className="text-gray-700 text-sm sm:text-base">عدد الأسئلة: <strong>40 سؤال</strong></span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-cyan-50 rounded-lg">
                <Trophy className="w-5 h-5 text-cyan-600 shrink-0" />
                <span className="text-gray-700 text-sm sm:text-base">الأقسام: <strong>5 أقسام</strong></span>
              </div>
            </div>

            <div className="space-y-2 mb-6">
              <h3 className="font-semibold text-gray-700 mb-3 text-sm sm:text-base">أقسام الامتحان:</h3>
              {sections.map((section, i) => (
                <div key={i} className="flex items-center gap-2 text-gray-600 text-sm sm:text-base">
                  <span className="text-lg">{section.icon}</span>
                  <span>{section.name}</span>
                </div>
              ))}
            </div>

            <Button
              onClick={() => setExamStarted(true)}
              className="w-full h-12 sm:h-14 text-base sm:text-lg bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 shadow-lg"
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
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 p-3 sm:p-4">
        <div className="max-w-4xl mx-auto">
          <Card className="shadow-2xl border-0 overflow-hidden mb-4 sm:mb-6">
            <div className={`p-6 sm:p-8 text-center text-white ${
              score.percentage >= 80 
                ? "bg-gradient-to-r from-emerald-600 to-teal-600" 
                : score.percentage >= 60 
                  ? "bg-gradient-to-r from-amber-500 to-orange-500"
                  : "bg-gradient-to-r from-rose-500 to-red-500"
            }`}>
              <div className="w-16 h-16 sm:w-24 sm:h-24 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                {score.percentage >= 80 ? (
                  <Trophy className="w-8 h-8 sm:w-12 sm:h-12" />
                ) : score.percentage >= 60 ? (
                  <Sparkles className="w-8 h-8 sm:w-12 sm:h-12" />
                ) : (
                  <XCircle className="w-8 h-8 sm:w-12 sm:h-12" />
                )}
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold mb-2">انتهى الامتحان!</h1>
              <p className="text-white/80 text-sm sm:text-base">نتيجتك النهائية</p>
              <div className="mt-4 flex items-center justify-center gap-2 text-white/90">
                <Clock className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="text-sm sm:text-base">الوقت المستغرق: {formatTime(timeElapsed)}</span>
              </div>
            </div>
            <CardContent className="p-4 sm:p-8">
              <div className="text-center mb-6 sm:mb-8">
                <div className="text-5xl sm:text-6xl font-bold text-emerald-600 mb-2">{score.percentage}%</div>
                <div className="text-lg sm:text-xl text-gray-600">
                  {score.correct} من {score.total} إجابة صحيحة
                </div>
                <Progress value={score.percentage} className="h-2 sm:h-3 mt-4" />
              </div>

              {/* تفاصيل كل قسم */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-6 sm:mb-8">
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
                className="w-full h-12 sm:h-14 text-base sm:text-lg bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700"
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

  // صفحة الامتحان
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 flex flex-col">
      {/* الهيدر */}
      <header className="bg-white/90 backdrop-blur-sm shadow-sm sticky top-0 z-50 shrink-0">
        <div className="max-w-6xl mx-auto px-3 sm:px-4 py-2 sm:py-3">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 sm:gap-3">
              <Calculator className="w-6 h-6 sm:w-8 sm:h-8 text-emerald-600" />
              <div>
                <h1 className="font-bold text-gray-800 text-sm sm:text-base">المستوى الرابع</h1>
                <p className="text-xs text-gray-500 hidden sm:block">Level 4 Final Exam</p>
              </div>
            </div>
            <div className="flex items-center gap-2 sm:gap-4">
              <div className="flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-1.5 sm:py-2 rounded-full bg-emerald-100 text-emerald-600">
                <Clock className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="font-mono font-bold text-base sm:text-lg">{formatTime(timeElapsed)}</span>
              </div>
              <Button 
                onClick={handleFinishExam}
                className="bg-emerald-600 hover:bg-emerald-700 h-8 sm:h-10 text-xs sm:text-sm px-3 sm:px-4"
              >
                <CheckCircle2 className="w-4 h-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">إنهاء</span>
                <span className="sm:hidden">إنهاء</span>
              </Button>
            </div>
          </div>

          {/* شريط التقدم */}
          <div className="mt-2 sm:mt-3 flex gap-1 sm:gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {sections.map((section, i) => (
              <Button
                key={i}
                variant={activeSection === i ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveSection(i)}
                className={`shrink-0 h-8 sm:h-9 text-xs sm:text-sm px-2 sm:px-3 ${activeSection === i ? "bg-emerald-600 hover:bg-emerald-700" : ""}`}
              >
                <span className="mr-1">{section.icon}</span>
                <span className="hidden sm:inline">{section.name}</span>
                <span className="sm:hidden">{section.shortName}</span>
              </Button>
            ))}
          </div>
        </div>
      </header>

      {/* محتوى الامتحان */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-3 sm:px-4 py-4 sm:py-6">
        {/* قسم الضرب */}
        {activeSection === 0 && (
          <Card className="shadow-lg border-0">
            <CardHeader className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-t-lg py-3 sm:py-4">
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                <span className="text-xl sm:text-2xl">✖️</span>
                قسم الضرب - Multiplication
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 sm:p-6">
              <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-4">
                {multiplicationProblems.map((problem, i) => (
                  <div key={i} className="bg-gray-50 p-3 sm:p-4 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <Badge variant="outline" className="text-xs">سؤال {i + 1}</Badge>
                    </div>
                    <div className="flex items-center justify-center gap-1 sm:gap-2 text-lg sm:text-xl font-semibold flex-wrap">
                      <span>{problem.num1}</span>
                      <span className="text-emerald-600">×</span>
                      <span>{problem.num2}</span>
                      <span>=</span>
                      <NumberInput
                        value={multiplicationAnswers[i]}
                        onChange={(val) => {
                          const newAnswers = [...multiplicationAnswers];
                          newAnswers[i] = val;
                          setMultiplicationAnswers(newAnswers);
                        }}
                        size="normal"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* قسم Abacus 1 */}
        {activeSection === 1 && (
          <Card className="shadow-lg border-0">
            <CardHeader className="bg-gradient-to-r from-teal-600 to-cyan-600 text-white rounded-t-lg py-3 sm:py-4">
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                <span className="text-xl sm:text-2xl">🧮</span>
                قسم Abacus (الأعمدة 1-5)
              </CardTitle>
            </CardHeader>
            <CardContent className="p-2 sm:p-6">
              <div className="overflow-x-auto -mx-2 sm:mx-0">
                <table className="w-full border-collapse min-w-[400px]">
                  <thead>
                    <tr>
                      <th className="p-1 sm:p-2 text-xs sm:text-sm"></th>
                      {abacusColumns1.map((col) => (
                        <th key={col.id} className="p-1 sm:p-2 text-center font-bold text-emerald-600 text-xs sm:text-sm">
                          {col.id}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {[0, 1, 2, 3, 4, 5, 6].map((rowIndex) => (
                      <tr key={rowIndex} className={rowIndex % 2 === 0 ? "bg-gray-50" : ""}>
                        <td className="p-1 sm:p-2 text-gray-400 text-xs">صف {rowIndex + 1}</td>
                        {abacusColumns1.map((col) => (
                          <td key={col.id} className="p-1 sm:p-2 text-center">
                            <span className={`inline-block w-10 sm:w-12 py-1 rounded text-xs sm:text-sm ${
                              col.numbers[rowIndex] < 0 
                                ? "bg-red-100 text-red-600" 
                                : "bg-emerald-100 text-emerald-600"
                            }`}>
                              {col.numbers[rowIndex] > 0 ? "+" : ""}{col.numbers[rowIndex]}
                            </span>
                          </td>
                        ))}
                      </tr>
                    ))}
                    <tr className="bg-emerald-50">
                      <td className="p-1 sm:p-2 font-bold text-emerald-600 text-xs sm:text-sm">الناتج</td>
                      {abacusColumns1.map((col, colIndex) => (
                        <td key={col.id} className="p-1 sm:p-2 text-center">
                          <NumberInput
                            value={abacusAnswers1[colIndex]}
                            onChange={(val) => {
                              const newAnswers = [...abacusAnswers1];
                              newAnswers[colIndex] = val;
                              setAbacusAnswers1(newAnswers);
                            }}
                            size="normal"
                          />
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}

        {/* قسم Abacus 2 */}
        {activeSection === 2 && (
          <Card className="shadow-lg border-0">
            <CardHeader className="bg-gradient-to-r from-cyan-600 to-sky-600 text-white rounded-t-lg py-3 sm:py-4">
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                <span className="text-xl sm:text-2xl">🧮</span>
                قسم Abacus (الأعمدة 6-10)
              </CardTitle>
            </CardHeader>
            <CardContent className="p-2 sm:p-6">
              <div className="overflow-x-auto -mx-2 sm:mx-0">
                <table className="w-full border-collapse min-w-[450px]">
                  <thead>
                    <tr>
                      <th className="p-1 sm:p-2 text-xs sm:text-sm"></th>
                      {abacusColumns2.map((col) => (
                        <th key={col.id} className="p-1 sm:p-2 text-center font-bold text-cyan-600 text-xs sm:text-sm">
                          {col.id}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {[0, 1, 2, 3].map((rowIndex) => (
                      <tr key={rowIndex} className={rowIndex % 2 === 0 ? "bg-gray-50" : ""}>
                        <td className="p-1 sm:p-2 text-gray-400 text-xs">صف {rowIndex + 1}</td>
                        {abacusColumns2.map((col) => (
                          <td key={col.id} className="p-1 sm:p-2 text-center">
                            <span className={`inline-block w-12 sm:w-16 py-1 rounded text-xs sm:text-sm ${
                              col.numbers[rowIndex] < 0 
                                ? "bg-red-100 text-red-600" 
                                : "bg-cyan-100 text-cyan-600"
                            }`}>
                              {col.numbers[rowIndex] > 0 ? "+" : ""}{col.numbers[rowIndex]}
                            </span>
                          </td>
                        ))}
                      </tr>
                    ))}
                    <tr className="bg-cyan-50">
                      <td className="p-1 sm:p-2 font-bold text-cyan-600 text-xs sm:text-sm">الناتج</td>
                      {abacusColumns2.map((col, colIndex) => (
                        <td key={col.id} className="p-1 sm:p-2 text-center">
                          <NumberInput
                            value={abacusAnswers2[colIndex]}
                            onChange={(val) => {
                              const newAnswers = [...abacusAnswers2];
                              newAnswers[colIndex] = val;
                              setAbacusAnswers2(newAnswers);
                            }}
                            size="normal"
                          />
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}

        {/* قسم Mental */}
        {activeSection === 3 && (
          <Card className="shadow-lg border-0">
            <CardHeader className="bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-t-lg py-3 sm:py-4">
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                <span className="text-xl sm:text-2xl">🧠</span>
                الحساب الذهني - Mental Math
              </CardTitle>
            </CardHeader>
            <CardContent className="p-2 sm:p-6">
              <div className="overflow-x-auto -mx-2 sm:mx-0">
                <table className="w-full border-collapse min-w-[500px]">
                  <thead>
                    <tr>
                      <th className="p-1 text-xs"></th>
                      {mentalColumns.map((col) => (
                        <th key={col.id} className="p-1 text-center font-bold text-violet-600 text-xs">
                          {col.id}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {[0, 1, 2, 3, 4, 5, 6].map((rowIndex) => (
                      <tr key={rowIndex} className={rowIndex % 2 === 0 ? "bg-gray-50" : ""}>
                        <td className="p-1 text-gray-400 text-xs">صف {rowIndex + 1}</td>
                        {mentalColumns.map((col) => (
                          <td key={col.id} className="p-1 text-center">
                            <span className={`inline-block w-7 sm:w-8 py-0.5 rounded text-xs ${
                              col.numbers[rowIndex] < 0 
                                ? "bg-red-100 text-red-600" 
                                : "bg-violet-100 text-violet-600"
                            }`}>
                              {col.numbers[rowIndex] > 0 ? "+" : ""}{col.numbers[rowIndex]}
                            </span>
                          </td>
                        ))}
                      </tr>
                    ))}
                    <tr className="bg-violet-50">
                      <td className="p-1 font-bold text-violet-600 text-xs">الناتج</td>
                      {mentalColumns.map((col, colIndex) => (
                        <td key={col.id} className="p-1 text-center">
                          <NumberInput
                            value={mentalAnswers[colIndex]}
                            onChange={(val) => {
                              const newAnswers = [...mentalAnswers];
                              newAnswers[colIndex] = val;
                              setMentalAnswers(newAnswers);
                            }}
                            size="small"
                          />
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}

        {/* قسم إضافي */}
        {activeSection === 4 && (
          <Card className="shadow-lg border-0">
            <CardHeader className="bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-t-lg py-3 sm:py-4">
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                <span className="text-xl sm:text-2xl">📝</span>
                القسم الإضافي
              </CardTitle>
            </CardHeader>
            <CardContent className="p-2 sm:p-6">
              <div className="overflow-x-auto -mx-2 sm:mx-0">
                <table className="w-full border-collapse min-w-[500px]">
                  <thead>
                    <tr>
                      <th className="p-1 text-xs"></th>
                      {additionalColumns.map((col) => (
                        <th key={col.id} className="p-1 text-center font-bold text-amber-600 text-xs">
                          {col.id}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {[0, 1, 2].map((rowIndex) => (
                      <tr key={rowIndex} className={rowIndex % 2 === 0 ? "bg-gray-50" : ""}>
                        <td className="p-1 text-gray-400 text-xs">صف {rowIndex + 1}</td>
                        {additionalColumns.map((col) => (
                          <td key={col.id} className="p-1 text-center">
                            <span className={`inline-block w-10 sm:w-12 py-1 rounded text-xs sm:text-sm ${
                              col.numbers[rowIndex] < 0 
                                ? "bg-red-100 text-red-600" 
                                : "bg-amber-100 text-amber-600"
                            }`}>
                              {col.numbers[rowIndex] > 0 ? "+" : ""}{col.numbers[rowIndex]}
                            </span>
                          </td>
                        ))}
                      </tr>
                    ))}
                    <tr className="bg-amber-50">
                      <td className="p-1 font-bold text-amber-600 text-xs">الناتج</td>
                      {additionalColumns.map((col, colIndex) => (
                        <td key={col.id} className="p-1 text-center">
                          <NumberInput
                            value={additionalAnswers[colIndex]}
                            onChange={(val) => {
                              const newAnswers = [...additionalAnswers];
                              newAnswers[colIndex] = val;
                              setAdditionalAnswers(newAnswers);
                            }}
                            size="small"
                          />
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}
      </main>

      {/* شريط التنقل السفلي */}
      <footer className="bg-white/90 backdrop-blur-sm border-t shrink-0 sticky bottom-0">
        <div className="max-w-6xl mx-auto px-3 sm:px-4 py-3">
          <div className="flex justify-between items-center gap-2">
            <Button
              variant="outline"
              onClick={() => setActiveSection(Math.max(0, activeSection - 1))}
              disabled={activeSection === 0}
              className="h-10 sm:h-11 px-3 sm:px-4 text-sm"
            >
              <ChevronRight className="w-4 h-4 ml-1" />
              السابق
            </Button>
            
            <div className="flex gap-1">
              {sections.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActiveSection(i)}
                  className={`w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full transition-all ${
                    activeSection === i 
                      ? "bg-emerald-600 w-4 sm:w-6" 
                      : "bg-gray-300"
                  }`}
                />
              ))}
            </div>
            
            <Button
              onClick={() => setActiveSection(Math.min(4, activeSection + 1))}
              disabled={activeSection === 4}
              className="bg-emerald-600 hover:bg-emerald-700 h-10 sm:h-11 px-3 sm:px-4 text-sm"
            >
              التالي
              <ChevronLeft className="w-4 h-4 mr-1" />
            </Button>
          </div>
        </div>
      </footer>
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
      <CardHeader className="py-2 sm:py-3 px-3 sm:px-4 bg-gray-50">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xs sm:text-sm">{title}</CardTitle>
          <Badge variant={correct === total ? "default" : "secondary"} className={`text-xs ${correct === total ? "bg-emerald-600" : ""}`}>
            {correct}/{total}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-2 sm:p-3">
        <div className="grid grid-cols-5 gap-1 sm:gap-2">
          {results.map((isCorrect, i) => (
            <div key={i} className="text-center">
              <div className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center mx-auto mb-0.5 sm:mb-1 ${
                isCorrect 
                  ? "bg-emerald-100 text-emerald-600" 
                  : "bg-red-100 text-red-600"
              }`}>
                {isCorrect ? <CheckCircle2 className="w-3 h-3 sm:w-4 sm:h-4" /> : <XCircle className="w-3 h-3 sm:w-4 sm:h-4" />}
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
