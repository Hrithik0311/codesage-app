
'use client';

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


const HomePageClient: React.FC = () => {
  const { toast } = useToast();
  const router = useRouter();

  const [modalView, setModalView] = useState<string | null>(null);

  const [loadingState, setLoadingState] = useState({ isVisible: false, message: '' });

  const [newTeamName, setNewTeamName] = useState('');
  const [newTeamMembers, setNewTeamMembers] = useState('');
  const [joinUserName, setJoinUserName] = useState('');
  const [joinTeamPin, setJoinTeamPin] = useState('');
  const [createdTeamDetails, setCreatedTeamDetails] = useState<{name: string, pin: string} | null>(null);

  const showLoadingScreen = (message: string, callback: () => void, duration: number = 2000) => {
    setLoadingState({ isVisible: true, message });
    setTimeout(() => {
      setModalView(null);
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
  
  const handleCtaClick = () => setModalView('launch');

  const handleFeatureClick = (feature: string) => {
    if (feature === 'learning') router.push('/learning');
    else if (feature === 'analysis') router.push('/code-intelligence');
    else if (feature === 'collaboration') setModalView('collaboration');
  };

  const finalizeTeamCreation = () => {
    if (!newTeamName.trim()) {
      toast({ title: "Team Name Required", description: "Please enter a name for your team.", variant: "destructive" });
      return;
    }
    const newPin = Math.floor(100000 + Math.random() * 900000).toString();
    setCreatedTeamDetails({ name: newTeamName, pin: newPin });
    showLoadingScreen('Generating your secure workspace...', () => {
      setModalView('teamCreated');
    });
  };

  const finalizeTeamJoin = () => {
    if (!joinUserName.trim()) {
      toast({ title: "Your Name is Required", description: "Please enter your name to join the team.", variant: "destructive" });
      return;
    }
     if (joinTeamPin.length !== 6) {
      toast({ title: "Invalid PIN", description: "Please enter the 6-digit PIN.", variant: "destructive" });
      return;
    }
    showLoadingScreen('Verifying PIN and joining workspace...', () => {
      const teamNameToJoin = "The RoboKnights"; // In a real app, this would be looked up
      toast({
        title: `✅ Welcome to ${teamNameToJoin}!`,
        description: `You have successfully joined the workspace, ${joinUserName}.`,
      });
      router.push('/collaboration');
    });
  };
  
  const goToCollaborationHub = () => {
      showLoadingScreen('Loading Collaboration Hub...', () => {
        router.push('/collaboration');
      });
  };

  const showContactForm = () => {
      setModalView('contact');
  };

  const sendContactMessage = () => {
    showLoadingScreen("Sending your message...", () => {
        toast({ title: "📬 Message Sent!", description: "We'll get back to you shortly." });
    });
  };


  let modalTitle = '';
  let modalContent: React.ReactNode = null;
  let modalButtons: ModalButton[] = [];

  switch (modalView) {
      case 'launch':
        modalTitle = 'Launch Platform';
        modalContent = (
          <div className="text-left space-y-4">
            <h3 className="text-xl font-semibold font-headline text-foreground">🚀 Welcome to CodeSage Professional</h3>
            <p className="text-foreground/80">This is a demo. Feature pages are available via the main page.</p>
          </div>
        );
        modalButtons = [{ text: 'Close', action: () => setModalView(null), variant: 'outline' }];
        break;

      case 'collaboration':
        modalTitle = 'Welcome to the Hub';
        modalContent = (
          <div className="text-center space-y-6">
            <Users className="w-16 h-16 text-accent mx-auto" />
            <h3 className="text-2xl font-semibold font-headline text-foreground">Team Collaboration Hub</h3>
            <p className="text-foreground/80 max-w-md mx-auto">
              Create a secure workspace to build with your team, or join an existing project using a team PIN.
            </p>
          </div>
        );
        modalButtons = [
          { text: 'Create New Team', action: () => setModalView('createTeam'), variant: 'outline', className: 'w-full sm:w-auto' },
          { text: 'Join Existing Team', action: () => setModalView('joinTeam'), isPrimary: true, className: 'w-full sm:w-auto' },
        ];
        break;

      case 'createTeam':
        modalTitle = 'Create Team Workspace';
        modalContent = (
          <div className="space-y-4 text-left">
            <h3 className="text-xl font-semibold font-headline text-foreground flex items-center gap-2"><PlusCircle className="text-accent" /> Create a New Team</h3>
            <p className="text-foreground/80">Fill in your team's details to generate a new workspace and a unique PIN for members to join.</p>
            <form className="space-y-4 pt-2">
              <div>
                <label htmlFor="teamName" className="block text-sm font-medium text-foreground/80 mb-1">Team Name</label>
                <Input id="teamName" placeholder="e.g., The RoboKnights" value={newTeamName} onChange={(e) => setNewTeamName(e.target.value)} />
              </div>
              <div>
                <label htmlFor="teamMembers" className="block text-sm font-medium text-foreground/80 mb-1">Team Members (comma-separated)</label>
                <Textarea id="teamMembers" placeholder="e.g., Alex, Maria, Sam" value={newTeamMembers} onChange={(e) => setNewTeamMembers(e.target.value)} rows={3}/>
              </div>
            </form>
          </div>
        );
        modalButtons = [
          { text: 'Cancel', action: () => setModalView('collaboration'), variant: 'ghost' },
          { text: 'Generate Team PIN', action: finalizeTeamCreation, isPrimary: true },
        ];
        break;
        
      case 'joinTeam':
        modalTitle = 'Join Team Workspace';
        modalContent = (
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
                <Input id="teamCode" placeholder="______" className="text-center text-2xl font-mono tracking-[0.5em]" maxLength={6} value={joinTeamPin} onChange={(e) => setJoinTeamPin(e.target.value.replace(/\D/g, ''))} />
              </div>
            </div>
          </div>
        );
        modalButtons = [
          { text: 'Cancel', action: () => setModalView('collaboration'), variant: 'ghost' },
          { text: 'Join Team', action: finalizeTeamJoin, isPrimary: true },
        ];
        break;
        
      case 'teamCreated':
        modalTitle = `Team "${createdTeamDetails?.name}" Created`;
        modalContent = (
            <div className="text-center space-y-4">
              <Shield className="w-16 h-16 text-green-500 mx-auto" />
              <h3 className="text-2xl font-semibold font-headline text-foreground">Workspace for "{createdTeamDetails?.name}" Created!</h3>
              <p className="text-foreground/80">Share this secure PIN with your team members so they can join.</p>
              <div className="bg-muted p-4 rounded-lg">
                <p className="text-sm text-muted-foreground">Your Team PIN is:</p>
                <p className="text-4xl font-bold font-mono tracking-widest text-primary">{createdTeamDetails?.pin}</p>
              </div>
              <p className="text-xs text-muted-foreground pt-2">You will be redirected to your new collaboration hub.</p>
            </div>
        );
        modalButtons = [{ text: 'Go to Collaboration Hub', action: goToCollaborationHub, isPrimary: true }];
        break;

      case 'enterprise':
        modalTitle = '🏢 Enterprise Solutions';
        modalContent = (
          <div className="text-left space-y-3">
              <p className="text-foreground/80">CodeSage offers tailored solutions for large organizations and educational institutions.</p>
              <ul className="list-disc list-inside space-y-1 text-foreground/90">
                  <li>Custom feature sets</li>
                  <li>On-premise deployment options</li>
                  <li>Dedicated support and SLAs</li>
                  <li>Advanced analytics and reporting</li>
              </ul>
              <p className="text-foreground/80">Contact us to learn more about how CodeSage can empower your entire organization.</p>
          </div>
        );
        modalButtons = [
            { text: 'Close', action: () => setModalView(null), variant: 'outline' },
            { text: 'Contact Sales', action: () => setModalView('contact'), isPrimary: true }
        ];
        break;
    
    case 'contact':
        modalTitle = '📞 Contact Us';
        modalContent = (
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
                    <Textarea id="contactMessage" rows={4} placeholder="Your inquiry..."></Textarea>
                </div>
            </form>
        );
        modalButtons = [
            { text: 'Cancel', action: () => setModalView(null), variant: 'outline' },
            { text: 'Send Message', action: sendContactMessage, isPrimary: true },
        ];
        break;
  }


  const [pageLoaded, setPageLoaded] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => setPageLoaded(true), 100); 
    return () => clearTimeout(timer);
  }, []);


  return (
    <div className={`transition-opacity duration-500 ease-in-out ${pageLoaded ? 'opacity-100' : 'opacity-0'}`}>
      <Navbar 
        onEnterpriseClick={() => setModalView('enterprise')}
        onContactClick={() => setModalView('contact')}
        onPlatformClick={() => scrollToSection('features')}
        onFeaturesClick={() => scrollToSection('stats')}
      />
      <HeroSection onCtaClick={handleCtaClick} />
      <FeaturesSection onFeatureClick={handleFeatureClick} />
      <StatsSection />
      <Footer />
      <CodeSageModal
        isOpen={modalView !== null}
        onClose={() => setModalView(null)}
        title={modalTitle}
        buttons={modalButtons}
      >
        {modalContent}
      </CodeSageModal>
      <LoadingIndicator isVisible={loadingState.isVisible} message={loadingState.message} />
    </div>
  );
};

export default HomePageClient;
