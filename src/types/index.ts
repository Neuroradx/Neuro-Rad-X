
import { FieldValue } from 'firebase-admin/firestore';

export interface QuestionOption {
  id: string;
  text: string;
}

/** Per-question attempt data for exam results (e.g. study/[mode] page). */
export interface AttemptedQuestion {
  questionId: string;
  selectedOptionIndex: number;
  answeredCorrectly: boolean;
}

/** Main category (main_localization) for questions. Must match MAIN_CATEGORIES in constants. */
export type QuestionLocalization = 'Head' | 'Spine' | 'Neck' | 'General' | 'Chest' | 'Abdomen' | 'Limbs';

export interface QuestionTranslation {
  questionText: string;
  options: QuestionOption[];
  explanation: string;
}

export interface ScientificArticle {
  article_reference: string | null;
  explanation?: string | null;
  doi?: string | null;
}

export interface Question {
  id: string;
  topic: string;
  subtopic?: string;
  difficulty: string;
  correctAnswerId: string;
  translations: {
    en: QuestionTranslation;
    de?: QuestionTranslation;
    es?: QuestionTranslation;
  };
  imageUrl?: string;
  scientificArticle?: ScientificArticle;
  createdAt: FieldValue | Date | string;
  lastUpdatedAt: FieldValue | Date | string;
  main_localization?: string;
  sub_main_location?: string;
  correctAnswerIndex?: number;
  Question_revised?: string;
  Question_revised_by?: string;
  Question_revised_at?: FieldValue | Date | string;
  /** Flattened for display (e.g. my-notes); when set, translations may be omitted */
  options?: QuestionOption[];
  stem?: string;
  explanation?: string;
}

/** Saved quiz/session from Firestore users/{uid}/quiz_sessions */
export interface QuizSession {
  id: string;
  userId?: string;
  quizDate: Date | FieldValue | string;
  correctAnswers?: number;
  actualNumberOfQuestions?: number;
  incorrectAnswers?: number;
  quizConfig?: { mainLocalization?: string; [key: string]: unknown };
  [key: string]: unknown;
}

/** User note on a question (Firestore users/{uid}/questionNotes/{noteId}) */
export interface UserNote {
  id: string;
  notes: string;
  updatedAt: Date | string | { toDate(): Date };
}

export interface UserProfile {
  id?: string;
  uid: string;
  firstName: string;
  lastName: string;
  displayName: string;
  email: string;
  status: 'pending' | 'approved' | 'rejected';
  role: 'user' | 'admin' | 'tester';
  registrationIp?: string;
  country?: string;
  institution?: string;
  profession?: string;
  userDeclaredSpecialization?: string;
  avatarUrl?: string;
  subscriptionLevel?: 'free' | 'basic' | 'premium' | 'Trial' | 'Evaluator' | 'Owner' | 'ECMINT';
  subscriptionExpiresAt?: string | null;
  totalQuestionsAnsweredAllTime?: number;
  totalCorrectAnswersAllTime?: number;
  createdAt?: string | null;
  lastSignInTime?: string;
  notificationCount?: number;
  totalReports?: number;
}

export type NotificationType = 'issueReportUpdate' | 'adminMessage' | 'newFeature' | 'systemAlert';

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
  read: boolean;
  createdAt: FieldValue | Date | string;
  link?: string;
  icon?: string;
  /** Translation key for title when stored as key (optional) */
  titleKey?: string;
  /** Translation key for message when stored as key (optional) */
  messageKey?: string;
  /** Params for titleKey/messageKey translation (optional) */
  messageParams?: Record<string, string>;
  status?: 'read' | 'unread';
  /** Populated when listing sent notifications per user */
  userProfile?: UserProfile | null;
}

export interface IssueReport {
  id: string;
  userId: string;
  questionId: string;
  topic?: string;
  issueType: string;
  /** Alias for issueType used in some UI/API */
  problemType?: string;
  description: string;
  status: 'new' | 'acknowledged' | 'in-progress' | 'resolved' | 'archived' | 'wont-fix';
  timestamp: any;
  reporterProfile?: UserProfile | null;
  /** Email provided by reporter when submitting (e.g. anonymous) */
  userProvidedEmail?: string | null;
  /** Display name of reporter (may be set when fetching) */
  reporterDisplayName?: string | null;
  /** Email from auth when report was created */
  userEmailFromAuth?: string | null;
  /** Question stem text at time of report */
  questionStem?: string | null;
}

export interface UserQuestionState {
  questionId: string;
  seenCount: number;
  correctCount: number;
  incorrectCount: number;
  lastSeen: any;
}

export interface ModuleStats {
  correct: number;
  attempted: number;
  percentage: number;
}

export interface CourseStats {
  correct: number;
  attempted: number;
  percentage: number;
  modules: Record<string, ModuleStats>;
}

export type CoursePerformanceData = Record<string, CourseStats>;

/** Study mode entry for nav/configuration (tutor, exam, flashcards). */
export interface StudyMode {
  id: string;
  name: string;
  description: string;
}

export interface Infographic {
  id: string;
  title: string;
  categoryId?: string;
  isComponent?: boolean;
  createdAt?: any;
  htmlContent?: string;
}

