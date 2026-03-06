"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Shield, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export default function PrivacyPolicyPage() {
  const router = useRouter();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <div className="w-full max-w-3xl mb-8">
        <Button variant="outline" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
      </div>
      <Card className="w-full max-w-3xl shadow-lg">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Shield className="h-10 w-10 text-primary" />
          </div>
          <CardTitle className="text-3xl">Privacy Policy for NeuroRadX</CardTitle>
          <CardDescription>Effective Date: July 1, 2025 · Germany</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 text-muted-foreground p-6 text-left">
          <p>
            NeuroRadX is committed to protecting your privacy. This Privacy Policy explains what personal data we collect, why we collect it, how we use it, and what rights you have when you use our neuroradiology learning platform. We process your data in compliance with the EU General Data Protection Regulation (GDPR) and the German Federal Data Protection Act (Bundesdatenschutzgesetz – BDSG).
          </p>

          <div>
            <h3 className="font-semibold text-lg text-foreground mb-2">1. Data Controller</h3>
            <p>The entity responsible for the processing of your personal data under GDPR Art. 4(7) is:</p>
            <address className="not-italic mt-2">
              Andres Pinta<br />
              Strasse 1<br />
              74078 Heilbronn<br />
              Germany<br />
              Email: <a href="mailto:support@neuroradx.com" className="text-primary hover:underline">support@neuroradx.com</a>
            </address>
            <p className="mt-2">For any questions regarding data protection or to exercise your rights, please contact us at the address or email above.</p>
          </div>

          <div>
            <h3 className="font-semibold text-lg text-foreground mb-2">2. Data We Process, Purposes, and Legal Basis</h3>
            <p>We process your personal data in the following categories:</p>

            <div className="mt-4 space-y-4">
              <div>
                <h4 className="font-semibold text-md text-foreground mb-1">2.1. Account and Subscription Information</h4>
                <p>Information required to create and manage your account.</p>
                <ul className="list-disc pl-5 mt-2 space-y-1">
                  <li><strong>Data collected:</strong> First name, last name, full name, email address, unique user ID (Firebase UID), account status (e.g. approved, pending), role (e.g. user, admin), subscription level (e.g. Premium), and account creation date.</li>
                  <li><strong>Purpose:</strong> To create and secure your account, authenticate you, manage your subscription, and communicate with you about the Service.</li>
                  <li><strong>Legal basis:</strong> Art. 6(1)(b) GDPR – processing necessary for the performance of the contract (our Terms of Use).</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold text-md text-foreground mb-1">2.2. Optional Profile Information</h4>
                <p>Voluntary information you may provide to personalise your profile.</p>
                <ul className="list-disc pl-5 mt-2 space-y-1">
                  <li><strong>Data collected:</strong> Country, institution, avatar URL, declared specialisation (e.g. student, resident), and profession.</li>
                  <li><strong>Purpose:</strong> To personalise your profile. We may use this data in anonymised and aggregated form for statistical analysis.</li>
                  <li><strong>Legal basis:</strong> Art. 6(1)(a) GDPR – your consent. You may withdraw consent at any time by removing this information from your profile.</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold text-md text-foreground mb-1">2.3. Activity and Progress Data</h4>
                <p>Data generated as you use the app, essential for the learning functionality.</p>
                <ul className="list-disc pl-5 mt-2 space-y-1">
                  <li><strong>Data collected:</strong>
                    <ul className="list-disc pl-5 mt-1 space-y-1">
                      <li><strong>Quiz sessions:</strong> History of study sessions, exam settings, scores, and which questions you answered correctly or incorrectly.</li>
                      <li><strong>User questions:</strong> Record of questions you interact with, including times seen, correct/incorrect answers, and mastery status.</li>
                      <li><strong>Bookmarked questions:</strong> Questions you have saved for future review.</li>
                      <li><strong>Question notes:</strong> Your personal annotations on specific questions.</li>
                      <li><strong>Seen facts:</strong> Record of which &quot;Did you know...&quot; facts you have seen.</li>
                    </ul>
                  </li>
                  <li><strong>Purpose:</strong> To provide your personalised learning experience, track progress, identify strengths and weaknesses, and enable you to review your activity.</li>
                  <li><strong>Legal basis:</strong> Art. 6(1)(f) GDPR (legitimate interest). Our legitimate interest is to provide the core educational features of the Service.</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold text-md text-foreground mb-1">2.4. Notifications and Issue Reports</h4>
                <p>Data related to in-app communications and support.</p>
                <ul className="list-disc pl-5 mt-2 space-y-1">
                  <li><strong>Data collected:</strong> In-app notifications (linked to your user ID) and issue reports you submit (including question ID, problem type, description, and your user ID).</li>
                  <li><strong>Purpose:</strong> To deliver administrative messages, inform you about updates to reported issues, and process your support requests.</li>
                  <li><strong>Legal basis:</strong> Art. 6(1)(b) GDPR (contract) and Art. 6(1)(f) GDPR (legitimate interest in improving our content and support).</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold text-md text-foreground mb-1">2.5. Technical Data</h4>
                <ul className="list-disc pl-5 mt-2 space-y-1">
                  <li><strong>Data collected:</strong> IP address, device type, operating system, and server logs (which may contain your user ID or email in error messages).</li>
                  <li><strong>Purpose:</strong> To ensure technical functionality, stability, security, and troubleshooting.</li>
                  <li><strong>Legal basis:</strong> Art. 6(1)(f) GDPR (legitimate interest).</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold text-md text-foreground mb-1">2.6. Cookies and Local Storage</h4>
                <p>We use minimal local storage and cookies for essential functionality.</p>
                <ul className="list-disc pl-5 mt-2 space-y-1">
                  <li><strong>Data stored:</strong> Your preferred language and text size (localStorage); sidebar open/closed state (cookie).</li>
                  <li><strong>Purpose:</strong> To remember your preferences and improve your experience.</li>
                  <li><strong>Legal basis:</strong> Art. 6(1)(f) GDPR (legitimate interest). We do not use advertising or tracking cookies.</li>
                </ul>
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-lg text-foreground mb-2">3. Data Recipients and International Transfers</h3>
            <p>We do not sell your personal data. We share data only with the following service providers who help us operate the Service:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li><strong>Google Firebase</strong> (Authentication, Firestore, Hosting, Cloud Run): Hosts your account data, progress data, and the application. Data may be processed in the EU and the USA. Transfers to the USA are governed by the EU-US Data Privacy Framework and/or Standard Contractual Clauses.</li>
              <li><strong>Algolia</strong>: Powers the search functionality. We index only question content (not personal data). Algolia may process data in the EU or USA under appropriate safeguards.</li>
              <li><strong>Google AI (Gemini)</strong>: Used by administrators to enrich question content with scientific references. Only question text (not linked to users) is processed. Your personal data is not sent to Google AI.</li>
            </ul>
            <p className="mt-2">All providers act as processors on our behalf and are contractually bound to process data only as instructed.</p>
          </div>

          <div>
            <h3 className="font-semibold text-lg text-foreground mb-2">4. Data Retention</h3>
            <p>We retain your personal data for as long as your account is active. Upon account deletion, we erase your personal data in accordance with our deletion processes, unless we are legally required to retain it for a longer period (e.g. under German commercial or tax law, typically up to 10 years for certain records). Server logs are typically retained for up to 30 days.</p>
          </div>

          <div>
            <h3 className="font-semibold text-lg text-foreground mb-2">5. Security</h3>
            <p>We implement appropriate technical and organisational measures to protect your personal data, including encryption in transit (TLS), access controls, and secure authentication. Our infrastructure is hosted on Google Cloud Platform with industry-standard security practices.</p>
          </div>

          <div>
            <h3 className="font-semibold text-lg text-foreground mb-2">6. Your Rights as a Data Subject</h3>
            <p>Under the GDPR, you have the following rights:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li><strong>Right of access (Art. 15):</strong> To obtain confirmation as to whether we process your data and to receive a copy of it.</li>
              <li><strong>Right to rectification (Art. 16):</strong> To have inaccurate data corrected.</li>
              <li><strong>Right to erasure (Art. 17):</strong> To have your data deleted (&quot;right to be forgotten&quot;), subject to legal retention obligations.</li>
              <li><strong>Right to restriction of processing (Art. 18):</strong> To limit how we use your data in certain circumstances.</li>
              <li><strong>Right to data portability (Art. 20):</strong> To receive your data in a structured, commonly used, machine-readable format.</li>
              <li><strong>Right to object (Art. 21):</strong> To object to processing based on legitimate interests (sections 2.3, 2.4, 2.5, 2.6). If you object, we will cease processing unless we demonstrate compelling legitimate grounds that override your interests.</li>
              <li><strong>Right to withdraw consent (Art. 7(3)):</strong> Where processing is based on consent, you may withdraw it at any time.</li>
              <li><strong>Right to lodge a complaint (Art. 77):</strong> To complain to a supervisory authority. In Germany, you may contact the competent state data protection authority (Landesdatenschutzbehörde) or the Federal Commissioner for Data Protection and Freedom of Information (BfDI): <a href="https://www.bfdi.bund.de" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">www.bfdi.bund.de</a>.</li>
            </ul>
            <p className="mt-2">To exercise any of these rights, please contact us at the address or email in Section 1. We will respond within one month.</p>
          </div>

          <div>
            <h3 className="font-semibold text-lg text-foreground mb-2">7. Minors</h3>
            <p>NeuroRadX is intended for medical professionals, residents, and students in the field. We do not knowingly collect data from children under 16. If you believe we have inadvertently collected such data, please contact us and we will delete it promptly.</p>
          </div>

          <div>
            <h3 className="font-semibold text-lg text-foreground mb-2">8. Changes to This Policy</h3>
            <p>We may update this Privacy Policy from time to time. We will notify you of material changes by posting the updated policy on this page and updating the effective date. For significant changes, we may also notify you by email or in-app message. We encourage you to review this policy periodically.</p>
          </div>

          <div>
            <h3 className="font-semibold text-lg text-foreground mb-2">9. Contact</h3>
            <p>For any questions about this Privacy Policy or our data practices, please contact us at <a href="mailto:support@neuroradx.com" className="text-primary hover:underline">support@neuroradx.com</a> or at the address in Section 1.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
