import { GalaxyMap } from './components/GalaxyMap/GalaxyMap';
import { Sidebar } from './components/Sidebar/Sidebar';
import { RelativityPanel } from './components/Calculator/RelativityPanel';

function App() {
  return (
    <div className="w-full h-full relative bg-space-900">
      <GalaxyMap />
      <Sidebar />
      <RelativityPanel />
    </div>
  );
}

export default App;
