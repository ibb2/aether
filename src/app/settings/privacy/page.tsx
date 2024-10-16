"use client";

import CopySecret from "@/components/copy/CopySecret";
import { Button } from "@/components/ui/Button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { evolu } from "@/db/db";
import { useRouter } from "next/navigation";
import React from "react";

export default function Privacy() {
  const [render, onRender] = React.useState<boolean>(true);
  const [switchState, setSwitchState] = React.useState<boolean>(true);
  const [analyticsEnabled, setAnalyticsEnabled] = React.useState(1);

  const handleAnalytics = () => {};

  const toggleSwitch = (state: boolean) => {
    // On switch change handle convert the bool val to int representation
    // This is then stored into the analytics_allowed value for persistance across refreshes.

    setSwitchState(state);
    window.localStorage.setItem(
      "analytics_allowed",
      JSON.stringify(state ? 1 : 0),
    );
  };

  React.useEffect(() => {
    // Handles setting the user analytics

    // Get the analytics_allowed localstorage on page load to check it's value
    // This is injected into the switch.
    const analyticsChoice = window.localStorage.getItem("analytics_allowed");

    if (render) {
      if (analyticsChoice !== null) {
        setSwitchState(JSON.parse(analyticsChoice));
        onRender(false);
      }
    }

    setAnalyticsEnabled(switchState ? 1 : 0);
  }, [switchState, analyticsEnabled, render]);

  return (
    <div className="flex min-h-screen w-full flex-col">
      <main className="flex min-h-[calc(100vh_-_theme(spacing.16))] flex-1 flex-col gap-4 bg-muted/40 p-4 md:gap-8 md:p-10">
        <div className="grid gap-6">
          <Card x-chunk="dashboard-04-chunk-1" className="grid gap-3 ">
            <CardHeader>
              <CardTitle>Privacy</CardTitle>
              <CardDescription>Privacy related settings.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-x-20 gap-y-5">
              <div className="flex flex-col">
                <div className="flex justify-between items-center">
                  <div className="grid">
                    <Label htmlFor="mnemonic" className="text-lg">
                      Provide analytics
                    </Label>
                    <span className="text-sm font-light text-gray-400">
                      Basic analytics gathered via PostHog.
                    </span>
                  </div>
                  <Switch
                    checked={switchState}
                    onCheckedChange={() => toggleSwitch(!switchState)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
