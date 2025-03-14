
import { Spinner } from "@/components/ui/spinner";

// Composant de chargement avec animation pour Suspense
const LoadingFallback = () => (
  <div className="flex items-center justify-center h-screen bg-[#f5f2ee]">
    <Spinner className="h-10 w-10 text-[#B88E23]" />
  </div>
);

export default LoadingFallback;
