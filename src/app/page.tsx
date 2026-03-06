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
  List,
  Trash2,
  Eye,
  History,
  Home
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

const sections = [
  { name: "الضرب", icon: "✖️", questions: 10 },
  { name: "Abacus 1", icon: "🧮", questions: 5 },
  { name: "Abacus 2", icon: "🧮", questions: 5 },
  { name: "Mental", icon: "🧠", questions: 10 },
  { name: "إضافي", icon: "📝", questions: 10 },
];

const calculateCorrectAnswer = (numbers: number[]): number => {
  return numbers.reduce((sum, num) => sum + num, 0);
};

// أنواع البيانات
interface ExamSession {
  id: string;
  studentName: string | null;
  totalQuestions: number;
  correctAnswers: number;
  percentage: number;
  totalTimeSeconds: number;
  status: string;
  createdAt: string;
  answers: ExamAnswer[];
}

interface ExamAnswer {
  id: string;
  section: string;
  questionIndex: number;
  globalIndex: number;
  questionData: string;
  userAnswer: string | null;
  correctAnswer: number;
  isCorrect: boolean;
  timeSeconds: number;
  isMarked: boolean;
}

// مكون حقل الإدخال
const NumberInput = ({ value, onChange, onKeyDown, inputRef }: { 
  value: string; 
  onChange: (value: string) => void;
  onKeyDown?: (e: React.KeyboardEvent) => void;
  inputRef?: React.RefObject<HTMLInputElement | null>;
}) => (
  <Input
    ref={inputRef}
    type="text"
    inputMode="numeric"
    pattern="[0-9\-]*"
    value={value}
    onChange={(e) => {
      const val = e.target.value;
      if (/^-?\d*$/.test(val)) onChange(val);
    }}
    onKeyDown={onKeyDown}
    className="w-16 h-9 text-base text-center font-bold border-2 border-emerald-300 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-200"
    placeholder="؟"
    autoComplete="off"
  />
);

