"use client";

import { useState } from "react";
import { Save } from "lucide-react";
import { Header } from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

export default function SettingsPage() {
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <>
      <Header title="Paramètres" description="Configurez vos intégrations" />

      <div className="space-y-6 max-w-2xl">
        {/* Instagram */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Instagram Graph API</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium">Access Token</label>
              <Input type="password" placeholder="IGQ..." className="mt-1" />
            </div>
            <div>
              <label className="text-sm font-medium">Business Account ID</label>
              <Input placeholder="17841..." className="mt-1" />
            </div>
            <div>
              <label className="text-sm font-medium">Webhook Verify Token</label>
              <Input placeholder="Token de vérification" className="mt-1" />
            </div>
          </CardContent>
        </Card>

        {/* OpenAI */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">OpenAI</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium">API Key</label>
              <Input type="password" placeholder="sk-..." className="mt-1" />
            </div>
          </CardContent>
        </Card>

        {/* Anthropic */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Anthropic</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium">API Key</label>
              <Input type="password" placeholder="sk-ant-..." className="mt-1" />
            </div>
          </CardContent>
        </Card>

        {/* Calendly */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Calendly</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium">API Key</label>
              <Input type="password" placeholder="eyJ..." className="mt-1" />
            </div>
            <div>
              <label className="text-sm font-medium">Event Type URL</label>
              <Input
                placeholder="https://calendly.com/..."
                className="mt-1"
              />
            </div>
          </CardContent>
        </Card>

        {/* Shotstack */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Shotstack</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium">API Key</label>
              <Input type="password" placeholder="..." className="mt-1" />
            </div>
          </CardContent>
        </Card>

        <Separator />

        {/* CPL Config */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              Calcul CPL Organique
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div>
              <label className="text-sm font-medium">
                Taux horaire (€/h)
              </label>
              <Input
                type="number"
                defaultValue={50}
                className="mt-1 w-32"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Utilisé pour calculer le coût par lead organique
              </p>
            </div>
          </CardContent>
        </Card>

        <Button onClick={handleSave} className="gap-2">
          <Save className="h-4 w-4" />
          {saved ? "Sauvegardé !" : "Sauvegarder"}
        </Button>
      </div>
    </>
  );
}
