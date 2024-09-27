import { CardContainer } from "@/components/CardContainer";
import SignUp from "@/components/SignUp";
import { Boxes } from "@/components/ui/background-boxes";

export default function Home() {
  return (
    <div>
      <main className="absolute inset-0 w-full h-full bg-slate-900 z-20">
        <div className="h-full relative w-full overflow-hidden bg-slate-900 flex flex-col items-center justify-center rounded-lg">
          <Boxes />
          <CardContainer>
            <SignUp />
          </CardContainer>
        </div>
      </main>
    </div>
  );
}
