
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
import { Textarea } from '@/components/ui/textarea';
import {
  Zap, Brain, Search, Rocket, Users, Target, CheckCircle2, PartyPopper, Laptop, BarChartBig, Handshake, FileUp, Bug, Trophy, PlusCircle, Link as LinkIcon, AlertTriangle, Lightbulb, LogIn, Shield,
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

  const [newTeamName, setNewTeamName] = useState('');
  const [newTeamMembers, setNewTeamMembers] = useState('');
  const [joinUserName, setJoinUserName] = useState('');
  const [createdTeamDetails, setCreatedTeamDetails] = useState<{name: string, pin: string} | null>(null);

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
      { text: 'Get Started', action: () => { closeModal(); showWelcome(); }, isPrimary: true },
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
      { text: 'Back', action: () => { closeModal(); handleCtaClick(); }, variant: 'outline' },
      { text: 'Start Now', action: () => { closeModal(); completeRegistration(); }, isPrimary: true },
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
      { text: 'Go to Dashboard', action: () => { closeModal(); goToDashboard(); }, isPrimary: true },
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
    switch (feature) {
      case 'learning':
        router.push('/learning');
        return;
      case 'analysis':
        router.push('/code-intelligence');
        return;
      case 'collaboration':
        const content = (
          <div className="text-center space-y-6">
            <Users className="w-16 h-16 text-accent mx-auto" />
            <h3 className="text-2xl font-semibold font-headline text-foreground">Team Collaboration Hub</h3>
            <p className="text-foreground/80 max-w-md mx-auto">
              Create a secure workspace to build with your team, or join an existing project using a team PIN.
            </p>
          </div>
        );
        openModal('Welcome to the Hub', content, [
          { text: 'Create New Team', action: createTeam, variant: 'outline', className: 'w-full sm:w-auto' },
          { text: 'Join Existing Team', action: joinTeam, isPrimary: true, className: 'w-full sm:w-auto' },
        ]);
        return;
    }
  };

  const createTeam = () => {
    closeModal();
    const content = (
      <div className="space-y-4 text-left">
        <h3 className="text-xl font-semibold font-headline text-foreground flex items-center gap-2"><PlusCircle className="text-accent" /> Create a New Team</h3>
        <p className="text-foreground/80">Fill in your team's details to generate a new workspace and a unique PIN for members to join.</p>
        <form className="space-y-4 pt-2">
          <div>
            <label htmlFor="teamName" className="block text-sm font-medium text-foreground/80 mb-1">Team Name</label>
            <Input id="teamName" placeholder="e.g., The RoboKnights" value={newTeamName} onChange={(e) => setNewTeamName(e.target.value)} />
          </div>
          <div>
            <label htmlFor="teamNumber" className="block text-sm font-medium text-foreground/80 mb-1">FTC Team Number (Optional)</label>
            <Input id="teamNumber" type="number" placeholder="e.g., 12345" />
          </div>
          <div>
            <label htmlFor="teamMembers" className="block text-sm font-medium text-foreground/80 mb-1">Team Members (comma-separated)</label>
            <Textarea id="teamMembers" placeholder="e.g., Alex, Maria, Sam" value={newTeamMembers} onChange={(e) => setNewTeamMembers(e.target.value)} rows={3}/>
          </div>
        </form>
      </div>
    );
    openModal('Create Team Workspace', content, [
      { text: 'Cancel', action: () => { closeModal(); launchFeatureModal('collaboration'); }, variant: 'ghost' },
      { text: 'Generate Team PIN', action: finalizeTeamCreation, isPrimary: true },
    ]);
  };

  const joinTeam = () => {
    closeModal();
    const content = (
      <div className="space-y-4 text-left">
        <h3 className="text-xl font-semibold font-headline text-foreground flex items-center gap-2"><LogIn className="text-accent" /> Join an Existing Team</h3>
        <p className="text-foreground/80">Enter your name and the 6-digit PIN provided by your team lead to get access to the workspace.</p>
        <div className="pt-2 space-y-4">
          <div>
            <label htmlFor="userName" className="block text-sm font-medium text-foreground/80 mb-1">Your Name</label>
            <Input id="userName" placeholder="e.g., Alex Johnson" value={joinUserName} onChange={(e) => setJoinUserName(e.target.value)} />
          </div>
          <div>
            <label htmlFor="teamCode" className="block text-sm font-medium text-foreground/80 mb-1">Team PIN</label>
            <Input id="teamCode" placeholder="______" className="text-center text-2xl font-mono tracking-[0.5em]" maxLength={6} />
          </div>
        </div>
      </div>
    );
    openModal('Join Team Workspace', content, [
      { text: 'Cancel', action: () => { closeModal(); launchFeatureModal('collaboration'); }, variant: 'ghost' },
      { text: 'Join Team', action: finalizeTeamJoin, isPrimary: true },
    ]);
  };

  const finalizeTeamCreation = () => {
    if (!newTeamName.trim()) {
      toast({ title: "Team Name Required", description: "Please enter a name for your team.", variant: "destructive" });
      createTeam();
      return;
    }
    closeModal();
    const newPin = Math.floor(100000 + Math.random() * 900000).toString();
    setCreatedTeamDetails({ name: newTeamName, pin: newPin });
    showLoadingScreen('Generating your secure workspace...', () => {
      const content = (
        <div className="text-center space-y-4">
          <Shield className="w-16 h-16 text-green-500 mx-auto" />
          <h3 className="text-2xl font-semibold font-headline text-foreground">Workspace for "{newTeamName}" Created!</h3>
          <p className="text-foreground/80">Share this secure PIN with your team members so they can join.</p>
          <div className="bg-muted p-4 rounded-lg">
            <p className="text-sm text-muted-foreground">Your Team PIN is:</p>
            <p className="text-4xl font-bold font-mono tracking-widest text-primary">{newPin}</p>
          </div>
          <p className="text-xs text-muted-foreground pt-2">You will be redirected to your new collaboration hub.</p>
        </div>
      );
      openModal(`Team "${newTeamName}" Created`, content, [
        { text: 'Go to Collaboration Hub', action: () => {
            closeModal();
            showLoadingScreen('Loading Collaboration Hub...', () => {
              router.push('/collaboration');
            });
        }, isPrimary: true },
      ]);
    });
  };

  const finalizeTeamJoin = () => {
    if (!joinUserName.trim()) {
      toast({ title: "Your Name is Required", description: "Please enter your name to join the team.", variant: "destructive" });
      joinTeam();
      return;
    }
    closeModal();
    showLoadingScreen('Verifying PIN and joining workspace...', () => {
      const teamNameToJoin = createdTeamDetails?.name || "the Team";
      toast({
        title: `✅ Welcome to ${teamNameToJoin}!`,
        description: `You have successfully joined the workspace, ${joinUserName}.`,
      });
      router.push('/collaboration');
    });
  };

  const showTeamDemo = () => {
    closeModal();
    toast({ title: "🎥 Team Demo", description: "Team collaboration demo would play here." });
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
    [{ text: 'Close', action: closeModal, variant: 'outline' }, {text: 'Contact Sales', action: () => { closeModal(); showContactForm(); }, isPrimary: true}]);
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

    