export default function ExamPage() {
  // حالة الصفحة
  const [view, setView] = useState<'home' | 'exam' | 'result'>('home');
  const [examSessions, setExamSessions] = useState<ExamSession[]>([]);
  const [selectedSession, setSelectedSession] = useState<ExamSession | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // حالة الامتحان
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [activeSection, setActiveSection] = useState(0);
  const [activeQuestion, setActiveQuestion] = useState(0);
  const [markedQuestions, setMarkedQuestions] = useState<Set<number>>(new Set());
  const [showMarkedList, setShowMarkedList] = useState(false);
  const [questionTimes, setQuestionTimes] = useState<number[]>(Array(40).fill(0));
  const [questionStartTime, setQuestionStartTime] = useState<number>(Date.now());

  const inputRef = useRef<HTMLInputElement>(null);

  // الإجابات
  const [multiplicationAnswers, setMultiplicationAnswers] = useState<string[]>(Array(10).fill(""));
  const [abacusAnswers1, setAbacusAnswers1] = useState<string[]>(Array(5).fill(""));
  const [abacusAnswers2, setAbacusAnswers2] = useState<string[]>(Array(5).fill(""));
  const [mentalAnswers, setMentalAnswers] = useState<string[]>(Array(10).fill(""));
  const [additionalAnswers, setAdditionalAnswers] = useState<string[]>(Array(10).fill(""));

  // جلب جلسات الامتحان
  const fetchSessions = async () => {
    try {
      const res = await fetch('/api/exam');
      const data = await res.json();
      setExamSessions(data.sessions || []);
    } catch (error) {
      console.error('Error fetching sessions:', error);
    }
  };

  useEffect(() => {
    if (view === 'home') {
      fetchSessions();
    }
  }, [view]);

  // المؤقت
  useEffect(() => {
    if (view !== 'exam') return;
    const timer = setInterval(() => {
      setTimeElapsed((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [view]);

  // تحديث وقت السؤال عند الانتقال
  useEffect(() => {
    if (view === 'exam') {
      setQuestionStartTime(Date.now());
    }
  }, [activeSection, activeQuestion, view]);

  const getTotalQuestions = () => 40;
  
  const getCurrentQuestionNumber = () => {
    let total = 0;
    for (let i = 0; i < activeSection; i++) {
      total += sections[i].questions;
    }
    return total + activeQuestion + 1;
  };

  const getCurrentGlobalIndex = () => getCurrentQuestionNumber() - 1;

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
    if (inputRef.current) inputRef.current.blur();
  };

  // حفظ وقت السؤال الحالي قبل الانتقال
  const saveCurrentQuestionTime = () => {
    const timeSpent = Math.floor((Date.now() - questionStartTime) / 1000);
    const globalIndex = getCurrentGlobalIndex();
    setQuestionTimes(prev => {
      const newTimes = [...prev];
      newTimes[globalIndex] = (newTimes[globalIndex] || 0) + timeSpent;
      return newTimes;
    });
  };

  const navigateNext = () => {
    saveCurrentQuestionTime();
    hideKeyboard();
    if (activeQuestion < sections[activeSection].questions - 1) {
      setActiveQuestion(activeQuestion + 1);
    } else if (activeSection < sections.length - 1) {
      setActiveSection(activeSection + 1);
      setActiveQuestion(0);
    }
  };

  const navigatePrev = () => {
    saveCurrentQuestionTime();
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
    if (nextMarked !== undefined) goToQuestion(nextMarked);
    else if (markedArray.length > 0) goToQuestion(markedArray[0]);
  };

  const toggleMark = () => {
    const globalIndex = getCurrentGlobalIndex();
    setMarkedQuestions(prev => {
      const newSet = new Set(prev);
      if (newSet.has(globalIndex)) newSet.delete(globalIndex);
      else newSet.add(globalIndex);
      return newSet;
    });
  };

  const goToQuestion = (globalIndex: number) => {
    saveCurrentQuestionTime();
    hideKeyboard();
    const { section, question } = getQuestionInfo(globalIndex);
    setActiveSection(section);
    setActiveQuestion(question);
    setShowMarkedList(false);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('ar-EG', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // حساب النتائج
  const calculateResults = () => {
    const multiplicationResults = multiplicationProblems.map((p, i) => ({
      correct: p.num1 * p.num2,
      userAnswer: parseInt(multiplicationAnswers[i]) || 0,
      isCorrect: parseInt(multiplicationAnswers[i]) === p.num1 * p.num2
    }));

    const abacusResults1 = abacusColumns1.map((col, i) => ({
      correct: calculateCorrectAnswer(col.numbers),
      userAnswer: parseInt(abacusAnswers1[i]) || 0,
      isCorrect: parseInt(abacusAnswers1[i]) === calculateCorrectAnswer(col.numbers)
    }));

    const abacusResults2 = abacusColumns2.map((col, i) => ({
      correct: calculateCorrectAnswer(col.numbers),
      userAnswer: parseInt(abacusAnswers2[i]) || 0,
      isCorrect: parseInt(abacusAnswers2[i]) === calculateCorrectAnswer(col.numbers)
    }));

    const mentalResults = mentalColumns.map((col, i) => ({
      correct: calculateCorrectAnswer(col.numbers),
      userAnswer: parseInt(mentalAnswers[i]) || 0,
      isCorrect: parseInt(mentalAnswers[i]) === calculateCorrectAnswer(col.numbers)
    }));

    const additionalResults = additionalColumns.map((col, i) => ({
      correct: calculateCorrectAnswer(col.numbers),
      userAnswer: parseInt(additionalAnswers[i]) || 0,
      isCorrect: parseInt(additionalAnswers[i]) === calculateCorrectAnswer(col.numbers)
    }));

    const allResults = [
      ...multiplicationResults,
      ...abacusResults1,
      ...abacusResults2,
      ...mentalResults,
      ...additionalResults
    ];

    const correctCount = allResults.filter(r => r.isCorrect).length;
    const percentage = Math.round((correctCount / 40) * 100);

    return { allResults, correctCount, percentage };
  };

  // إنهاء وحفظ الامتحان
  const handleFinishExam = async () => {
    saveCurrentQuestionTime();
    setIsLoading(true);
    
    const { allResults, correctCount, percentage } = calculateResults();

    // بناء بيانات الأسئلة
    const answers = allResults.map((result, i) => {
      const { section, question } = getQuestionInfo(i);
      let questionData = '';
      
      if (section === 0) {
        const p = multiplicationProblems[question];
        questionData = JSON.stringify({ type: 'multiplication', num1: p.num1, num2: p.num2 });
      } else {
        const columns = section === 1 ? abacusColumns1 : section === 2 ? abacusColumns2 : section === 3 ? mentalColumns : additionalColumns;
        questionData = JSON.stringify({ type: 'abacus', numbers: columns[question].numbers });
      }

      return {
        section: sections[section].name,
        questionIndex: question,
        globalIndex: i,
        questionData,
        userAnswer: result.userAnswer ? result.userAnswer.toString() : null,
        correctAnswer: result.correct,
        isCorrect: result.isCorrect,
        timeSeconds: questionTimes[i] || 0,
        isMarked: markedQuestions.has(i)
      };
    });

    try {
      const res = await fetch('/api/exam', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          totalQuestions: 40,
          correctAnswers: correctCount,
          percentage,
          totalTimeSeconds: timeElapsed,
          status: 'completed',
          answers
        })
      });
      
      const data = await res.json();
      setSelectedSession(data.session);
      setView('result');
    } catch (error) {
      console.error('Error saving exam:', error);
    }
    
    setIsLoading(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      hideKeyboard();
      if (isLastQuestion()) handleFinishExam();
      else navigateNext();
    }
  };

  // حذف جلسة
  const deleteSession = async (id: string) => {
    try {
      await fetch(`/api/exam/${id}`, { method: 'DELETE' });
      fetchSessions();
    } catch (error) {
      console.error('Error deleting session:', error);
    }
  };

  // بدء امتحان جديد
  const startNewExam = () => {
    setTimeElapsed(0);
    setActiveSection(0);
    setActiveQuestion(0);
    setMarkedQuestions(new Set());
    setQuestionTimes(Array(40).fill(0));
    setQuestionStartTime(Date.now());
    setMultiplicationAnswers(Array(10).fill(""));
    setAbacusAnswers1(Array(5).fill(""));
    setAbacusAnswers2(Array(5).fill(""));
    setMentalAnswers(Array(10).fill(""));
    setAdditionalAnswers(Array(10).fill(""));
    setView('exam');
  };

  // عرض تفاصيل جلسة
  const viewSessionDetails = (session: ExamSession) => {
    setSelectedSession(session);
    setView('result');
  };

  // العودة للرئيسية
  const goHome = () => {
    setView('home');
    setSelectedSession(null);
  };

  // ========== صفحة الرئيسية ==========
  if (view === 'home') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 p-4">
        <div className="max-w-md mx-auto">
          {/* الهيدر */}
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg">
              <Calculator className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-800">امتحان المستوى الرابع</h1>
            <p className="text-gray-500 text-sm">Level 4 Math Exam</p>
          </div>

          {/* زر بدء امتحان جديد */}
          <Button
            onClick={startNewExam}
            className="w-full h-14 text-lg bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 shadow-lg mb-6"
          >
            <Play className="w-5 h-5 mr-2" />
            ابدأ امتحان جديد
          </Button>

          {/* سجل الامتحانات */}
          <Card className="shadow-lg">
            <div className="p-3 bg-gray-50 border-b flex items-center gap-2">
              <History className="w-4 h-4 text-gray-500" />
              <span className="font-medium text-gray-700">سجل الامتحانات</span>
              <Badge variant="outline" className="mr-auto">{examSessions.length}</Badge>
            </div>
            <CardContent className="p-3 max-h-96 overflow-y-auto">
              {examSessions.length === 0 ? (
                <p className="text-center text-gray-400 py-8">لا توجد امتحانات سابقة</p>
              ) : (
                <div className="space-y-2">
                  {examSessions.map((session) => (
                    <div key={session.id} className="bg-gray-50 rounded-lg p-3 flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        session.percentage >= 80 ? "bg-emerald-100 text-emerald-600" :
                        session.percentage >= 60 ? "bg-amber-100 text-amber-600" :
                        "bg-red-100 text-red-600"
                      }`}>
                        {session.percentage >= 80 ? <Trophy className="w-5 h-5" /> :
                         session.percentage >= 60 ? <Sparkles className="w-5 h-5" /> :
                         <XCircle className="w-5 h-5" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-lg">{session.percentage}%</span>
                          <span className="text-gray-400 text-xs">{session.correctAnswers}/40</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <Clock className="w-3 h-3" />
                          <span>{formatTime(session.totalTimeSeconds)}</span>
                          <span>•</span>
                          <span>{formatDate(session.createdAt)}</span>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm" onClick={() => viewSessionDetails(session)} className="text-emerald-600">
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => deleteSession(session.id)} className="text-red-400 hover:text-red-600">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // ========== صفحة النتائج ==========
  if (view === 'result' && selectedSession) {
    const wrongAnswers = selectedSession.answers.filter(a => !a.isCorrect);
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50">
        {/* الهيدر */}
        <header className="bg-white/90 backdrop-blur-sm shadow-sm px-4 py-2 sticky top-0 z-10">
          <div className="max-w-md mx-auto flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={goHome}>
              <Home className="w-4 h-4 ml-1" />
              الرئيسية
            </Button>
            <span className="font-bold text-gray-700">نتيجة الامتحان</span>
          </div>
        </header>

        <main className="max-w-md mx-auto p-4">
          {/* النتيجة الرئيسية */}
          <Card className="shadow-lg mb-4 overflow-hidden">
            <div className={`p-5 text-center text-white ${
              selectedSession.percentage >= 80 ? "bg-gradient-to-r from-emerald-600 to-teal-600" :
              selectedSession.percentage >= 60 ? "bg-gradient-to-r from-amber-500 to-orange-500" :
              "bg-gradient-to-r from-rose-500 to-red-500"
            }`}>
              <div className="text-5xl font-bold mb-2">{selectedSession.percentage}%</div>
              <div className="text-white/80">{selectedSession.correctAnswers} من 40 إجابة صحيحة</div>
              <div className="flex items-center justify-center gap-2 mt-2 text-white/70 text-sm">
                <Clock className="w-3 h-3" />
                <span>{formatTime(selectedSession.totalTimeSeconds)}</span>
              </div>
            </div>
          </Card>

          {/* الأخطاء */}
          {wrongAnswers.length > 0 && (
            <Card className="shadow-lg mb-4">
              <div className="p-3 bg-red-50 border-b flex items-center gap-2">
                <XCircle className="w-4 h-4 text-red-500" />
                <span className="font-medium text-red-700">الأسئلة الخاطئة ({wrongAnswers.length})</span>
              </div>
              <CardContent className="p-3 max-h-80 overflow-y-auto">
                <div className="space-y-2">
                  {wrongAnswers.map((answer) => (
                    <div key={answer.id} className="bg-red-50 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <Badge variant="outline" className="text-xs">{answer.section}</Badge>
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                          <Clock className="w-3 h-3" />
                          <span>{formatTime(answer.timeSeconds)}</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <div>
                          <span className="text-gray-500">إجابتك: </span>
                          <span className="text-red-600 font-bold">{answer.userAnswer || "-"}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">الصحيحة: </span>
                          <span className="text-emerald-600 font-bold">{answer.correctAnswer}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* جميع الأسئلة */}
          <Card className="shadow-lg">
            <div className="p-3 bg-gray-50 border-b flex items-center gap-2">
              <List className="w-4 h-4 text-gray-500" />
              <span className="font-medium text-gray-700">جميع الأسئلة</span>
            </div>
            <CardContent className="p-3">
              <div className="grid grid-cols-5 gap-1.5">
                {selectedSession.answers.map((answer) => (
                  <div
                    key={answer.id}
                    className={`h-8 rounded text-xs font-bold flex flex-col items-center justify-center ${
                      answer.isCorrect
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    <span>{answer.globalIndex + 1}</span>
                    <span className="text-[10px] opacity-70">{formatTime(answer.timeSeconds)}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  // ========== صفحة الامتحان ==========
  return (
    <div className="h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 flex flex-col overflow-hidden">
      {/* الهيدر */}
      <header className="bg-white/90 backdrop-blur-sm shrink-0 px-3 py-1.5">
        <div className="max-w-sm mx-auto flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={goHome} className="text-gray-500">
            <Home className="w-4 h-4 ml-1" />
            الرئيسية
          </Button>
          <span className="text-xs text-gray-500">{sections[activeSection].icon} {sections[activeSection].name}</span>
          <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-600">
            <Clock className="w-3 h-3" />
            <span className="font-mono text-xs font-bold">{formatTime(timeElapsed)}</span>
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
            isLoading={isLoading}
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
            isLoading={isLoading}
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
            isLoading={isLoading}
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
            isLoading={isLoading}
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
            isLoading={isLoading}
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

// مكون بطاقة السؤال
function QuestionCard({
  questionNumber, totalQuestions, isMarked, onToggleMark, onPrev, onNext, onFinish,
  isLastQuestion, hasPrev, markedCount, onShowList, onGoToNextMarked, isLoading, children
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
  isLoading?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="w-full max-w-xs bg-white rounded-xl shadow-lg overflow-hidden">
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
          <Button size="sm" onClick={onFinish} disabled={isLoading} className="h-7 px-2 text-xs bg-emerald-600 hover:bg-emerald-700">
            {isLoading ? "..." : <><CheckCircle2 className="w-3 h-3 ml-0.5" />إنهاء</>}
          </Button>
        ) : (
          <Button size="sm" onClick={onNext} className="h-7 px-2 text-xs bg-emerald-600 hover:bg-emerald-700">
            التالي<ChevronLeft className="w-3 h-3 mr-0.5" />
          </Button>
        )}
      </div>
      <div className="p-3">{children}</div>
      {markedCount > 0 && onGoToNextMarked && (
        <div className="px-2 pb-2">
          <Button variant="outline" size="sm" onClick={onGoToNextMarked} className="w-full h-7 text-xs bg-amber-50 border-amber-200 text-amber-600">
            <Flag className="w-3 h-3 ml-1" />{markedCount} سؤال للمراجعة
          </Button>
        </div>
      )}
    </div>
  );
}

// مكونات المحتوى
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
              <span className={`inline-block w-14 py-0.5 rounded text-sm font-bold ${num < 0 ? "bg-red-100 text-red-600" : "bg-emerald-100 text-emerald-600"}`}>
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
              <span className={`inline-block w-12 py-0.5 rounded text-xs font-bold ${num < 0 ? "bg-red-100 text-red-600" : "bg-violet-100 text-violet-600"}`}>
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
