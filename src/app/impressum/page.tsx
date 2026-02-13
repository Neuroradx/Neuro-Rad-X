"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Scale, ArrowLeft } from "lucide-react";
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function ImpressumPage() {
  // NOTE: Translations are not used here as per user request to keep the text in German.
  
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
             <Scale className="h-10 w-10 text-primary" />
          </div>
          <CardTitle className="text-3xl">Impressum</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-muted-foreground p-6 text-left">
          <div>
            <h3 className="font-semibold text-lg text-foreground mb-2">Angaben gemäß § 5 TMG</h3>
            <p>Andres Pinta</p>
            <p>Strasse 1</p>
            <p>74078 Heilbronn</p>
            <p>Deutschland</p>
          </div>

          <Separator />
          
          <div>
            <h3 className="font-semibold text-lg text-foreground mb-2">Vertreten durch:</h3>
            <p>Andres Pinta</p>
          </div>

          <Separator />

          <div>
            <h3 className="font-semibold text-lg text-foreground mb-2">Kontakt</h3>
            <p>Telefon: [Please Add Your Phone Number Here]</p>
            <p>
              E-Mail:{' '}
              <a href="mailto:support@neuroradx.de" className="text-primary hover:underline">support@neuroradx.de</a>
            </p>
          </div>

          <Separator />

          <div>
            <h3 className="font-semibold text-lg text-foreground mb-2">Verantwortlich für den Inhalt nach § 18 Abs. 2 MStV</h3>
            <p>Andres Pinta</p>
            <p>Strasse 1</p>
            <p>74078 Heilbronn</p>
          </div>

          <Separator />
          
          <div>
            <h3 className="font-semibold text-lg text-foreground mb-2">EU-Streitschlichtung</h3>
            <p>Die Europäische Kommission stellt eine Plattform zur Online-Streitbeilegung (OS) bereit: <a href="https://ec.europa.eu/consumers/odr" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">https://ec.europa.eu/consumers/odr</a>.</p>
            <p>Unsere E-Mail-Adresse finden Sie oben im Impressum.</p>
          </div>

          <Separator />

          <div>
            <h3 className="font-semibold text-lg text-foreground mb-2">Verbraucher­streit­beilegung/Universal­schlichtungs­stelle</h3>
            <p>Wir sind nicht bereit oder verpflichtet, an Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle teilzunehmen.</p>
          </div>

        </CardContent>
      </Card>
    </div>
  );
}
