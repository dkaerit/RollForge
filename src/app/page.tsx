import { RollForgeClient } from './roll-forge-client';
import { useToast } from '@/hooks/use-toast';

export default function Home() {
  useToast(); // Temporary call for debugging build process
  return <RollForgeClient />;
}
