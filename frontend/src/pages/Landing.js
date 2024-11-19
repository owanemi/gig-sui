import React from 'react';
import { Link } from 'react-router-dom';
import styles from '../styles/Landing.module.css';
import teamPhoto from '../assets/team_photo.jpg';
import logo from '../assets/transparent2.png';
import teamLead from '../assets/team_lead.jpg';
import commMan from '../assets/comm_man.jpg';
import leadDev from '../assets/lead_dev.jpg';
import techWriter from '../assets/tech_writer.jpg';
import graphicDesigner from '../assets/graphic_designer.jpg';


function Navbar() {
  return (
    <div className={styles['navbar-container']}>
      <div className={styles['left-stuff']}>
        <a href="#" className={styles['logo-link']}>
          <img src={logo} alt="GIG SUI" className={styles['logo']} />
        </a>
      </div>
      <div className={styles['middle-stuff']}>
        <a href="#team-section" className={styles['nav-link']}>MEET THE TEAM</a>
        <a href="#how-we-work" className={styles['nav-link']}>HOW WE WORK</a>
        <a href="#faq-section" className={styles['nav-link']}>FAQ</a>
      </div>
      <div className={styles['right-stuff']}>
        {/* <button className={styles['login-btn']}>Login</button> */}
        {/* <button className={styles['register-btn']}>Register</button> */}
      </div>
    </div>
  );
}

function HeroSection() {
    return (
      <div className={styles['hero-wrapper']}>
        <div className={styles['hero-section']}>
          <h1>The Future Of Work,</h1>
        </div>
        <div className={styles['hero-2']}>
          <h1>Decentralized</h1>
        </div>
        <div className={styles['tagline']}>
          <p>Building a decentralized gig economy on Sui blockchain</p>
        </div>
        <div className={styles['start-container']}>
        <Link to="/login">
          <button>GET STARTED</button>
        </Link>
        </div>
      </div>
    );
}  

function TeamSection() {
  return (
    <section id="team-section" className={styles['team-section']}>
      <h1>OUR COMMUNITY</h1>
      <div className={styles['team-photo-container']}>
        <img src={teamPhoto} alt="Our Team" />
      </div>
      <div className={styles['team-cards-container']}>
        {[
          { img: commMan, name: 'Ebing-Osowo Ntun', role: 'Team Lead', twitter: '@NtunEbing' },
          { img: leadDev, name: 'Owanemi Osaye-William', role: 'Developer', twitter: '@owanemi_' },
          { img: techWriter, name: 'Obukinose Aghogho Mboutidem', role: 'Technical Writer', twitter: '@aghoghobukinose' },
          { img: graphicDesigner, name: 'Memena Emmanuel', role: 'Graphic Designer', twitter: '@iconic_gfx' },
        ].map((member, index) => (
          <div key={index} className={styles['team-card']}>
            <img src={member.img} alt={member.role} />
            <div className={styles['team-card-content']}>
              <h3>{member.name}</h3>
              <p>{member.role}</p>
              <p className={styles['twitter']}>{member.twitter}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function WorkStepsSection() {
  return (
    <section id="how-we-work" className={styles['how-we-work-section']}>
      <h1>HOW WE WORK</h1>
      <div className={styles['work-steps-container']}>
        {[
          { step: '1', title: 'Create Your Profile', description: 'Sign up and build your professional profile. Showcase your skills, portfolio, and expertise in your field.' },
          { step: '2', title: 'Connect Your Wallet', description: 'Link your cryptocurrency wallet to receive secure payments through the Sui blockchain.' },
          { step: '3', title: 'Find or Post Gigs', description: 'Browse available projects or post your job requirements. Our smart matching system connects you with the right opportunities.' },
          { step: '4', title: 'Secure Collaboration', description: 'Work with confidence using our blockchain-based escrow system and transparent milestone tracking.' },
        ].map((step, index) => (
          <div key={index} className={styles['work-step']}>
            <div className={styles['step-number']}>{step.step}</div>
            <div className={styles['step-content']}>
              <h3>{step.title}</h3>
              <p>{step.description}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function FaqSection() {
  const faqItems = [
    { question: 'What is GIG SUI?', answer: 'GIG SUI is a decentralized platform built on the Sui blockchain that connects freelancers with clients worldwide. Our platform enables secure, transparent, and efficient gig economy transactions without traditional intermediaries.' },
    { question: 'How does payment work on GIG SUI?', answer: 'Payments on GIG SUI are handled through smart contracts on the Sui blockchain. When a gig is completed, the payment is automatically released from escrow to the freelancer.' },
    { question: 'What types of jobs can I find or post on GIG SUI?', answer: 'GIG SUI supports a wide range of digital services including software development, graphic design, content writing, and more.' },
    { question: 'How do you ensure quality and trust?', answer: 'We maintain quality through our reputation system built on blockchain technology.' },
    { question: 'What are the fees for using GIG SUI?', answer: 'GIG SUI charges a minimal platform fee compared to traditional freelance platforms. Exact fees depend on the service type and transaction size.' },
  ];

  const toggleFaq = (index) => {
    document.getElementsByClassName(styles['faq-item'])[index].classList.toggle(styles['active']);
  };

  return (
    <section id="faq-section" className={styles['faq-section']}>
      <h1>FREQUENTLY ASKED QUESTIONS</h1>
      <div className={styles['faq-container']}>
        {faqItems.map((item, index) => (
          <div key={index} className={styles['faq-item']} onClick={() => toggleFaq(index)}>
            <div className={styles['faq-question']}>{item.question}</div>
            <div className={styles['faq-answer']}>{item.answer}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default function LandingPage() {
  return (
    <div>
      <Navbar />
      <HeroSection />
      <TeamSection />
      <WorkStepsSection />
      <FaqSection />
    </div>
  );
}
