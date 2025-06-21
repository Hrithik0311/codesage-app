
"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from './Navbar';
import HeroSection from './HeroSection';
import FeaturesSection from './FeaturesSection';
import StatsSection from './StatsSection';
import Footer from './Footer';
import CodeSageModal, { ModalButton } from './CodeSageModal';
import LoadingIndicator from './LoadingIndicator';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import {
  Zap, Brain, Search, Rocket, Users, Target, CheckCircle2, PartyPopper, Laptop, BarChartBig, Handshake, FileUp, Bug, Trophy, PlusCircle, Link as LinkIcon, AlertTriangle, Lightbulb,
} from 'lucide-react';


interface ModalState {
  isOpen: boolean;
  title: string;
  content: React.ReactNode;
  buttons: ModalButton[];
}

const HomePageClient: React.FC = () => {
  const { toast } = useToast();
  const router = useRouter();
  const [modalState, setModalState] = useState<ModalState>({
    isOpen: false,
    title: '',
    content: null,
    buttons: [],
  });
  const [loadingState, setLoadingState] = useState({ isVisible: false, message: '' });

  const openModal = (title: string, content: React.ReactNode, buttons: ModalButton[]) => {
    setModalState({ isOpen: true, title, content, buttons });
  };

  const closeModal = () => {
    setModalState(prev => ({ ...prev, isOpen: false }));
  };
  
  const showLoadingScreen = (message: string, callback: () => void, duration: number = 2000) => {
    setLoadingState({ isVisible: true, message });
    setTimeout(() => {
      setLoadingState({ isVisible: false, message: '' });
      callback();
    }, duration);
  };

  const scrollToSection = (sectionId: string) => {
    const section = document.getElementById(sectionId);
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' });
    }
  };
  
  const handleCtaClick = () => {
    const content = (
      <div className="text-left space-y-4">
        <h3 className="text-xl font-semibold font-headline text-foreground">🚀 Welcome to CodeSage Professional</h3>
        <p className="text-foreground/80">Choose your development path:</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          {[
            { icon: Brain, title: "Beginner Track", desc: "Start with fundamentals", track: "beginner" },
            { icon: Zap, title: "Advanced Track", desc: "Jump into complex projects", track: "advanced" },
            { icon: Users, title: "Team Lead", desc: "Manage team projects", track: "team" },
          ].map(opt => (
            <Button key={opt.track} variant="outline" className="h-auto p-4 flex flex-col items-center gap-2 text-left hover:bg-accent/10 hover:border-accent transition-all" onClick={() => startPlatform(opt.track)}>
              <opt.icon className="w-8 h-8 text-accent mb-2" />
              <h4 className="font-semibold text-foreground">{opt.title}</h4>
              <p className="text-sm text-foreground/70">{opt.desc}</p>
            </Button>
          ))}
        </div>
      </div>
    );
    openModal('Launch Platform', content, [
      { text: 'Cancel', action: closeModal, variant: 'outline' },
      { text: 'Get Started', action: showWelcome, isPrimary: true },
    ]);
  };

  const startPlatform = (track: string) => {
    closeModal(); 
    const trackNames: { [key: string]: string } = {
      beginner: 'Beginner Development Track',
      advanced: 'Advanced Engineering Track',
      team: 'Team Leadership Track'
    };
    const content = (
      <div className="text-left space-y-4">
        <h3 className="flex items-center gap-2 text-xl font-semibold font-headline text-foreground"><Target className="text-accent" /> {trackNames[track]}</h3>
        <p className="text-foreground/80">You've selected the {trackNames[track].toLowerCase()}. Here's what you'll get:</p>
        <ul className="list-none space-y-2 text-foreground/90">
          {["Personalized learning dashboard", "AI-powered code assistance", "Real-time collaboration tools", "Competition preparation modules", "24/7 technical support"].map(item => (
            <li key={item} className="flex items-center gap-2"><CheckCircle2 className="w-5 h-5 text-green-500" /> {item}</li>
          ))}
        </ul>
        <p className="text-foreground/80 pt-2"><strong>Ready to begin your journey?</strong></p>
      </div>
    );
    openModal('Track Selected', content, [
      { text: 'Back', action: handleCtaClick, variant: 'outline' },
      { text: 'Start Now', action: completeRegistration, isPrimary: true },
    ]);
  };

  const showWelcome = () => {
    closeModal();
    const content = (
      <div className="text-center space-y-4">
        <PartyPopper className="w-16 h-16 text-accent mx-auto" />
        <h3 className="text-2xl font-semibold font-headline text-foreground">Welcome to CodeSage!</h3>
        <p className="text-foreground/80">Your account has been created successfully. You now have access to:</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 text-left">
          {[
            { icon: Brain, text: "AI Learning Assistant" }, { icon: Laptop, text: "Cloud IDE" },
            { icon: BarChartBig, text: "Performance Analytics" }, { icon: Handshake, text: "Team Collaboration" },
          ].map(item => (
            <div key={item.text} className="flex items-center gap-3 p-3 bg-foreground/5 rounded-lg">
              <item.icon className="w-6 h-6 text-accent" />
              <span className="text-foreground/90">{item.text}</span>
            </div>
          ))}
        </div>
      </div>
    );
    openModal('Account Created', content, [
      { text: 'Go to Dashboard', action: goToDashboard, isPrimary: true },
    ]);
  };
  
  const completeRegistration = () => {
    closeModal();
    showLoadingScreen('Creating your account...', showWelcome);
  };

  const goToDashboard = () => {
    closeModal();
    showLoadingScreen('Loading dashboard...', () => {
      toast({ title: "🎯 Dashboard Loaded!", description: "You're now ready to start coding." });
    });
  };

  const launchFeatureModal = (feature: string) => {
    const commonButtons = [
      { text: 'Cancel', action: closeModal, variant: 'outline' as const },
    ];

    let modalTitle = '', modalContent: React.ReactNode = null, modalButtons: ModalButton[] = [];

    switch (feature) {
      case 'learning':
        router.push('/learning');
        return;
      case 'analysis':
        router.push('/code-intelligence');
        return;
      case 'collaboration':
        modalTitle = '🚀 Team Collaboration Hub';
        modalContent = (
          <div className="text-left space-y-4">
            <h3 className="text-xl font-semibold font-headline text-foreground">Connect with Your FTC Team</h3>
            <p className="text-foreground/80">Create or join a team workspace:</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2 text-left hover:bg-accent/10 hover:border-accent" onClick={createTeam}>
                <PlusCircle className="w-8 h-8 text-accent mb-2" />
                <h4 className="font-semibold text-foreground">Create New Team</h4>
                <p className="text-sm text-foreground/70">Start a new workspace</p>
              </Button>
              <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2 text-left hover:bg-accent/10 hover:border-accent" onClick={joinTeam}>
                <LinkIcon className="w-8 h-8 text-accent mb-2" />
                <h4 className="font-semibold text-foreground">Join Existing Team</h4>
                <p className="text-sm text-foreground/70">Enter a team code</p>
              </Button>
            </div>
             <h4 className="font-semibold text-foreground pt-2">Team Features:</h4>
             <ul className="list-none space-y-2 text-foreground/90">
                {["Real-time code collaboration", "Shared project repositories", "Team progress tracking", "Competition prep tools"].map(item => (
                  <li key={item} className="flex items-center gap-2"><CheckCircle2 className="w-5 h-5 text-green-500" /> {item}</li>
                ))}
            </ul>
          </div>
        );
        modalButtons = [...commonButtons, { text: 'Learn More', action: showTeamDemo, variant: 'secondary' }];
        break;
    }
    if (modalTitle && modalContent) { // Ensure modal is only opened if content is set
        openModal(modalTitle, modalContent, modalButtons);
    }
  };

  const startFreeTrial = (feature: string) => {
    closeModal();
    showLoadingScreen('Starting your free trial...', () => {
      toast({ title: "🆓 Free trial activated!", description: `You have 14 days of full access to ${feature}.` });
    });
  };

  const triggerFileUpload = () => {
    toast({ title: "📁 File Upload", description: "File upload dialog would open here." });
  };

  const analyzeSampleCode = () => {
    closeModal();
    showLoadingScreen('Analyzing sample FTC robot code...', () => {
      const resultsContent = (
        <div className="text-left space-y-4">
          <h3 className="text-xl font-semibold font-headline text-foreground">📊 Analysis Complete</h3>
          <div className="flex justify-center my-4">
            <div className="w-32 h-32 rounded-full bg-gradient-to-br from-primary to-accent flex flex-col items-center justify-center text-primary-foreground">
              <span className="text-4xl font-bold">87</span>
              <span className="text-sm">Quality Score</span>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              { icon: CheckCircle2, text: "Clean code structure", color: "text-green-500" },
              { icon: AlertTriangle, text: "3 performance improvements", color: "text-yellow-500" },
              { icon: CheckCircle2, text: "Good error handling", color: "text-green-500" },
              { icon: Lightbulb, text: "2 optimization suggestions", color: "text-blue-400" },
            ].map(item => (
              <div key={item.text} className="flex items-center gap-2 p-3 bg-foreground/5 rounded-lg">
                <item.icon className={`w-5 h-5 ${item.color}`} /> <span className="text-sm text-foreground/90">{item.text}</span>
              </div>
            ))}
          </div>
        </div>
      );
      openModal('Code Analysis Results', resultsContent, [
        { text: 'View Report', action: viewDetailedReport, isPrimary: true },
        { text: 'Analyze My Code', action: startCodeAnalysis, variant: 'outline' },
      ]);
    });
  };

  const startCodeAnalysis = () => {
    closeModal(); 
    toast({ title: "📤 Code Analysis Initiated", description: "AI Code analysis would start for your uploaded code." });
  };
  
  const createTeam = () => {
    closeModal();
    const content = (
      <div className="space-y-4">
        <h3 className="text-xl font-semibold font-headline text-foreground">Create New Team</h3>
        <form className="space-y-3">
          <div><label htmlFor="teamName" className="block text-sm font-medium text-foreground/80 mb-1">Team Name</label><Input id="teamName" placeholder="Enter your team name" /></div>
          <div><label htmlFor="teamNumber" className="block text-sm font-medium text-foreground/80 mb-1">Team Number (Optional)</label><Input id="teamNumber" placeholder="FTC Team #" /></div>
          <div>
            <label htmlFor="teamRegion" className="block text-sm font-medium text-foreground/80 mb-1">Region</label>
            <Select>
              <SelectTrigger id="teamRegion"><SelectValue placeholder="Select your region" /></SelectTrigger>
              <SelectContent>{["North America", "Europe", "Asia Pacific", "Other"].map(r => <SelectItem key={r} value={r.toLowerCase().replace(' ','-')}>{r}</SelectItem>)}</SelectContent>
            </Select>
          </div>
        </form>
      </div>
    );
    openModal('Create Team', content, [
      { text: 'Cancel', action: closeModal, variant: 'outline' },
      { text: 'Create Team', action: finalizeTeamCreation, isPrimary: true },
    ]);
  };

  const joinTeam = () => {
    closeModal();
    const content = (
      <div className="space-y-4">
        <h3 className="text-xl font-semibold font-headline text-foreground">Join Existing Team</h3>
        <p className="text-foreground/80">Enter the team code provided by your team leader:</p>
        <div><Input id="teamCode" placeholder="Enter team code (e.g., ABC-123-XYZ)" className="text-center text-lg tracking-wider" /></div>
      </div>
    );
    openModal('Join Team', content, [
      { text: 'Cancel', action: closeModal, variant: 'outline' },
      { text: 'Join Team', action: finalizeTeamJoin, isPrimary: true },
    ]);
  };

  const finalizeTeamCreation = () => {
    closeModal();
    showLoadingScreen('Creating your team workspace...', () => {
      toast({ title: "🎉 Team created successfully!", description: "Team code: ABC-123-XYZ. Share this with your team members."});
    });
  };

  const finalizeTeamJoin = () => {
    closeModal();
    showLoadingScreen('Joining team workspace...', () => {
      toast({ title: "🤝 Successfully joined Robo Warriors!", description: "Welcome to the team." });
    });
  };

  const showTeamDemo = () => {
    closeModal();
    toast({ title: "🎥 Team Demo", description: "Team collaboration demo would play here." });
  };

  const viewDetailedReport = () => {
    closeModal();
    toast({ title: "📋 Detailed Report", description: "Detailed analysis report would open here." });
  };
  
  const showEnterpriseInfo = () => {
    openModal('🏢 Enterprise Solutions', 
    <div className="text-left space-y-3">
        <p className="text-foreground/80">CodeSage offers tailored solutions for large organizations and educational institutions.</p>
        <ul className="list-disc list-inside space-y-1 text-foreground/90">
            <li>Custom feature sets</li>
            <li>On-premise deployment options</li>
            <li>Dedicated support and SLAs</li>
            <li>Advanced analytics and reporting</li>
        </ul>
        <p className="text-foreground/80">Contact us to learn more about how CodeSage can empower your entire organization.</p>
    </div>, 
    [{ text: 'Close', action: closeModal, variant: 'outline' }, {text: 'Contact Sales', action: showContactForm, isPrimary: true}]);
  };

  const showContactForm = () => {
      closeModal();
      const content = (
          <form className="space-y-4">
              <div>
                  <label htmlFor="contactName" className="block text-sm font-medium text-foreground/80 mb-1">Full Name</label>
                  <Input id="contactName" placeholder="Your Name" />
              </div>
              <div>
                  <label htmlFor="contactEmail" className="block text-sm font-medium text-foreground/80 mb-1">Email Address</label>
                  <Input id="contactEmail" type="email" placeholder="your@email.com" />
              </div>
              <div>
                  <label htmlFor="contactMessage" className="block text-sm font-medium text-foreground/80 mb-1">Message</label>
                  <textarea id="contactMessage" rows={4} className="w-full p-2 rounded-md bg-input border border-border text-foreground placeholder:text-muted-foreground" placeholder="Your inquiry..."></textarea>
              </div>
          </form>
      );
      openModal('📞 Contact Us', content, [
          { text: 'Cancel', action: closeModal, variant: 'outline' },
          { text: 'Send Message', action: () => {
              closeModal();
              showLoadingScreen("Sending your message...", () => {
                toast({ title: "📬 Message Sent!", description: "We'll get back to you shortly." });
              });
          }, isPrimary: true },
      ]);
  };

  const [pageLoaded, setPageLoaded] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => setPageLoaded(true), 100); 
    return () => clearTimeout(timer);
  }, []);


  return (
    <div className={`transition-opacity duration-500 ease-in-out ${pageLoaded ? 'opacity-100' : 'opacity-0'}`}>
      <Navbar 
        onEnterpriseClick={showEnterpriseInfo} 
        onContactClick={showContactForm}
        onPlatformClick={() => scrollToSection('features')}
        onFeaturesClick={() => scrollToSection('stats')}
      />
      <HeroSection onCtaClick={handleCtaClick} />
      <FeaturesSection onFeatureClick={launchFeatureModal} />
      <StatsSection />
      <Footer />
      <CodeSageModal
        isOpen={modalState.isOpen}
        onClose={closeModal}
        title={modalState.title}
        buttons={modalState.buttons}
      >
        {modalState.content}
      </CodeSageModal>
      <LoadingIndicator isVisible={loadingState.isVisible} message={loadingState.message} />
    </div>
  );
};

export default HomePageClient;
