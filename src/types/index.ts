
import { FieldValue } from 'firebase-admin/firestore';

export interface QuestionOption {
  id: string;
  text: string;
}

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
  Question_revised?: string;
  Question_revised_by?: string;
  Question_revised_at?: FieldValue | Date | string;
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
  country?: string;
  institution?: string;
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
}

export interface IssueReport {
  id: string;
  userId: string;
  questionId: string;
  topic?: string;
  issueType: string;
  description: string;
  status: 'new' | 'acknowledged' | 'in-progress' | 'resolved' | 'archived';
  timestamp: any;
  reporterProfile?: UserProfile | null;
}

export interface UserQuestionState {
  questionId: string;
  seenCount: number;
  correctCount: number;
  incorrectCount: number;
  lastSeen: any;
}

