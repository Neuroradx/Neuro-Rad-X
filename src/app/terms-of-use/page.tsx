"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { FileText, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function TermsOfUsePage() {
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
            <FileText className="h-10 w-10 text-primary" />
          </div>
          <CardTitle className="text-3xl">Terms of Use for NeuroRadX</CardTitle>
          <CardDescription>Effective Date: July 1, 2025 · Germany</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 text-muted-foreground p-6 text-left">
          <p>
            These Terms of Use (&quot;Terms&quot;) govern your access to and use of the NeuroRadX application and its related services (collectively, the &quot;Service&quot;). The Service is operated from Germany and these Terms are governed by German law.
          </p>

          <div>
            <h3 className="font-semibold text-lg text-foreground mb-2">Provider of the Service</h3>
            <p className="font-semibold text-foreground">The entity responsible for the Service is:</p>
            <address className="not-italic mt-2">
              Andres Pinta<br />
              Strasse 1<br />
              74078 Heilbronn<br />
              Germany<br />
              Email: <a href="mailto:support@neuroradx.com" className="text-primary hover:underline">support@neuroradx.com</a>
            </address>
            <p className="mt-2">By creating an account or using the Service, you agree to be bound by these Terms. If you do not agree, please do not use the Service.</p>
          </div>

          <Separator />

          <div>
            <h3 className="font-semibold text-lg text-foreground mb-2">1. Description of Service</h3>
            <p>NeuroRadX is a specialised learning platform for neuroradiology. The Service includes:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>Personalised progress tracking and analytics</li>
              <li>AI-powered content enrichment and scientific article discovery</li>
              <li>Expert-validated questions covering Head, Neck, Spine, and General Neuroradiology</li>
              <li>Study modes: Tutor Mode, Exam Mode, and Flashcards</li>
              <li>Bookmarks, personal notes, and issue reporting</li>
            </ul>
            <p className="mt-2 italic">
              <strong>Medical Disclaimer:</strong> The Service is for educational and informational purposes only. It is not a substitute for professional medical advice, diagnosis, or treatment. Always seek the advice of a qualified healthcare provider with any questions you may have regarding a medical condition.
            </p>
          </div>

          <Separator />

          <div>
            <h3 className="font-semibold text-lg text-foreground mb-2">2. Registration and User Account</h3>
            <p>You must register for an account to use the Service. You agree to:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>Provide accurate and complete registration information</li>
              <li>Maintain the confidentiality of your account password</li>
              <li>Accept responsibility for all activities that occur under your account</li>
              <li>Use your account for personal use only; sharing accounts is not permitted</li>
            </ul>
            <p className="mt-2">We may require email verification or manual approval before granting full access. We reserve the right to reject or suspend accounts that do not meet our eligibility criteria.</p>
          </div>

          <Separator />

          <div>
            <h3 className="font-semibold text-lg text-foreground mb-2">3. Subscriptions and Payments</h3>
            <p>The Service offers different subscription levels (e.g. Trial, Evaluator, Premium, ECMINT).</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li><strong>Fees:</strong> Certain features may be subject to payment. You agree to pay all applicable fees for your chosen subscription.</li>
              <li><strong>Billing:</strong> Payments may be processed through third-party providers (e.g. Apple App Store, Google Play Store). Their terms and privacy policies apply to payment processing.</li>
              <li><strong>Trial:</strong> Trial access may be limited in scope (e.g. number of questions). Full access requires a paid subscription.</li>
            </ul>
          </div>

          <Separator />

          <div>
            <h3 className="font-semibold text-lg text-foreground mb-2">4. User Content</h3>
            <p>The Service allows you to create personal notes on questions (&quot;questionNotes&quot;) and to submit issue reports.</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li><strong>Responsibility:</strong> You are solely responsible for the content of your notes and reports.</li>
              <li><strong>License:</strong> You retain ownership of your notes. You grant us a worldwide, non-exclusive, royalty-free license to store, reproduce, and display them solely to provide the Service to you.</li>
              <li><strong>Issue reports:</strong> By submitting an issue report, you consent to our use of the information to improve the Service and to contact you regarding the report.</li>
            </ul>
          </div>

          <Separator />

          <div>
            <h3 className="font-semibold text-lg text-foreground mb-2">5. Acceptable Use and User Obligations</h3>
            <p>You agree not to misuse the Service. Prohibited conduct includes, but is not limited to:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>Copying, distributing, reverse-engineering, or extracting the Service or its content</li>
              <li>Using the Service for any illegal purpose or in violation of applicable law</li>
              <li>Attempting to gain unauthorised access to our systems or other users&apos; accounts</li>
              <li>Using automated tools (e.g. scrapers, bots) without our prior written consent</li>
              <li>Circumventing access controls, subscription limits, or technical restrictions</li>
            </ul>
            <p className="mt-2">We reserve the right to suspend or terminate your account if we reasonably believe you have violated these Terms.</p>
          </div>

          <Separator />

          <div>
            <h3 className="font-semibold text-lg text-foreground mb-2">6. Intellectual Property</h3>
            <p>All materials within the Service—including software, text, graphics, images, questions, and explanations (excluding your personal questionNotes)—are the property of Andres Pinta or our licensors. We grant you a limited, non-exclusive, non-transferable, revocable license to use the Service for your personal educational purposes only. You may not sublicense, sell, or commercially exploit any part of the Service without our prior written consent.</p>
          </div>

          <Separator />

          <div>
            <h3 className="font-semibold text-lg text-foreground mb-2">7. Limitation of Liability</h3>
            <p>The Service is provided &quot;as is&quot; and &quot;as available&quot;. To the fullest extent permitted by German law (including § 536a BGB and the Product Liability Act):</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>Our liability is limited to cases of intent (Vorsatz) and gross negligence (grobe Fahrlässigkeit)</li>
              <li>We are not liable for indirect, incidental, consequential, or punitive damages</li>
              <li>Our total liability for any claim arising from these Terms or the Service shall not exceed the amount you paid us in the twelve months preceding the claim</li>
            </ul>
          </div>

          <Separator />

          <div>
            <h3 className="font-semibold text-lg text-foreground mb-2">8. Term and Termination</h3>
            <p>You may terminate your account at any time through the account settings. We reserve the right to suspend or terminate your account if you breach these Terms, or for operational or legal reasons. Upon termination, your right to use the Service ceases immediately. Sections that by their nature should survive (e.g. Intellectual Property, Limitation of Liability) will survive termination.</p>
          </div>

          <Separator />

          <div>
            <h3 className="font-semibold text-lg text-foreground mb-2">9. Amendments to These Terms</h3>
            <p>We may modify these Terms at any time. We will provide notice of changes by updating the &quot;Effective Date&quot; on this page. For significant changes, we may also notify you by email or in-app message. Your continued use of the Service after the effective date of changes constitutes acceptance of the revised Terms. If you do not agree, you must stop using the Service.</p>
          </div>

          <Separator />

          <div>
            <h3 className="font-semibold text-lg text-foreground mb-2">10. Governing Law and Jurisdiction</h3>
            <p>These Terms shall be governed by the laws of the Federal Republic of Germany, excluding its conflict-of-law rules. The exclusive place of jurisdiction for any disputes shall be Heilbronn, Germany, provided that you are a merchant (Kaufmann), a legal entity under public law, or a public-law special fund. We may also bring proceedings against you in the courts of your place of residence.</p>
          </div>

          <Separator />

          <div>
            <h3 className="font-semibold text-lg text-foreground mb-2">11. Privacy and Data Protection</h3>
            <p>Your use of the Service is also governed by our <Link href="/privacy-policy" className="text-primary hover:underline">Privacy Policy</Link>, which describes how we collect, use, and protect your personal data in compliance with the GDPR and German data protection law.</p>
          </div>

          <Separator />

          <div>
            <h3 className="font-semibold text-lg text-foreground mb-2">12. Contact</h3>
            <p>For any questions about these Terms, please contact us at <a href="mailto:support@neuroradx.com" className="text-primary hover:underline">support@neuroradx.com</a> or at the address above.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
