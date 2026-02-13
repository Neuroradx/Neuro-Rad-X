
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
  subscriptionExpiresAt?: any;
  totalQuestionsAnsweredAllTime?: number;
  totalCorrectAnswersAllTime?: number;
  createdAt?: any;
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

