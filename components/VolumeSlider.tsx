
import { Slider } from "@/components/ui/slider"
import { Volume } from "lucide-react"

export default function Volumer() {
  return (
    <div className="mt-4 flex w-full items-center justify-between">
      <Volume/>
      <Slider defaultValue={[75]} aria-label="Simple slider" />
    </div>
  )
}
