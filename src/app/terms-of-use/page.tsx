"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { FileText, ArrowLeft } from "lucide-react";
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function TermsOfUsePage() {
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
            <FileText className="h-10 w-10 text-primary" />
          </div>
          <CardTitle className="text-3xl">Terms of Use for NeuroRadX</CardTitle>
          <CardDescription>Effective Date: July 1, 2025</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 text-muted-foreground p-6 text-left">
          <p>
            These Terms of Use ("Terms") govern your access to and use of the NeuroRadX mobile application and its related services (collectively, the "Service").
          </p>
          
          <div>
            <p className="font-semibold text-foreground">Provider of the Service:</p>
            <address className="not-italic mt-2">
              Andres Pinta<br />
              Strasse 1<br />
              74078 Heilbronn<br />
              Germany<br />
              Email: support@neuroradx.de
            </address>
            <p className="mt-2">By creating an account or using the Service, you agree to be bound by these Terms.</p>
          </div>
          
          <Separator />
          
          <div>
            <h3 className="font-semibold text-lg text-foreground mb-2">1. Description of Service</h3>
            <p>NeuroRadX is a specialized learning platform for neuroradiology. The Service includes personalized progress tracking, AI-powered content, and expert-validated questions. A detailed description of the Service's features is available on our website and app store listings.</p>
            <p className="mt-2 italic"><strong>Disclaimer:</strong> The Service is for educational and informational purposes only and is not a substitute for professional medical advice, diagnosis, or treatment.</p>
          </div>

          <Separator />

          <div>
            <h3 className="font-semibold text-lg text-foreground mb-2">2. Registration and User Account</h3>
            <p>You must register for an account to use the Service. You are responsible for maintaining the confidentiality of your account password and for all activities that occur under your account. You agree that your account is for your personal use only and will not be shared.</p>
          </div>

          <Separator />

          <div>
            <h3 className="font-semibold text-lg text-foreground mb-2">3. Subscriptions and Payments</h3>
            <p>The Service may offer different subscription levels ("Trial", "Evaluator", "Premium").</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
                <li><strong>Fees:</strong> Certain features of the Service may be subject to payments now or in the future. You agree to pay all applicable fees for your chosen subscription.</li>
                <li><strong>Billing:</strong> We may use third-party payment processors (e.g., Apple App Store, Google Play Store) to bill you. The processing of payments will be subject to the terms, conditions, and privacy policies of the payment processor.</li>
            </ul>
          </div>
          
          <Separator />

          <div>
            <h3 className="font-semibold text-lg text-foreground mb-2">4. User Content</h3>
            <p>The Service may allow you to create personal notes on specific questions ("questionNotes").</p>
             <ul className="list-disc pl-5 mt-2 space-y-1">
                <li><strong>Responsibility:</strong> You are solely responsible for the content of your notes.</li>
                <li><strong>License:</strong> You retain ownership of your notes. However, you grant us a worldwide, non-exclusive, royalty-free license to store, reproduce, and display these notes solely for the purpose of providing the Service to you.</li>
            </ul>
          </div>

          <Separator />

          <div>
            <h3 className="font-semibold text-lg text-foreground mb-2">5. User Obligations</h3>
            <p>You agree not to misuse the Service. This includes, but is not limited to:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
                <li>Copying, distributing, or reverse-engineering the Service or its content.</li>
                <li>Using the Service for any illegal purpose or in violation of any local, state, national, or international law.</li>
            </ul>
          </div>

          <Separator />

          <div>
            <h3 className="font-semibold text-lg text-foreground mb-2">6. Intellectual Property</h3>
            <p>All materials within the Service, including software, text, graphics, and questions (excluding your personal "questionNotes"), are the property of Andres Pinta. We grant you a limited, non-exclusive, revocable license to use the Service for your personal educational purposes.</p>
          </div>

          <Separator />

          <div>
            <h3 className="font-semibold text-lg text-foreground mb-2">7. Limitation of Liability</h3>
            <p>The Service is provided "as is". To the fullest extent permitted by German law, our liability is limited to cases of intent (Vorsatz) and gross negligence (grobe Fahrlässigkeit).</p>
          </div>

          <Separator />

          <div>
            <h3 className="font-semibold text-lg text-foreground mb-2">8. Term and Termination</h3>
            <p>You may terminate your account at any time. We reserve the right to suspend or terminate your account if you breach these Terms.</p>
          </div>

          <Separator />

          <div>
            <h3 className="font-semibold text-lg text-foreground mb-2">9. Amendments to these Terms</h3>
            <p>We may modify these Terms at any time. We will provide notice of changes by updating the "Effective Date" and, if significant, through other means.</p>
          </div>

          <Separator />

          <div>
            <h3 className="font-semibold text-lg text-foreground mb-2">10. Governing Law and Jurisdiction</h3>
            <p>These Terms shall be governed by the laws of the Federal Republic of Germany. The exclusive place of jurisdiction shall be Heilbronn, Germany.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
