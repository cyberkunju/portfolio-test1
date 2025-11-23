import React from 'react';
import { Section, CONTENT } from '../constants';

interface OverlayProps {
  activeSection: Section;
  onNavigate: (section: Section) => void;
}

const NavButton: React.FC<{ 
  label: string; 
  active: boolean; 
  onClick: () => void 
}> = ({ label, active, onClick }) => (
  <button
    onClick={onClick}
    className={`
      relative group px-4 py-2 text-sm font-mono tracking-widest uppercase transition-all duration-300
      ${active ? 'text-neuro-cyan' : 'text-gray-500 hover:text-white'}
    `}
  >
    <span className={`absolute left-0 top-1/2 -translate-y-1/2 w-1 h-1 bg-current transition-all duration-300 ${active ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`} />
    <span className="ml-4">{label}</span>
    {active && <span className="absolute bottom-0 right-0 w-full h-[1px] bg-neuro-cyan shadow-[0_0_10px_#00f3ff]" />}
  </button>
);

const Overlay: React.FC<OverlayProps> = ({ activeSection, onNavigate }) => {
  
  const renderContent = () => {
    switch (activeSection) {
      case Section.INTRO:
        return (
          <div className="animate-fadeInSlideUp">
            <h2 className="text-neuro-cyan font-mono text-sm tracking-[0.3em] mb-2 animate-pulse">
              SYSTEM_ID: {CONTENT.alias}
            </h2>
            <h1 className="text-6xl md:text-8xl font-sans font-bold text-white leading-none mb-4 tracking-tighter mix-blend-difference">
              {CONTENT.headline}
            </h1>
            <div className="h-[2px] w-24 bg-neuro-purple mb-6 shadow-[0_0_15px_#bd00ff]"></div>
            <p className="text-xl text-gray-300 font-mono max-w-md border-l border-gray-700 pl-4">
              {CONTENT.subHeadline}
            </p>
            <p className="mt-8 text-sm text-gray-500 font-mono animate-bounce">
              [ SCROLL OR NAVIGATE TO INITIATE UPLINK ]
            </p>
          </div>
        );
      case Section.ABOUT:
        return (
          <div className="animate-fadeInSlideRight max-w-lg bg-black/30 backdrop-blur-sm p-8 border-l-2 border-neuro-cyan">
             <h3 className="text-4xl font-bold text-white mb-6">Abstract Logic</h3>
             <p className="text-lg text-gray-300 font-sans leading-relaxed mb-6">
               {CONTENT.aboutText}
             </p>
             <div className="grid grid-cols-2 gap-4 font-mono text-xs text-neuro-cyan">
                <div className="border border-gray-800 p-2">TSX :: REACT_THREE_FIBER</div>
                <div className="border border-gray-800 p-2">PYTHON :: PYTORCH</div>
                <div className="border border-gray-800 p-2">GLSL :: SHADERS</div>
                <div className="border border-gray-800 p-2">NODE :: NEURAL_NETS</div>
             </div>
          </div>
        );
      case Section.PROJECTS:
        return (
          <div className="animate-fadeInSlideLeft max-w-2xl">
            <h3 className="text-4xl font-bold text-white mb-8 text-right">Selected Experiments</h3>
            <div className="space-y-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="group relative border-b border-gray-800 pb-4 text-right cursor-pointer hover:pl-4 transition-all">
                  <div className="absolute right-full top-0 h-full w-1 bg-neuro-purple opacity-0 group-hover:opacity-100 transition-opacity mr-4 shadow-[0_0_10px_#bd00ff]" />
                  <h4 className="text-2xl font-mono text-gray-200 group-hover:text-neuro-cyan transition-colors">
                    Project_0{i} // CORTEX_VISUALIZER
                  </h4>
                  <p className="text-gray-500 text-sm mt-1">
                    WebGL Real-time Data Processing
                  </p>
                </div>
              ))}
            </div>
          </div>
        );
      case Section.CONTACT:
        return (
          <div className="animate-zoomIn text-center">
            <h3 className="text-5xl font-bold text-white mb-2">Connect</h3>
            <p className="text-neuro-cyan font-mono text-sm tracking-widest mb-8">OPEN_PORTS: 80, 443, 22</p>
            <a href="#" className="inline-block border border-white px-8 py-3 text-white font-mono hover:bg-white hover:text-black transition-colors duration-300">
              INITIATE_HANDSHAKE()
            </a>
            <div className="mt-12 text-xs text-gray-600 font-mono">
              ENCRYPTION: ENABLED<br/>
              LATENCY: 12ms
            </div>
          </div>
        );
    }
  };

  return (
    <div className="pointer-events-none absolute inset-0 flex flex-col justify-between p-8 md:p-12 z-10">
      {/* Header */}
      <header className="pointer-events-auto flex justify-between items-start">
        <div className="text-white font-bold tracking-tighter text-xl border-b-2 border-white pb-1">
          NK_V1.0
        </div>
        <nav className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-8 items-end md:items-center backdrop-blur-md bg-black/20 p-2 rounded">
          {(Object.values(Section) as Section[]).map((sec) => (
            <NavButton
              key={sec}
              label={sec}
              active={activeSection === sec}
              onClick={() => onNavigate(sec)}
            />
          ))}
        </nav>
      </header>

      {/* Dynamic Main Content Area */}
      <main className="pointer-events-auto flex-grow flex items-center justify-center md:justify-start md:pl-10">
        {renderContent()}
      </main>

      {/* Footer */}
      <footer className="flex justify-between items-end pointer-events-auto">
        <div className="hidden md:block text-xs font-mono text-gray-500 max-w-xs">
          STATUS: OPERATIONAL<br />
          MEM_USAGE: 34%<br />
          RENDER: R3F_WEBGL
        </div>
        <div className="text-right">
           <p className="text-neuro-cyan font-mono text-sm animate-pulse">
             &gt; {CONTENT.tagline}
           </p>
        </div>
      </footer>

      <style>{`
        @keyframes fadeInSlideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeInSlideRight {
          from { opacity: 0; transform: translateX(-20px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes fadeInSlideLeft {
          from { opacity: 0; transform: translateX(20px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes zoomIn {
          from { opacity: 0; transform: scale(0.9); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-fadeInSlideUp { animation: fadeInSlideUp 1s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .animate-fadeInSlideRight { animation: fadeInSlideRight 0.8s ease-out forwards; }
        .animate-fadeInSlideLeft { animation: fadeInSlideLeft 0.8s ease-out forwards; }
        .animate-zoomIn { animation: zoomIn 0.5s ease-out forwards; }
      `}</style>
    </div>
  );
};

export default Overlay;