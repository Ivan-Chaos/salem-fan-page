import { Panel } from "@/components/panel";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// Placeholder content — swap in real quotes and episodes later.
const TICKER = [
  "All hail Salem, future ruler of the world",
  "Feed the cat",
  "A hundred years as a cat is cruel and unusual",
  "Now with fifty percent more sarcasm",
];

const QUOTES = [
  "Placeholder: a scheme for world domination, delivered from the kitchen counter.",
  "Placeholder: a complaint about the quality of the tuna.",
  "Placeholder: an unsolicited opinion on Sabrina's love life.",
];

const EPISODES = [
  { season: "I", title: "Placeholder episode title", note: "Why it rules" },
  { season: "II", title: "Placeholder episode title", note: "Why it rules" },
  { season: "III", title: "Placeholder episode title", note: "Why it rules" },
];

export default function Home() {
  const ticker = TICKER.join("   ✦   ");

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-10 px-4 py-12">
      <header className="flex flex-col items-center gap-3 text-center">
        <p className="font-heading text-xs tracking-[0.35em] text-salem-eye uppercase">
          Welcome to
        </p>
        <h1 className="text-glow font-script text-6xl leading-tight text-primary-foreground sm:text-7xl">
          Salem&apos;s Lair
        </h1>
        <p className="text-xl text-muted-foreground italic">
          A devoted shrine to Salem Saberhagen, warlock, cat, and would-be
          ruler of the world
        </p>
      </header>

      <div className="overflow-hidden border-y border-salem-eye/20 py-2 text-lg text-salem-eye/80 italic">
        <div className="flex w-max animate-marquee whitespace-nowrap">
          <span className="pr-12">{ticker}   ✦</span>
          <span className="pr-12" aria-hidden>
            {ticker}   ✦
          </span>
        </div>
      </div>

      <Panel title="About Salem">
        <div className="flex flex-col gap-3 text-xl leading-snug">
          <p>
            Salem Saberhagen was once a 500-year-old warlock. Then he tried to
            take over the world, and the Witches&apos; Council sentenced him to
            100 years as a house cat with the Spellman family.
          </p>
          <p>He has not stopped scheming, sulking, or demanding snacks since.</p>
          <div className="flex flex-wrap gap-3 pt-2">
            <Tooltip>
              <TooltipTrigger render={<Button size="lg" />}>
                Sign the guestbook
              </TooltipTrigger>
              <TooltipContent className="text-base">
                Coming soon, like world domination
              </TooltipContent>
            </Tooltip>
            <Button variant="gold" size="lg">
              Feed Salem
            </Button>
          </div>
        </div>
      </Panel>

      <Panel title="The Salem files">
        <Tabs defaultValue="bio">
          <TabsList variant="line" className="w-full justify-center">
            {[
              ["bio", "Bio"],
              ["quotes", "Quotes"],
              ["episodes", "Favourites"],
            ].map(([value, label]) => (
              <TabsTrigger
                key={value}
                value={value}
                className="flex-none px-4 font-heading text-xs tracking-[0.15em] uppercase data-active:text-salem-eye!"
              >
                {label}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="bio" className="pt-4 text-xl">
            <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-1">
              <dt className="text-salem-eye italic">Name</dt>
              <dd>Salem Saberhagen</dd>
              <dt className="text-salem-eye italic">Species</dt>
              <dd>Warlock (currently: cat)</dd>
              <dt className="text-salem-eye italic">Sentence</dt>
              <dd>100 years, no parole</dd>
              <dt className="text-salem-eye italic">Hobbies</dt>
              <dd>Plotting, napping, tuna</dd>
            </dl>
          </TabsContent>

          <TabsContent value="quotes" className="pt-4 text-xl">
            <ul className="flex flex-col gap-2">
              {QUOTES.map((quote) => (
                <li key={quote} className="italic before:mr-2 before:text-salem-eye before:content-['✦']">
                  {quote}
                </li>
              ))}
            </ul>
          </TabsContent>

          <TabsContent value="episodes" className="pt-4 text-xl">
            <ul className="flex flex-col gap-2">
              {EPISODES.map((ep, i) => (
                <li key={i} className="flex gap-3">
                  <span className="font-heading text-sm leading-7 text-salem-eye">
                    {ep.season}
                  </span>
                  <span>
                    {ep.title} — <span className="text-muted-foreground italic">{ep.note}</span>
                  </span>
                </li>
              ))}
            </ul>
          </TabsContent>
        </Tabs>
      </Panel>

      <footer className="mt-auto flex flex-col items-center gap-3 text-center">
        <Separator className="bg-linear-to-r from-transparent via-salem-eye/40 to-transparent" />
        <p className="font-script text-3xl text-muted-foreground">
          Made with mischief in Westbridge
        </p>
      </footer>
    </div>
  );
}
