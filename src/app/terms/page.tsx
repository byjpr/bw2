export default function TermsPage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Terms of Service</h1>
      
      <div className="prose max-w-none">
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">1. Acceptance of Terms</h2>
          <p>
            By accessing or using this platform, you agree to be bound by these Terms of Service. 
            If you do not agree to all the terms and conditions, you may not access or use the platform.
          </p>
        </section>
        
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">2. Description of Service</h2>
          <p>
            The platform provides a community management system for local associations and their members.
            Services include member registration, association discovery, event management, and community communication.
          </p>
        </section>
        
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">3. User Accounts</h2>
          <p>
            To access certain features of the platform, you will need to register for an account. 
            You are responsible for maintaining the confidentiality of your account credentials and for all activities 
            that occur under your account.
          </p>
          <p>
            You agree to immediately notify us of any unauthorized use of your account or any other breach of security.
          </p>
        </section>
        
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">4. User Conduct</h2>
          <p>You agree not to:</p>
          <ul className="list-disc ml-6 mb-4">
            <li>Use the platform for any illegal purpose or in violation of any laws or regulations.</li>
            <li>Impersonate any person or entity, or falsely state or otherwise misrepresent your affiliation with a person or entity.</li>
            <li>Interfere with or disrupt the operation of the platform or servers or networks connected to the platform.</li>
            <li>Collect or store personal data about other users without their consent.</li>
            <li>Post or transmit any content that is unlawful, harmful, threatening, abusive, harassing, defamatory, vulgar, obscene, or otherwise objectionable.</li>
          </ul>
        </section>
        
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">5. Intellectual Property</h2>
          <p>
            The platform and its original content, features, and functionality are owned by the platform operators 
            and are protected by international copyright, trademark, patent, trade secret, and other intellectual 
            property or proprietary rights laws.
          </p>
        </section>
        
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">6. Termination</h2>
          <p>
            We may terminate or suspend your account and access to the platform immediately, without prior notice or liability, 
            for any reason, including, without limitation, if you breach these Terms of Service.
          </p>
        </section>
        
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">7. Limitation of Liability</h2>
          <p>
            In no event shall the platform operators, its directors, employees, partners, agents, suppliers, or affiliates, 
            be liable for any indirect, incidental, special, consequential or punitive damages, including without limitation, 
            loss of profits, data, use, goodwill, or other intangible losses, resulting from your access to or use of or 
            inability to access or use the platform.
          </p>
        </section>
        
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">8. Changes to Terms</h2>
          <p>
            We reserve the right, at our sole discretion, to modify or replace these Terms at any time. 
            If a revision is material, we will provide at least 30 days' notice prior to any new terms taking effect. 
            What constitutes a material change will be determined at our sole discretion.
          </p>
        </section>
        
        <section>
          <h2 className="text-2xl font-semibold mb-4">9. Contact Us</h2>
          <p>
            If you have any questions about these Terms, please contact us through the platform's feedback mechanism.
          </p>
        </section>
      </div>
    </div>
  );
}