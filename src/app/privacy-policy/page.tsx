
"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Shield, ArrowLeft } from "lucide-react";
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function PrivacyPolicyPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <div className="w-full max-w-3xl mb-8">
        <Button variant="outline" asChild>
          <Link href="/">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Link>
        </Button>
      </div>
      <Card className="w-full max-w-3xl shadow-lg">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Shield className="h-10 w-10 text-primary" />
          </div>
          <CardTitle className="text-3xl">Privacy Policy for NeuroRadX</CardTitle>
          <CardDescription>Effective Date: July 1, 2025</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 text-muted-foreground p-6 text-left">
          <p>
            Your privacy is our priority. This Privacy Policy explains in detail what personal data we collect, why we collect it, and how we use it when you use NeuroRadX, in full compliance with the EU General Data Protection Regulation (GDPR).
          </p>
          
          <div>
            <h3 className="font-semibold text-lg text-foreground mb-2">1. Data Controller</h3>
            <p>The entity responsible for the processing of your personal data is:</p>
            <address className="not-italic mt-2">
              Andres Pinta<br />
              Strasse 1<br />
              74078 Heilbronn<br />
              Germany<br />
              Email: support@neuroradx.de
            </address>
          </div>

          <div>
            <h3 className="font-semibold text-lg text-foreground mb-2">2. Data We Process, Purposes, and Legal Basis</h3>
            <p>We have structured the data we process into clear categories for your understanding.</p>
            
            <div className="mt-4 space-y-4">
              <div>
                <h4 className="font-semibold text-md text-foreground mb-1">2.1. Account and Subscription Information</h4>
                <p>This is the basic information required to create and manage your account.</p>
                <ul className="list-disc pl-5 mt-2 space-y-1">
                  <li><strong>Data Collected:</strong> First Name, Last Name, Full Name, Email Address, a unique Firebase user ID (uid), account status (e.g., 'approved'), your role (e.g., 'user'), your subscriptionLevel (e.g., 'Premium'), and the account createdAt date.</li>
                  <li><strong>Purpose:</strong> To create and secure your account, authenticate you, manage your subscription, and communicate with you about the Service.</li>
                  <li><strong>Legal Basis:</strong> Art. 6(1)(b) GDPR – processing is necessary for the performance of the contract (our Terms of Use) between you and us.</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold text-md text-foreground mb-1">2.2. Optional Profile Information</h4>
                <p>This information is entirely voluntary and you can use the app without providing it.</p>
                 <ul className="list-disc pl-5 mt-2 space-y-1">
                  <li><strong>Data Collected:</strong> country, institution, avatarUrl, userDeclaredSpecialization, and profession.</li>
                  <li><strong>Purpose:</strong> To allow you to personalize your user profile. We may also use this data in a completely anonymized and aggregated form for statistical analysis to better understand our user base.</li>
                  <li><strong>Legal Basis:</strong> Art. 6(1)(a) GDPR – your explicit consent, which you provide by voluntarily entering this information. You can withdraw this consent at any time by removing the information from your profile.</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold text-md text-foreground mb-1">2.3. Activity and Progress Data</h4>
                <p>This data is generated as you use the app and is essential for the app's core learning functionality.</p>
                <ul className="list-disc pl-5 mt-2 space-y-1">
                    <li><strong>Data Collected:</strong>
                        <ul className="list-disc pl-5 mt-1 space-y-1">
                            <li><strong>quiz_sessions:</strong> A history of your study sessions, including exam settings, scores, and which questions you answered correctly or incorrectly.</li>
                            <li><strong>userQuestions:</strong> A record of every question you interact with, tracking how many times you've seen it, answered it correctly/incorrectly, or "mastered" it.</li>
                            <li><strong>bookmarkedQuestions:</strong> A list of questions you've saved for future review.</li>
                            <li><strong>questionNotes:</strong> Your personal annotations on specific questions.</li>
                            <li><strong>seenFacts:</strong> A record of which "Did you know..." facts you've seen to avoid repetition.</li>
                        </ul>
                    </li>
                  <li><strong>Purpose:</strong> This data is the engine behind your personalized learning experience. We process it to track your progress, identify your strengths and weaknesses, provide tailored recommendations, and enable you to review your activity. This is the central feature of the NeuroRadX service.</li>
                  <li><strong>Legal Basis:</strong> Art. 6(1)(f) GDPR (Legitimate Interest). Our legitimate interest is to provide the core, adaptive, and personalized educational features that are the central promise of the Service. This processing is inseparable from the service you signed up for.</li>
                </ul>
              </div>

               <div>
                <h4 className="font-semibold text-md text-foreground mb-1">2.4. Technical Data</h4>
                 <ul className="list-disc pl-5 mt-2 space-y-1">
                  <li><strong>Data Collected:</strong> IP address, device type, and operating system.</li>
                  <li><strong>Purpose:</strong> To ensure the technical functionality, stability, and security of our Service.</li>
                  <li><strong>Legal Basis:</strong> Art. 6(1)(f) GDPR (Legitimate Interest).</li>
                </ul>
              </div>

            </div>
          </div>

          <div>
            <h3 className="font-semibold text-lg text-foreground mb-2">3. Data Recipients</h3>
            <p>We do not sell your personal data. We may share data with third-party service providers who help us operate our Service, such as cloud hosting providers (e.g., Google Firebase). These providers are contractually bound to process data only on our behalf.</p>
          </div>
          
          <div>
            <h3 className="font-semibold text-lg text-foreground mb-2">4. Data Retention</h3>
            <p>We retain your personal data for as long as your account is active. Upon account deletion, your personal data will be erased in accordance with our data deletion processes, unless we are legally required to retain it for a longer period (e.g., under German commercial or tax law).</p>
          </div>

           <div>
            <h3 className="font-semibold text-lg text-foreground mb-2">5. Your Rights as a Data Subject</h3>
            <p>You have comprehensive rights under the GDPR:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
                <li><strong>Right of Access (Art. 15):</strong> To request a copy of your data.</li>
                <li><strong>Right to Rectification (Art. 16):</strong> To correct inaccurate data.</li>
                <li><strong>Right to Erasure (Art. 17):</strong> To have your data deleted.</li>
                <li><strong>Right to Restriction of Processing (Art. 18):</strong> To limit how we use your data.</li>
                <li><strong>Right to Data Portability (Art. 20):</strong> To receive your data in a portable format.</li>
                <li><strong>Right to Object (Art. 21):</strong> You have the right to object to our processing of your data based on legitimate interests (as described in sections 2.3 and 2.4). If you object, we will no longer process your data for these purposes unless we can demonstrate compelling legitimate grounds which override your interests.</li>
                <li><strong>Right to Lodge a Complaint (Art. 77):</strong> To complain to a supervisory authority.</li>
            </ul>
             <p className="mt-2">To exercise these rights, please contact us at the address listed in Section 1 or via email.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
