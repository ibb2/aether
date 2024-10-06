/**
 * v0 by Vercel.
 * @see https://v0.dev/t/RzXQWXjnx53
 * Documentation: https://v0.dev/docs#integrating-generated-code-into-your-nextjs-app
 */

import { Input } from "@/components/ui/input";
import { Button } from "../ui/Button";
import React from "react";
import { evolu } from "@/db/db";
import { cn } from "@/lib/utils";
import { Check, Clipboard } from "lucide-react";
import {
  Mnemonic,
  Owner,
  parseMnemonic,
  useEvolu,
  useOwner,
} from "@evolu/react";
import { Effect, Exit } from "effect";

export default function CopySecret() {
  const evolu = useEvolu();

  const [mnemonic, setMnemonic] = React.useState("");
  const [copied, onCopied] = React.useState(false);
  const [blurred, onBlurred] = React.useState(true);
  const [isAnimating, setIsAnimating] = React.useState(false);

  const owner = useOwner();

  React.useEffect(() => {
    if (owner && owner.mnemonic) {
      setMnemonic(owner.mnemonic);
    }
  }, [owner]);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(mnemonic);
    onCopied(true);
    setIsAnimating(true);

    setTimeout(() => {
      setIsAnimating(false);
      setTimeout(() => onCopied(false), 300); // Reset after animation
    }, 1000);
  };

  const updateMnemonic = () => {
    console.log("Mnemonic", mnemonic);
    parseMnemonic(mnemonic)
      .pipe(Effect.runPromiseExit)
      .then(
        Exit.match({
          onFailure: () => {},
          onSuccess: (m) => {
            evolu.restoreOwner(m);
          },
        }),
      );
  };

  return (
    <div className="w-full  space-y-4">
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <Input
            // value={mnemonic}
            readOnly
            defaultValue={mnemonic}
            onChange={(e) => setMnemonic(e.target.value)}
          />
          <Button
            variant="ghost"
            size="icon"
            onClick={copyToClipboard}
            className="max-w-15"
          >
            {copied ? <Check className="text-green-600" /> : <Clipboard />}
          </Button>
          {/* <Button variant="secondary" onClick={updateMnemonic}>
            update
          </Button> */}
          {/* {copied && <span className="text-green-400">Copied</span>} */}
        </div>
      </div>
    </div>
  );
}
